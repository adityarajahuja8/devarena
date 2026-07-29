import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await mongoose.connection.db.collection('users').updateMany(
    { role: { $in: ['organizer', 'judge'] } },
    { $set: { status: 'approved' } }
  );
  console.log('Approved organizers & judges:', result);
  process.exit(0);
}

run().catch(console.error);
