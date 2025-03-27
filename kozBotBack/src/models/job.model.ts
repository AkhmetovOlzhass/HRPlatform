import { Schema, model } from 'mongoose';

const candidateSchema = new Schema({
  full_name: { type: String },
  phone: { type: String },
  email: { type: String },
  resume_text: { type: String },
  status: { type: String, default: "new" },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const jobSchema = new Schema({
  // Оставляем как есть:
  title: { type: String, required: true },
  location: { type: String, required: true },
  company: { type: String },

  salary: {
    from: { type: Number, required: true },
    to: { type: Number, required: true },
    currency: { type: String, default: "KZT" },
    type: { type: String, default: "netto" }
  },

  schedule: [String],

  // Всё остальное переносим в одно поле
  description: { type: String },

  source: { type: String, default: "internal" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },

  candidates: [candidateSchema]
});

export default model('Job', jobSchema);
