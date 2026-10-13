import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import connectDB from "../services/db.js";
import { createTables } from "./initDB.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

/**
 * Database Seed Script for Crave
 *
 * Seeds all required users, recipes, favorites, comments, and messages
 * for end-to-end testing (TestCafe), backend testing (Jest), and local development.
 */

const SEED_USERS = [
  {
    fullName: "Jay Prakash",
    username: "jay",
    email: "jay@example.com",
    plainPassword: "12345678",
  },
  {
    fullName: "Chef Mario Rossi",
    username: "chef_mario",
    email: "mario@crave.com",
    plainPassword: "12345678",
  },
  {
    fullName: "Sarah Miller",
    username: "sarah_bakes",
    email: "sarah@crave.com",
    plainPassword: "12345678",
  },
  {
    fullName: "Alice Johnson",
    username: "alice_cooks",
    email: "alice@crave.com",
    plainPassword: "12345678",
  },
];

// Recipes authored by Jay (at least 12 recipes to test pagination >= 10 items)
const JAY_RECIPES = [
  {
    title: "Creamy Garlic Parmesan Pasta",
    description:
      "Tender fettuccine tossed in a rich garlic butter cream sauce, finished with aged Parmigiano-Reggiano, fresh cracked black pepper, and chopped Italian parsley.",
  },
  {
    title: "Classic Margherita Pizza",
    description:
      "Crispy artisan thin crust topped with crushed San Marzano tomato sauce, fresh buffalo mozzarella slices, fragrant basil leaves, and a drizzle of extra virgin olive oil.",
  },
  {
    title: "Spicy Thai Basil Chicken",
    description:
      "Wok-seared minced chicken thighs stir-fried with fragrant holy basil, bird's eye chilies, garlic cloves, and a rich savory oyster sauce glaze, served with jasmine rice.",
  },
  {
    title: "Fluffy Blueberry Buttermilk Pancakes",
    description:
      "Golden, cloud-soft buttermilk pancakes packed with juicy fresh blueberries, served warm with whipped butter and pure Vermont maple syrup.",
  },
  {
    title: "Authentic Hyderabadi Chicken Biryani",
    description:
      "Fragrant long-grain basmati rice cooked in dum style with tender spiced chicken marinated in yogurt, saffron, caramelised golden onions, and fresh mint.",
  },
  {
    title: "Chocolate Molten Lava Cake",
    description:
      "Decadent dark chocolate sponge cake with a warm, flowing melted chocolate core. Best served dusted with cocoa powder and a scoop of vanilla bean ice cream.",
  },
  {
    title: "Avocado Toast with Poached Egg",
    description:
      "Toasted country sourdough topped with lemon-infused mashed avocado, everything bagel seasoning, chili flakes, and a delicate runny poached egg.",
  },
  {
    title: "Crispy Teriyaki Tofu Stir-Fry",
    description:
      "Golden pan-crisped tofu cubes tossed with crunchy broccoli florets, bell peppers, and snap peas in a glossy, sweet-savory homemade garlic teriyaki glaze.",
  },
  {
    title: "Hearty Slow-Cooked Beef Stew",
    description:
      "Slow-simmered beef chuck chunks with baby carrots, butter potatoes, celery, and rosemary in a rich, velvety red wine and herb broth.",
  },
  {
    title: "Fresh Mediterranean Greek Salad",
    description:
      "Crisp Persian cucumbers, ripe vine tomatoes, Kalamata olives, thinly sliced red onion, and creamy block feta tossed in lemon-herb oregano vinaigrette.",
  },
  {
    title: "Roasted Tomato & Basil Bisque",
    description:
      "Silky roasted vine-ripened tomato soup simmered with caramelized onions, roasted garlic, heavy cream, and garden-fresh sweet basil.",
  },
  {
    title: "Smoky BBQ Pulled Pork Sliders",
    description:
      "Tender, slow-smoked pulled pork tossed in tangy sweet hickory barbecue sauce, piled onto buttery toasted brioche buns with crunchy apple slaw.",
  },
  {
    title: "Japanese Matcha Green Tea Cheesecake",
    description:
      "Creamy and velvety no-bake cheesecake infused with premium Uji matcha powder, layered on top of a buttery crushed biscuit crust.",
  },
  {
    title: "Golden Paneer Butter Masala",
    description:
      "Soft paneer cubes simmered gently in a fragrant, buttery tomato-cashew gravy accented with kasuri methi and aromatic garam masala.",
  },
];

// Recipes authored by other community members
const OTHER_RECIPES = [
  {
    authorUsername: "chef_mario",
    title: "Authentic Spaghetti Carbonara",
    description:
      "Traditional Roman pasta dish prepared with crispy cured guanciale, farm fresh egg yolks, Pecorino Romano cheese, and coarsely cracked black peppercorns.",
  },
  {
    authorUsername: "sarah_bakes",
    title: "Artisan Sourdough Boule",
    description:
      "Naturally leavened sourdough bread with an open, airy crumb and an extra blistered crispy golden-brown crust.",
  },
  {
    authorUsername: "sarah_bakes",
    title: "Warm Cinnamon Brioche Rolls",
    description:
      "Pillowy brioche rolls swirled with aromatic Ceylon cinnamon and brown sugar, topped with rich vanilla cream cheese glaze.",
  },
  {
    authorUsername: "alice_cooks",
    title: "Zesty Lemon Herb Grilled Salmon",
    description:
      "Wild-caught salmon fillet seared with garlic herb butter, fresh dill, and lemon zest, paired with tender grilled asparagus spears.",
  },
];

export const seedDatabase = async ({ reset = true } = {}) => {
  let connection;
  try {
    console.log("🌱 Initializing database schema...");
    await createTables();

    connection = await connectDB();

    if (reset) {
      console.log("🧹 Resetting existing tables...");
      await connection.execute("SET FOREIGN_KEY_CHECKS=0;");
      await connection.execute("TRUNCATE TABLE messages;");
      await connection.execute("TRUNCATE TABLE favorites;");
      await connection.execute("TRUNCATE TABLE comments;");
      await connection.execute("TRUNCATE TABLE images;");
      await connection.execute("TRUNCATE TABLE recipes;");
      await connection.execute("TRUNCATE TABLE users;");
      await connection.execute("SET FOREIGN_KEY_CHECKS=1;");
    }

    console.log("👤 Seeding users...");
    const userMap = new Map();

    for (const u of SEED_USERS) {
      const hashedPassword = await bcrypt.hash(u.plainPassword, 10);
      const [res] = await connection.execute(
        "INSERT INTO users (fullName, username, email, password) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE fullName = VALUES(fullName)",
        [u.fullName, u.username, u.email, hashedPassword]
      );

      // Retrieve user id
      const [rows] = await connection.execute(
        "SELECT id FROM users WHERE username = ?",
        [u.username]
      );
      userMap.set(u.username, rows[0].id);
    }
    console.log(`✅ Seeded ${userMap.size} users.`);

    const jayUserId = userMap.get("jay");
    if (!jayUserId) {
      throw new Error("Failed to seed primary test user 'jay'");
    }

    console.log("🍲 Seeding recipes...");
    const recipeIds = [];

    // Seed Jay's recipes
    for (const r of JAY_RECIPES) {
      const [res] = await connection.execute(
        "INSERT INTO recipes (title, description, user_id) VALUES (?, ?, ?)",
        [r.title, r.description, jayUserId]
      );
      recipeIds.push(res.insertId);
    }

    // Seed other community recipes
    for (const r of OTHER_RECIPES) {
      const authorId = userMap.get(r.authorUsername) || jayUserId;
      const [res] = await connection.execute(
        "INSERT INTO recipes (title, description, user_id) VALUES (?, ?, ?)",
        [r.title, r.description, authorId]
      );
      recipeIds.push(res.insertId);
    }
    console.log(`✅ Seeded ${recipeIds.length} recipes.`);

    console.log("⭐ Seeding favorites for user 'jay'...");
    // Mark first 12 recipes as favorites for jay to ensure pagination test (>10 items) passes
    const favCount = Math.min(12, recipeIds.length);
    for (let i = 0; i < favCount; i++) {
      await connection.execute(
        "INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)",
        [jayUserId, recipeIds[i]]
      );
    }
    console.log(`✅ Seeded ${favCount} favorite recipes for test user 'jay'.`);

    console.log("💬 Seeding comments...");
    const sampleComments = [
      {
        recipeIdx: 0,
        author: "chef_mario",
        content: "Fantastic pasta texture! Love the garlic balance.",
      },
      {
        recipeIdx: 0,
        author: "sarah_bakes",
        content: "Made this for dinner tonight, absolutely delightful!",
      },
      {
        recipeIdx: 1,
        author: "alice_cooks",
        content: "The dough recipe was super easy to follow. Turned out great!",
      },
      {
        recipeIdx: 5,
        author: "jay",
        content: "Serve with a warm scoop of vanilla ice cream for best taste!",
      },
    ];

    for (const c of sampleComments) {
      const authorId = userMap.get(c.author) || jayUserId;
      const targetRecipeId = recipeIds[c.recipeIdx];
      if (targetRecipeId) {
        await connection.execute(
          "INSERT INTO comments (content, user_id, recipe_id) VALUES (?, ?, ?)",
          [c.content, authorId, targetRecipeId]
        );
      }
    }
    console.log(`✅ Seeded comments.`);

    console.log("💬 Seeding community chat messages...");
    const sampleMessages = [
      {
        author: "jay",
        group: "veg",
        msg: "Hey everyone! Anyone have recommendations for crispy tofu coating?",
      },
      {
        author: "sarah_bakes",
        group: "veg",
        msg: "Cornstarch with a dash of garlic powder works wonders!",
      },
      {
        author: "chef_mario",
        group: "non-veg",
        msg: "Pro tip for steak: let it rest 5 minutes after searing to retain juices.",
      },
      {
        author: "alice_cooks",
        group: "non-veg",
        msg: "Smoked paprika adds a fantastic aroma to grilled chicken marinades.",
      },
    ];

    for (const m of sampleMessages) {
      const uId = userMap.get(m.author) || jayUserId;
      await connection.execute(
        "INSERT INTO messages (user_id, username, group_type, message) VALUES (?, ?, ?, ?)",
        [uId, m.author, m.group, m.msg]
      );
    }
    console.log(`✅ Seeded chat messages.`);

    console.log("\n==========================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY");
    console.log("==========================================");
    console.log("Test user credentials for TestCafe & testing:");
    console.log("  Username: jay");
    console.log("  Password: 12345678");
    console.log(`  Recipes created by 'jay': ${JAY_RECIPES.length}`);
    console.log(`  Favorites saved by 'jay': ${favCount}`);
    console.log("==========================================\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Execute if run directly from CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith("seedDB.js") || process.argv[1].endsWith("seed.js"))
) {
  const isKeep = process.argv.includes("--keep");
  seedDatabase({ reset: !isKeep })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
