import { seedDatabase } from "./models/seedDB.js";

const isKeep = process.argv.includes("--keep");
seedDatabase({ reset: !isKeep })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
