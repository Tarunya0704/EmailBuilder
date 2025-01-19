import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: String,
  footer: String,
  style: {
    titleColor: String,
    contentColor: String,
    fontSize: String,
    alignment: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);