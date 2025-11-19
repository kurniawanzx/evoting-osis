import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  nis: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  kelas: { type: String, required: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false },
  votedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  votedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
