import cron from "node-cron";
import {
  deleteOldTaskMedia,
  deleteOldTasks,
} from "../controllers/taskController.js";
// Schedule daily at midnight for deleting old task media
cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to delete old task media");
  await deleteOldTaskMedia();
});
// Schedule daily at 1 AM for deleting old tasks
cron.schedule("0 1 * * *", async () => {
  console.log("Running cron job to delete old tasks");
  await deleteOldTasks();
});
