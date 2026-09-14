import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Download, ShieldCheck } from 'lucide-react';

export default function CSVUploader({ isOpen, onClose, onUploadSuccess, campaignId }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndProcess = (rawRows) => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    const valids = [];
    const invalids = [];
    const phoneSeen = new Set();

    rawRows.forEach((row, idx) => {
      // Flexible column key matching
      const name = (row.name || row.Name || row['Full Name'] || row.contact_name || '').trim();
      let phone = (row.phone || row.Phone || row['Phone Number'] || row.mobile || '').trim();
      const email = (row.email || row.Email || row['Email Address'] || '').trim();

      if (phone && !phone.startsWith('+')) {
        phone = '+' + phone.replace(/\D/g, '');
      }

      if (!name) {
        invalids.push({ rowNumber: idx + 1, name, phone, email, reason: 'Missing contact name' });
      } else if (!phone || !e164Regex.test(phone)) {
        invalids.push({ rowNumber: idx + 1, name, phone, email, reason: 'Invalid E.164 phone format (e.g. +14155552671)' });
      } else if (phoneSeen.has(phone)) {
        invalids.push({ rowNumber: idx + 1, name, phone, email, reason: 'Duplicate phone number in CSV' });
      } else {
        phoneSeen.add(phone);
        valids.push({ name, phone, email });
      }
    });

    setValidRows(valids);
    setInvalidRows(invalids);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) parseCSV(selectedFile);
  };

  const parseCSV = (fileObj) => {
    setFile(fileObj);
    setErrorMsg(null);

    Papa.parse(fileObj, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
          validateAndProcess(results.data);
        } else {
          setErrorMsg('CSV file is empty or invalid header structure.');
        }
      },
      error: (err) => {
        setErrorMsg('Error parsing CSV file: ' + err.message);
      },
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSV(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (validRows.length === 0) return;
    setUploading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/invitees/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          invitees: validRows,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onUploadSuccess(data);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to upload invitees.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = 'Name,Phone,Email\nDr. Aris Thorne,+14155552671,athorne@nexusai.io\nElena Rostova,+14155558832,elena@quantumscale.tech\nMarcus Vance,+12125559041,mvance@vanguardcapital.com';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'globalvox_rsvp_invitees_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-900/95 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Upload Invitees CSV</h2>
              <p className="text-xs text-slate-400">Bulk import contacts with E.164 phone validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Dropzone */}
          {!file && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[0.99]'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-slate-200 mb-1">
                Drag and drop your CSV file here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Required columns: <code className="text-indigo-300 font-mono">Name</code>, <code className="text-indigo-300 font-mono">Phone</code> (E.164 e.g. +14155552671), <code className="text-slate-400 font-mono">Email</code>
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSampleCSV();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                Download Sample Template (.csv)
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {errorMsg}
            </div>
          )}

          {/* Processing Summary */}
          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{file.name}</div>
                    <div className="text-xs text-slate-400">{parsedData.length} rows parsed</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    setValidRows([]);
                    setInvalidRows([]);
                  }}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Validation Status Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">Valid E.164 Rows</span>
                  </div>
                  <span className="text-sm font-bold">{validRows.length}</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold">Invalid / Rejected</span>
                  </div>
                  <span className="text-sm font-bold">{invalidRows.length}</span>
                </div>
              </div>

              {/* Invalid Rows Table */}
              {invalidRows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    Invalid Format Breakdown ({invalidRows.length} rows skipped)
                  </div>
                  <div className="max-h-36 overflow-y-auto rounded-xl border border-rose-500/20 bg-rose-950/20 p-2 text-xs space-y-1">
                    {invalidRows.map((inv, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300 py-1 border-b border-rose-500/10 last:border-0">
                        <span>Row #{inv.rowNumber}: {inv.name || 'Unnamed'} ({inv.phone || 'No phone'})</span>
                        <span className="text-rose-400 font-medium text-[11px]">{inv.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table of Valid Rows */}
              {validRows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Ready to import ({validRows.length} contacts)
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-xs">
                    {validRows.slice(0, 5).map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800/60 last:border-0">
                        <span className="font-medium text-slate-200">{v.name}</span>
                        <span className="font-mono text-indigo-400">{v.phone}</span>
                        <span className="text-slate-400 truncate max-w-[150px]">{v.email || 'N/A'}</span>
                      </div>
                    ))}
                    {validRows.length > 5 && (
                      <div className="text-center py-1.5 text-[11px] text-slate-500 italic">
                        ...and {validRows.length - 5} more valid rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={validRows.length === 0 || uploading}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              validRows.length === 0 || uploading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
          >
            {uploading ? 'Importing Batch...' : `Import ${validRows.length} Valid Invitees`}
          </button>
        </div>
      </div>
    </div>
  );
}
