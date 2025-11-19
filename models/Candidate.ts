import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  nomorUrut: { type: Number, required: true, unique: true },
  ketua: {
    nama: { type: String, required: true },
    foto: { type: String },
    visi: { type: String, required: true },
    misi: { type: [String], required: true }
  },
  wakil: {
    nama: { type: String, required: true },
    foto: { type: String },
    visi: { type: String, required: true },
    misi: { type: [String], required: true }
  },
  program: { type: [String], required: true },
  voteCount: { type: Number, default: 0 },
  color: { type: String, default: '#3B82F6' }
}, {
  timestamps: true
});

export default mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
