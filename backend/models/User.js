const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  medicalProfile: {
    bloodType: { type: String, default: '' },
    allergies: { type: String, default: '' },
    chronicConditions: { type: String, default: '' },
    currentMedications: { type: String, default: '' },
    height: { type: String, default: '' },
    weight: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
