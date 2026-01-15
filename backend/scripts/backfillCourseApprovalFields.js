/**
 * One-time migration script to backfill missing approval workflow fields
 * on legacy courses created before the approval system was implemented.
 * 
 * This script:
 * - Sets published=false on courses where it's missing/null
 * - Sets approvalStatus="draft" on courses where it's missing/null
 * 
 * Usage: node scripts/backfillCourseApprovalFields.js
 */

const mongoose = require("mongoose");
const Course = require("../src/models/mongo/courseModel");
require("dotenv").config();

async function backfillCourseFields() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mindquest";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find all courses with missing fields
    const coursesNeedingUpdate = await Course.find({
      $or: [
        { published: { $in: [null, undefined] } },
        { approvalStatus: { $in: [null, undefined] } }
      ]
    });

    console.log(`\n📊 Found ${coursesNeedingUpdate.length} courses needing backfill\n`);

    if (coursesNeedingUpdate.length === 0) {
      console.log("✅ All courses already have required fields. No backfill needed.");
      await mongoose.connection.close();
      return;
    }

    // Update courses with missing fields
    const updateResult = await Course.updateMany(
      {
        $or: [
          { published: { $in: [null, undefined] } },
          { approvalStatus: { $in: [null, undefined] } }
        ]
      },
      {
        $set: {
          published: false,
          approvalStatus: "draft"
        }
      }
    );

    console.log(`✅ Backfill complete!`);
    console.log(`   - Matched: ${updateResult.matchedCount} courses`);
    console.log(`   - Modified: ${updateResult.modifiedCount} courses`);

    // Show sample of updated courses
    const sampleUpdated = await Course.find({
      _id: { $in: coursesNeedingUpdate.slice(0, 5).map(c => c._id) }
    }).select("title approvalStatus published");

    console.log(`\n📝 Sample of updated courses:`);
    sampleUpdated.forEach((course, idx) => {
      console.log(`   ${idx + 1}. ${course.title}`);
      console.log(`      - approvalStatus: ${course.approvalStatus}`);
      console.log(`      - published: ${course.published}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    
  } catch (error) {
    console.error("❌ Error during backfill:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the backfill
backfillCourseFields();
