/**
 * Admin Seed Script
 * Run: npm run seed
 *
 * Creates a default Admin user in the database.
 * Safe to run multiple times (skips if admin already exists).
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hacksphere.dev';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`✅ Admin already exists: ${adminEmail}`);
    process.exit(0);
  }

  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    status: 'approved',
  });

  console.log('🌱 Admin seeded successfully!');
  console.log(`   Name:     ${admin.name}`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   ⚠️  Change the password after first login!');

  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
