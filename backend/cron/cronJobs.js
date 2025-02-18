const cron = require("node-cron");
const userModel = require("../models/userModel");

const updateMissedReviewDate = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await userModel.updateMany(
      { "completedLessons.nextReviewDate": { $lt: today } },
      { $set: { "completedLessons.$[elem].nextReviewDate": today } },
      { arrayFilters: [{ "elem.nextReviewDate": { $lt: today } }] }
    );

    console.log("nextReviewDate updated successfully.");
  } catch (error) {
    console.error("Error updating nextReviewDate:", error);
  }
};

// Run the cron job every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to reset nextReviewDate...");
  updateMissedReviewDate();
});

module.exports = cron;
