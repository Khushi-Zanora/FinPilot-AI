import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 2000
    },
    ipAddress: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['new', 'in_review', 'resolved'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
