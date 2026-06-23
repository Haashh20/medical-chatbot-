const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route GET /api/profile
// @desc Get logged-in user's medical profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.medicalProfile || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route PUT /api/profile
// @desc Update logged-in user's medical profile
router.put('/', auth, async (req, res) => {
  try {
    const { bloodType, allergies, chronicConditions, currentMedications, height, weight } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.medicalProfile = {
      bloodType: bloodType || user.medicalProfile?.bloodType || '',
      allergies: allergies || user.medicalProfile?.allergies || '',
      chronicConditions: chronicConditions || user.medicalProfile?.chronicConditions || '',
      currentMedications: currentMedications || user.medicalProfile?.currentMedications || '',
      height: height || user.medicalProfile?.height || '',
      weight: weight || user.medicalProfile?.weight || ''
    };

    await user.save();
    res.json(user.medicalProfile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
