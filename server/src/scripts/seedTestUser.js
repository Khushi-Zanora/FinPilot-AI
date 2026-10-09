import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { config } from '../config/index.js';

async function seed() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'premium.tester@finpilot.app';
    const passwordRaw = 'FinPilot2026!';
    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Premium Test User',
        email,
        passwordHash,
        plan: 'premium',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      });
      console.log('Created user:', user.email);
    } else {
      user.plan = 'premium';
      user.passwordHash = passwordHash;
      await user.save();
      console.log('Updated existing user to premium:', user.email);
    }

    // Ensure subscription record exists
    let sub = await Subscription.findOne({ userId: user._id });
    if (!sub) {
      sub = await Subscription.create({
        userId: user._id,
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      });
      console.log('Created active subscription record');
    }

    console.log('SUCCESS: Demo Premium User is ready.');
    console.log('Email:', email);
    console.log('Password:', passwordRaw);
  } catch (err) {
    console.error('Error seeding user:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
