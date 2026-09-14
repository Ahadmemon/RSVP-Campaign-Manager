import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './db.js';
import Campaign from './models/Campaign.js';
import Invitee from './models/Invitee.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB Atlas on startup
connectDB();

// Recalculate campaign stat counters from live DB
const recalculateStats = async (campaignId) => {
  const counts = await Invitee.aggregate([
    { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = { totalInvitees: 0, confirmed: 0, declined: 0, undecided: 0, pending: 0, failed: 0 };
  counts.forEach((item) => {
    const s = item._id.toLowerCase();
    if (stats[s] !== undefined) stats[s] = item.count;
    stats.totalInvitees += item.count;
  });

  await Campaign.findByIdAndUpdate(campaignId, { stats });
  return stats;
};

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    status: 'healthy',
    mode: state === 1 ? 'MongoDB Live' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /api/campaigns ───────────────────────────────────────────────────────
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    // Refresh stats for each campaign
    for (const c of campaigns) {
      await recalculateStats(c._id);
    }
    const updated = await Campaign.find().sort({ createdAt: -1 });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/campaigns/:id ───────────────────────────────────────────────────
app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await recalculateStats(id);
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/campaigns ──────────────────────────────────────────────────────
app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, eventDate, location, description } = req.body;
    if (!name || !eventDate || !location) {
      return res.status(400).json({ success: false, error: 'Name, eventDate, and location are required' });
    }
    const campaign = new Campaign({
      name,
      eventDate: new Date(eventDate),
      location,
      description: description || '',
      status: 'DRAFT',
    });
    await campaign.save();
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/invitees ────────────────────────────────────────────────────────
app.get('/api/invitees', async (req, res) => {
  try {
    const { campaignId, search, status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (campaignId) query.campaignId = campaignId;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Invitee.countDocuments(query);
    const invitees = await Invitee.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: invitees,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/invitees/upload ────────────────────────────────────────────────
app.post('/api/invitees/upload', async (req, res) => {
  try {
    const { campaignId, invitees } = req.body;
    if (!campaignId || !Array.isArray(invitees)) {
      return res.status(400).json({ success: false, error: 'campaignId and invitees array are required' });
    }

    const e164Regex = /^\+[1-9]\d{1,14}$/;
    const validRows = [];
    const invalidRows = [];

    invitees.forEach((row, index) => {
      let rawPhone = (row.phone || '').trim();
      if (rawPhone && !rawPhone.startsWith('+')) {
        rawPhone = '+' + rawPhone.replace(/\D/g, '');
      }
      if (!row.name || !e164Regex.test(rawPhone)) {
        invalidRows.push({ rowNumber: index + 1, data: row, reason: 'Invalid E.164 phone or missing name' });
      } else {
        validRows.push({
          name: row.name.trim(),
          phone: rawPhone,
          email: (row.email || '').trim(),
          campaignId,
          status: 'PENDING',
        });
      }
    });

    // Deduplicate by phone within payload
    const uniqueMap = new Map();
    validRows.forEach((item) => uniqueMap.set(item.phone, item));
    const deduped = Array.from(uniqueMap.values());

    if (deduped.length > 0) {
      const ops = deduped.map((item) => ({
        updateOne: {
          filter: { campaignId: item.campaignId, phone: item.phone },
          update: { $setOnInsert: item },
          upsert: true,
        },
      }));
      await Invitee.bulkWrite(ops);
    }

    const updatedStats = await recalculateStats(campaignId);

    res.json({
      success: true,
      insertedCount: deduped.length,
      rejectedCount: invalidRows.length + (validRows.length - deduped.length),
      invalidRows,
      stats: updatedStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── PATCH /api/invitees/:id ──────────────────────────────────────────────────
app.patch('/api/invitees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const invitee = await Invitee.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!invitee) return res.status(404).json({ success: false, error: 'Invitee not found' });
    await recalculateStats(invitee.campaignId);
    res.json({ success: true, data: invitee });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Simulated AI Call Generator ──────────────────────────────────────────────
const generateSimulatedCall = (inviteeName, campaignName) => {
  const outcomes = [
    {
      status: 'CONFIRMED',
      disposition: 'CONFIRMED_RSVP',
      duration: Math.floor(Math.random() * 30) + 30,
      transcript: [
        { speaker: 'AI_AGENT', text: `Hello ${inviteeName}! Calling from GlobalVox regarding your invitation to ${campaignName}. Will you be able to attend?`, timestamp: new Date() },
        { speaker: 'INVITEE', text: `Hi! Yes, I would love to attend. Please register me.`, timestamp: new Date(Date.now() + 10000) },
        { speaker: 'AI_AGENT', text: `Wonderful! I have confirmed your RSVP for ${campaignName}. Confirmation details will be emailed shortly. Have a great day!`, timestamp: new Date(Date.now() + 20000) },
      ],
    },
    {
      status: 'DECLINED',
      disposition: 'DECLINED_RSVP',
      duration: Math.floor(Math.random() * 20) + 20,
      transcript: [
        { speaker: 'AI_AGENT', text: `Hello ${inviteeName}, I am calling from GlobalVox about ${campaignName}.`, timestamp: new Date() },
        { speaker: 'INVITEE', text: `Thank you for the invitation, but I have a prior conflict on that date and cannot make it.`, timestamp: new Date(Date.now() + 8000) },
        { speaker: 'AI_AGENT', text: `Thank you for letting us know! I have updated your response to Declined. We hope to see you at our next event.`, timestamp: new Date(Date.now() + 15000) },
      ],
    },
    {
      status: 'UNDECIDED',
      disposition: 'MAYBE_RSVP',
      duration: Math.floor(Math.random() * 25) + 25,
      transcript: [
        { speaker: 'AI_AGENT', text: `Hi ${inviteeName}, this is the GlobalVox Event Concierge following up on ${campaignName}.`, timestamp: new Date() },
        { speaker: 'INVITEE', text: `I am still finalizing travel plans. Can you mark me as tentative for now?`, timestamp: new Date(Date.now() + 12000) },
        { speaker: 'AI_AGENT', text: `Certainly! I have marked your response as Undecided and will follow up next week.`, timestamp: new Date(Date.now() + 22000) },
      ],
    },
    {
      status: 'FAILED',
      disposition: 'NO_ANSWER_VOICEMAIL',
      duration: 10,
      transcript: [
        { speaker: 'SYSTEM', text: 'Call placed to carrier network. Reached automated voicemail after 4 rings.', timestamp: new Date() },
      ],
    },
  ];

  // Weighted distribution: 50% Confirmed, 25% Declined, 15% Undecided, 10% Failed
  const rand = Math.random();
  if (rand < 0.50) return outcomes[0];
  if (rand < 0.75) return outcomes[1];
  if (rand < 0.90) return outcomes[2];
  return outcomes[3];
};

// ─── POST /api/campaigns/:id/start ───────────────────────────────────────────
app.post('/api/campaigns/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerExternalTring = false } = req.body;

    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const pendingInvitees = await Invitee.find({
      $or: [{ campaignId: id }, { campaignId: new mongoose.Types.ObjectId(id) }],
      status: 'PENDING',
    });

    if (pendingInvitees.length === 0) {
      return res.json({ success: true, message: 'No pending invitees to call.', processedCount: 0 });
    }

    await Campaign.findByIdAndUpdate(id, { status: 'ACTIVE' });

    const results = [];
    for (const invitee of pendingInvitees) {
      const sim = generateSimulatedCall(invitee.name, campaign.name);
      const callId = 'call_sim_' + Math.random().toString(36).substring(2, 9);

      if (triggerExternalTring) {
        fetch('https://api.tringtring.ai/api/zapier/actions/outbound-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: invitee.phone,
            contact_name: invitee.name,
            campaign_name: campaign.name,
            event_date: campaign.eventDate,
            location: campaign.location,
            callback_url: `https://${req.get('host')}/api/webhooks/call-status`,
            external_id: invitee._id,
          }),
        }).catch((err) => console.log('TringTring dispatch note:', err.message));
      }

      await Invitee.findByIdAndUpdate(invitee._id, {
        status: sim.status,
        disposition: sim.disposition,
        callDuration: sim.duration,
        callId,
        lastCalledAt: new Date(),
        transcript: sim.transcript,
      });

      results.push({ inviteeId: invitee._id, name: invitee.name, phone: invitee.phone, status: sim.status });
    }

    const newStats = await recalculateStats(id);

    res.json({
      success: true,
      message: `Successfully executed RSVP calling for ${pendingInvitees.length} invitees.`,
      processedCount: pendingInvitees.length,
      results,
      stats: newStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/webhooks/call-status ──────────────────────────────────────────
app.post('/api/webhooks/call-status', async (req, res) => {
  try {
    const { invitee_id, call_id, disposition, duration, transcript, status } = req.body;
    if (!invitee_id) return res.status(400).json({ success: false, error: 'invitee_id is required' });

    let mappedStatus = 'UNDECIDED';
    if (status === 'CONFIRMED' || disposition === 'CONFIRMED_RSVP') mappedStatus = 'CONFIRMED';
    else if (status === 'DECLINED' || disposition === 'DECLINED_RSVP') mappedStatus = 'DECLINED';
    else if (status === 'FAILED' || disposition?.includes('BUSY') || disposition?.includes('FAILED')) mappedStatus = 'FAILED';

    const invitee = await Invitee.findById(invitee_id);
    if (!invitee) return res.status(404).json({ success: false, error: 'Invitee not found' });

    invitee.status = mappedStatus;
    if (call_id) invitee.callId = call_id;
    if (disposition) invitee.disposition = disposition;
    if (duration) invitee.callDuration = Number(duration);
    invitee.lastCalledAt = new Date();
    if (Array.isArray(transcript)) invitee.transcript = transcript;

    await invitee.save();
    await recalculateStats(invitee.campaignId);

    res.json({ success: true, message: 'Webhook processed', data: invitee });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Local Dev Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Express] Running on http://localhost:${PORT}`);
    console.log(`[MongoDB] Connecting to Atlas...`);
  });
}

export default app;
