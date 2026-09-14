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

// In-Memory Fallback Store (used when MongoDB is not connected)
const inMemoryStore = {
  campaigns: [
    {
      _id: '65d4f1000000000000000001',
      name: 'GlobalVox Tech Summit 2026',
      eventDate: new Date('2026-10-15T09:00:00.000Z'),
      location: 'San Francisco Convention Center, CA',
      description: 'Annual AI & Enterprise Architecture Leadership Summit',
      status: 'ACTIVE',
      stats: { totalInvitees: 8, confirmed: 3, declined: 2, undecided: 1, pending: 1, failed: 1 },
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
    },
    {
      _id: '65d4f1000000000000000002',
      name: 'GlobalVox Executive Gala Dinner',
      eventDate: new Date('2026-11-20T18:30:00.000Z'),
      location: 'The Ritz-Carlton, New York, NY',
      description: 'Exclusive VIP Executive RSVP Campaign',
      status: 'DRAFT',
      stats: { totalInvitees: 4, confirmed: 1, declined: 0, undecided: 0, pending: 3, failed: 0 },
      createdAt: new Date('2026-09-10T14:00:00.000Z'),
    },
  ],
  invitees: [
    {
      _id: '65d4f2000000000000000101',
      campaignId: '65d4f1000000000000000001',
      name: 'Dr. Aris Thorne',
      phone: '+14155552671',
      email: 'athorne@nexusai.io',
      status: 'CONFIRMED',
      callDuration: 48,
      callId: 'call_live_99812',
      disposition: 'CONFIRMED_RSVP',
      lastCalledAt: new Date('2026-09-14T09:12:00.000Z'),
      transcript: [
        { speaker: 'AI_AGENT', text: 'Hello Dr. Aris Thorne! I am calling from GlobalVox regarding your invitation to the GlobalVox Tech Summit 2026 on October 15th in San Francisco. Are you planning to join us?', timestamp: new Date('2026-09-14T09:12:05.000Z') },
        { speaker: 'INVITEE', text: 'Hi! Yes absolutely, I have it on my calendar. Looking forward to presenting the AI keynote.', timestamp: new Date('2026-09-14T09:12:15.000Z') },
        { speaker: 'AI_AGENT', text: 'Fantastic! I have marked your RSVP as Confirmed. Will you require VIP parking assistance at the venue?', timestamp: new Date('2026-09-14T09:12:22.000Z') },
        { speaker: 'INVITEE', text: 'Yes please, that would be very helpful. Thank you!', timestamp: new Date('2026-09-14T09:12:35.000Z') },
        { speaker: 'AI_AGENT', text: 'Recorded. We look forward to welcoming you at the Summit!', timestamp: new Date('2026-09-14T09:12:40.000Z') },
      ],
    },
    {
      _id: '65d4f2000000000000000102',
      campaignId: '65d4f1000000000000000001',
      name: 'Elena Rostova',
      phone: '+14155558832',
      email: 'elena@quantumscale.tech',
      status: 'CONFIRMED',
      callDuration: 35,
      callId: 'call_live_99813',
      disposition: 'CONFIRMED_RSVP',
      lastCalledAt: new Date('2026-09-14T09:15:00.000Z'),
      transcript: [
        { speaker: 'AI_AGENT', text: 'Good morning Elena. This is the GlobalVox Event Concierge calling to confirm your attendance at the Tech Summit on October 15th.', timestamp: new Date('2026-09-14T09:15:05.000Z') },
        { speaker: 'INVITEE', text: 'Hello! Yes, I will be attending with two colleagues.', timestamp: new Date('2026-09-14T09:15:18.000Z') },
        { speaker: 'AI_AGENT', text: 'Wonderful! Your attendance is confirmed. Have a great day!', timestamp: new Date('2026-09-14T09:15:30.000Z') },
      ],
    },
    {
      _id: '65d4f2000000000000000103',
      campaignId: '65d4f1000000000000000001',
      name: 'Marcus Vance',
      phone: '+12125559041',
      email: 'mvance@vanguardcapital.com',
      status: 'DECLINED',
      callDuration: 28,
      callId: 'call_live_99814',
      disposition: 'DECLINED_RSVP',
      lastCalledAt: new Date('2026-09-14T09:18:00.000Z'),
      transcript: [
        { speaker: 'AI_AGENT', text: 'Hello Marcus. I am reaching out from GlobalVox regarding the October 15th Tech Summit in San Francisco.', timestamp: new Date('2026-09-14T09:18:05.000Z') },
        { speaker: 'INVITEE', text: 'Thanks for reaching out. Unfortunately I will be out of the country during that week, so I must decline.', timestamp: new Date('2026-09-14T09:18:18.000Z') },
        { speaker: 'AI_AGENT', text: 'Understood. We will miss you this year! I have updated your status to Declined.', timestamp: new Date('2026-09-14T09:18:25.000Z') },
      ],
    },
    {
      _id: '65d4f2000000000000000104',
      campaignId: '65d4f1000000000000000001',
      name: 'Sarah Chen',
      phone: '+14155554321',
      email: 'sarah.chen@synapse.ai',
      status: 'UNDECIDED',
      callDuration: 42,
      callId: 'call_live_99815',
      disposition: 'MAYBE_RSVP',
      lastCalledAt: new Date('2026-09-14T09:22:00.000Z'),
      transcript: [
        { speaker: 'AI_AGENT', text: 'Hi Sarah, calling from GlobalVox regarding the Tech Summit on October 15th.', timestamp: new Date('2026-09-14T09:22:04.000Z') },
        { speaker: 'INVITEE', text: 'Hey! I am still checking my schedule with my director. Can I confirm by next Monday?', timestamp: new Date('2026-09-14T09:22:20.000Z') },
        { speaker: 'AI_AGENT', text: 'Of course! I have noted your status as Undecided and will follow up next week.', timestamp: new Date('2026-09-14T09:22:35.000Z') },
      ],
    },
    {
      _id: '65d4f2000000000000000105',
      campaignId: '65d4f1000000000000000001',
      name: 'David Miller',
      phone: '+13125557712',
      email: 'dmiller@apexsystems.com',
      status: 'CONFIRMED',
      callDuration: 30,
      callId: 'call_live_99816',
      disposition: 'CONFIRMED_RSVP',
      lastCalledAt: new Date('2026-09-14T09:25:00.000Z'),
      transcript: [
        { speaker: 'AI_AGENT', text: 'Hello David! Calling from GlobalVox for your RSVP to the Tech Summit 2026.', timestamp: new Date('2026-09-14T09:25:03.000Z') },
        { speaker: 'INVITEE', text: 'Yes, count me in! Flights are already booked.', timestamp: new Date('2026-09-14T09:25:15.000Z') },
        { speaker: 'AI_AGENT', text: 'Great! RSVP is confirmed. See you in San Francisco!', timestamp: new Date('2026-09-14T09:25:25.000Z') },
      ],
    },
    {
      _id: '65d4f2000000000000000106',
      campaignId: '65d4f1000000000000000001',
      name: 'Jessica Taylor',
      phone: '+12065551982',
      email: 'jtaylor@cloudscale.net',
      status: 'PENDING',
      callDuration: 0,
      callId: null,
      disposition: null,
      lastCalledAt: null,
      transcript: [],
    },
    {
      _id: '65d4f2000000000000000107',
      campaignId: '65d4f1000000000000000001',
      name: 'Robert King',
      phone: '+13055556621',
      email: 'rking@horizonventures.com',
      status: 'DECLINED',
      callDuration: 22,
      callId: 'call_live_99817',
      disposition: 'DECLINED_RSVP',
      lastCalledAt: new Date('2026-09-14T09:30:00.000Z'),
      transcript: [
        { speaker: 'AI_AGENT', text: 'Hi Robert, GlobalVox RSVP call for October 15th.', timestamp: new Date('2026-09-14T09:30:02.000Z') },
        { speaker: 'INVITEE', text: 'Sorry, I have a board meeting that day.', timestamp: new Date('2026-09-14T09:30:12.000Z') },
        { speaker: 'AI_AGENT', text: 'Understood. Marked as Declined.', timestamp: new Date('2026-09-14T09:30:18.000Z') },
      ],
    },
    {
      _id: '65d4f2000000000000000108',
      campaignId: '65d4f1000000000000000001',
      name: 'Amara Okafor',
      phone: '+14085559900',
      email: 'amara@innovate.org',
      status: 'FAILED',
      callDuration: 5,
      callId: 'call_live_99818',
      disposition: 'NO_ANSWER_BUSY',
      lastCalledAt: new Date('2026-09-14T09:35:00.000Z'),
      transcript: [
        { speaker: 'SYSTEM', text: 'Call initiated. Line returned busy / unreachable.', timestamp: new Date('2026-09-14T09:35:05.000Z') },
      ],
    },
  ],
};

// Recalculate campaign stat counters helper
const recalculateStats = async (campaignId, isDbConnected) => {
  if (isDbConnected) {
    const counts = await Invitee.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = { totalInvitees: 0, confirmed: 0, declined: 0, undecided: 0, pending: 0, failed: 0 };
    counts.forEach((item) => {
      const s = item._id.toLowerCase();
      if (stats[s] !== undefined) {
        stats[s] = item.count;
      }
      stats.totalInvitees += item.count;
    });

    await Campaign.findByIdAndUpdate(campaignId, { stats });
    return stats;
  } else {
    const invitees = inMemoryStore.invitees.filter((i) => i.campaignId === campaignId);
    const stats = { totalInvitees: invitees.length, confirmed: 0, declined: 0, undecided: 0, pending: 0, failed: 0 };
    invitees.forEach((i) => {
      const s = i.status.toLowerCase();
      if (stats[s] !== undefined) {
        stats[s]++;
      }
    });
    const campaign = inMemoryStore.campaigns.find((c) => c._id === campaignId);
    if (campaign) {
      campaign.stats = stats;
    }
    return stats;
  }
};

// Utility to check DB availability
const checkDB = async () => {
  try {
    const conn = await connectDB();
    return !!(conn && (conn.readyState === 1 || conn.connection?.readyState === 1));
  } catch (err) {
    return false;
  }
};

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await checkDB();
  res.json({
    status: 'healthy',
    mode: dbConnected ? 'MongoDB Live' : 'In-Memory Demo Engine',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/campaigns - Fetch all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const dbConnected = await checkDB();
    if (dbConnected) {
      const campaigns = await Campaign.find().sort({ createdAt: -1 });
      for (const c of campaigns) {
        await recalculateStats(c._id, true);
      }
      const updatedCampaigns = await Campaign.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: updatedCampaigns });
    }
    return res.json({ success: true, data: inMemoryStore.campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/campaigns/:id - Fetch single campaign detail with recalculated stats
app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbConnected = await checkDB();

    if (dbConnected) {
      await recalculateStats(id, true);
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }
      return res.json({ success: true, data: campaign });
    } else {
      await recalculateStats(id, false);
      const campaign = inMemoryStore.campaigns.find((c) => c._id === id);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }
      return res.json({ success: true, data: campaign });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns - Create a new campaign
app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, eventDate, location, description } = req.body;
    if (!name || !eventDate || !location) {
      return res.status(400).json({ success: false, error: 'Name, eventDate, and location are required' });
    }

    const dbConnected = await checkDB();
    if (dbConnected) {
      const campaign = new Campaign({
        name,
        eventDate: new Date(eventDate),
        location,
        description: description || '',
        status: 'DRAFT',
      });
      await campaign.save();
      return res.status(201).json({ success: true, data: campaign });
    } else {
      const newCampaign = {
        _id: '65d4f1000000000000000' + (inMemoryStore.campaigns.length + 10).toString(),
        name,
        eventDate: new Date(eventDate),
        location,
        description: description || '',
        status: 'DRAFT',
        stats: { totalInvitees: 0, confirmed: 0, declined: 0, undecided: 0, pending: 0, failed: 0 },
        createdAt: new Date(),
      };
      inMemoryStore.campaigns.unshift(newCampaign);
      return res.status(201).json({ success: true, data: newCampaign });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/invitees - Query invitees filtered by campaignId, search, status, pagination
app.get('/api/invitees', async (req, res) => {
  try {
    const { campaignId, search, status, page = 1, limit = 50 } = req.query;
    const dbConnected = await checkDB();

    if (dbConnected) {
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

      return res.json({
        success: true,
        data: invitees,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
      });
    } else {
      let filtered = inMemoryStore.invitees;
      if (campaignId) filtered = filtered.filter((i) => i.campaignId === campaignId);
      if (status && status !== 'ALL') filtered = filtered.filter((i) => i.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            (i.name && i.name.toLowerCase().includes(s)) ||
            (i.phone && i.phone.toLowerCase().includes(s)) ||
            (i.email && i.email.toLowerCase().includes(s))
        );
      }

      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + Number(limit));

      return res.json({
        success: true,
        data: paginated,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/invitees/upload - Bulk upsert invitees with E.164 phone validation
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
      // Auto-format phone to E.164 if missing + prefix
      if (rawPhone && !rawPhone.startsWith('+')) {
        rawPhone = '+' + rawPhone.replace(/\D/g, '');
      }

      if (!row.name || !e164Regex.test(rawPhone)) {
        invalidRows.push({ rowNumber: index + 1, data: row, reason: 'Invalid E.164 phone format or missing name' });
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

    // Deduplicate validRows by phone within the payload
    const uniqueValidMap = new Map();
    validRows.forEach((item) => uniqueValidMap.set(item.phone, item));
    const deduplicatedValid = Array.from(uniqueValidMap.values());

    const dbConnected = await checkDB();

    if (dbConnected) {
      const ops = deduplicatedValid.map((item) => ({
        updateOne: {
          filter: { campaignId: item.campaignId, phone: item.phone },
          update: { $set: item },
          upsert: true,
        },
      }));

      if (ops.length > 0) {
        await Invitee.bulkWrite(ops);
      }
      const updatedStats = await recalculateStats(campaignId, true);

      return res.json({
        success: true,
        insertedCount: deduplicatedValid.length,
        rejectedCount: invalidRows.length + (validRows.length - deduplicatedValid.length),
        invalidRows,
        stats: updatedStats,
      });
    } else {
      deduplicatedValid.forEach((item) => {
        const existingIdx = inMemoryStore.invitees.findIndex(
          (i) => i.campaignId === campaignId && i.phone === item.phone
        );
        if (existingIdx >= 0) {
          inMemoryStore.invitees[existingIdx] = {
            ...inMemoryStore.invitees[existingIdx],
            ...item,
          };
        } else {
          inMemoryStore.invitees.push({
            _id: '65d4f2000000000000000' + Math.floor(100000 + Math.random() * 900000).toString(),
            ...item,
            callDuration: 0,
            transcript: [],
          });
        }
      });

      const updatedStats = await recalculateStats(campaignId, false);

      return res.json({
        success: true,
        insertedCount: deduplicatedValid.length,
        rejectedCount: invalidRows.length + (validRows.length - deduplicatedValid.length),
        invalidRows,
        stats: updatedStats,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/invitees/:id - Update invitee status manually or add details
app.patch('/api/invitees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const dbConnected = await checkDB();

    if (dbConnected) {
      const invitee = await Invitee.findByIdAndUpdate(id, { $set: updates }, { new: true });
      if (!invitee) return res.status(404).json({ success: false, error: 'Invitee not found' });
      await recalculateStats(invitee.campaignId, true);
      return res.json({ success: true, data: invitee });
    } else {
      const invitee = inMemoryStore.invitees.find((i) => i._id === id);
      if (!invitee) return res.status(404).json({ success: false, error: 'Invitee not found' });

      Object.assign(invitee, updates);
      await recalculateStats(invitee.campaignId, false);
      return res.json({ success: true, data: invitee });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulated AI Call Generators
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

  // Weighted random distribution (50% Confirmed, 25% Declined, 15% Undecided, 10% Failed)
  const rand = Math.random();
  if (rand < 0.50) return outcomes[0];
  if (rand < 0.75) return outcomes[1];
  if (rand < 0.90) return outcomes[2];
  return outcomes[3];
};

// POST /api/campaigns/:id/start - Trigger RSVP Call Engine Batch
app.post('/api/campaigns/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerExternalTring = false } = req.body;
    const dbConnected = await checkDB();

    let campaign;
    let pendingInvitees = [];

    if (dbConnected) {
      campaign = await Campaign.findById(id);
      if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
      pendingInvitees = await Invitee.find({
        $or: [{ campaignId: id }, { campaignId: new mongoose.Types.ObjectId(id) }],
        status: 'PENDING',
      });
    } else {
      campaign = inMemoryStore.campaigns.find((c) => c._id === id);
      if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
      pendingInvitees = inMemoryStore.invitees.filter((i) => i.campaignId === id && i.status === 'PENDING');
    }

    if (pendingInvitees.length === 0) {
      return res.json({
        success: true,
        message: 'No pending invitees to call in this campaign.',
        processedCount: 0,
      });
    }

    // Update campaign status to ACTIVE
    if (dbConnected) {
      await Campaign.findByIdAndUpdate(id, { status: 'ACTIVE' });
    } else {
      campaign.status = 'ACTIVE';
    }

    // Process calls asynchronously in batch simulation
    const results = [];
    for (const invitee of pendingInvitees) {
      const sim = generateSimulatedCall(invitee.name, campaign.name);
      const callId = 'call_sim_' + Math.random().toString(36).substring(2, 9);
      const lastCalledAt = new Date();

      if (triggerExternalTring) {
        // Optional webhook call to TringTring.AI external endpoint
        try {
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
          }).catch((err) => console.log('TringTring webhook dispatch note:', err.message));
        } catch (e) {
          // ignore external fetch errors during offline execution
        }
      }

      if (dbConnected) {
        await Invitee.findByIdAndUpdate(invitee._id, {
          status: sim.status,
          disposition: sim.disposition,
          callDuration: sim.duration,
          callId,
          lastCalledAt,
          transcript: sim.transcript,
        });
      } else {
        const item = inMemoryStore.invitees.find((i) => i._id === invitee._id.toString());
        if (item) {
          item.status = sim.status;
          item.disposition = sim.disposition;
          item.callDuration = sim.duration;
          item.callId = callId;
          item.lastCalledAt = lastCalledAt;
          item.transcript = sim.transcript;
        }
      }

      results.push({ inviteeId: invitee._id, name: invitee.name, phone: invitee.phone, status: sim.status });
    }

    const newStats = await recalculateStats(id, dbConnected);

    return res.json({
      success: true,
      message: `Successfully executed RSVP calling campaign for ${pendingInvitees.length} invitees.`,
      processedCount: pendingInvitees.length,
      results,
      stats: newStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/webhooks/call-status - Receive webhook status from AI Call Provider
app.post('/api/webhooks/call-status', async (req, res) => {
  try {
    const { invitee_id, call_id, disposition, duration, transcript, status } = req.body;

    if (!invitee_id) {
      return res.status(400).json({ success: false, error: 'invitee_id is required' });
    }

    let mappedStatus = 'UNDECIDED';
    if (status === 'CONFIRMED' || disposition === 'CONFIRMED_RSVP') mappedStatus = 'CONFIRMED';
    else if (status === 'DECLINED' || disposition === 'DECLINED_RSVP') mappedStatus = 'DECLINED';
    else if (status === 'FAILED' || disposition?.includes('BUSY') || disposition?.includes('FAILED')) mappedStatus = 'FAILED';

    const dbConnected = await checkDB();

    if (dbConnected) {
      const invitee = await Invitee.findById(invitee_id);
      if (!invitee) return res.status(404).json({ success: false, error: 'Invitee record not found' });

      invitee.status = mappedStatus;
      if (call_id) invitee.callId = call_id;
      if (disposition) invitee.disposition = disposition;
      if (duration) invitee.callDuration = Number(duration);
      invitee.lastCalledAt = new Date();

      if (Array.isArray(transcript)) {
        invitee.transcript = transcript;
      }

      await invitee.save();
      await recalculateStats(invitee.campaignId, true);

      return res.json({ success: true, message: 'Webhook processed successfully', data: invitee });
    } else {
      const invitee = inMemoryStore.invitees.find((i) => i._id === invitee_id);
      if (!invitee) return res.status(404).json({ success: false, error: 'Invitee record not found' });

      invitee.status = mappedStatus;
      if (call_id) invitee.callId = call_id;
      if (disposition) invitee.disposition = disposition;
      if (duration) invitee.callDuration = Number(duration);
      invitee.lastCalledAt = new Date();

      if (Array.isArray(transcript)) {
        invitee.transcript = transcript;
      }

      await recalculateStats(invitee.campaignId, false);
      return res.json({ success: true, message: 'Webhook processed successfully', data: invitee });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Standalone Server Initialization (for local development)
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Express Server] Running on http://localhost:${PORT}`);
  });
}

// Export default app for Vercel Serverless Function deployment
export default app;
