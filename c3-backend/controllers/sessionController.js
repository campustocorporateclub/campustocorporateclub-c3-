import Session from '../models/Session.js';

// Create a session - admin only
export const createSession = async (req, res) => {
  try {
    const { date, topic, type, handledBy, summary } = req.body;
    if (!req.files || !req.files.coverImage) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    const coverImage = req.files.coverImage[0].path; // Cloudinary URL
    const images = req.files.images ? req.files.images.map(f => f.path) : [];

    const session = await Session.create({
      date,
      topic,
      type,
      handledBy,
      summary,
      coverImage,
      images,
      createdBy: req.user._id,
      absentees: [],
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all sessions - any logged in user
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single session by ID
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update absentees for a session - admin only
export const markAbsentees = async (req, res) => {
  try {
    const { absentees } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.absentees = absentees;
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit session details (including summary, admin can update anytime) - admin only
export const updateSession = async (req, res) => {
  try {
    const { topic, type, handledBy, summary } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.topic = topic ?? session.topic;
    session.type = type ?? session.type;
    session.handledBy = handledBy ?? session.handledBy;
    session.summary = summary ?? session.summary;

    if (req.files && req.files.coverImage) {
      session.coverImage = req.files.coverImage[0].path;
    }
    if (req.files && req.files.images) {
      session.images = req.files.images.map(f => f.path);
    }

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};