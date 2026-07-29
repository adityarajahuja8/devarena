import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixReviewScores() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const reviews = await db.collection('reviews').find({}).toArray();

  console.log(`Found ${reviews.length} reviews to process`);

  let fixed = 0;
  for (const review of reviews) {
    let totalScore = 0;

    if (review.scores) {
      // scores is stored as a plain object in MongoDB (Map serializes to object)
      const scoresObj = review.scores;
      for (const key of Object.keys(scoresObj)) {
        const entry = scoresObj[key];
        // Handle both { marks: 40 } and plain number
        const marks = typeof entry === 'object' ? Number(entry?.marks || 0) : Number(entry || 0);
        totalScore += marks;
      }
    }

    if (totalScore !== (review.totalScore || 0)) {
      await db.collection('reviews').updateOne(
        { _id: review._id },
        { $set: { totalScore } }
      );
      console.log(`Fixed review ${review._id}: totalScore ${review.totalScore || 0} → ${totalScore}`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} / ${reviews.length} reviews.`);
  process.exit(0);
}

fixReviewScores().catch((err) => {
  console.error(err);
  process.exit(1);
});
