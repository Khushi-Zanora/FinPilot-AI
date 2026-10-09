import { z } from 'zod';
import { ContactMessage } from '../models/ContactMessage.js';

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Valid email address is required'),
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000)
  })
});

export async function submitContactForm(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const contactMsg = await ContactMessage.create({
      name,
      email: email.toLowerCase().trim(),
      subject,
      message,
      ipAddress
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. The FinPilot team has received your message and will respond shortly.',
      data: {
        id: contactMsg._id
      }
    });
  } catch (err) {
    next(err);
  }
}
