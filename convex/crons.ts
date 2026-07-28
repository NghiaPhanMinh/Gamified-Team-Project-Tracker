import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("resolve overdue QuestBoard bosses", { minutes: 5 }, internal.bosses.resolveDue);
export default crons;
