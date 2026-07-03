import User from '../models/User.js';

// Get all pending (unapproved) users - admin only
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all approved members - admin only
export const getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: true }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve a user - admin only
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isApproved = true;
    await user.save();
    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};