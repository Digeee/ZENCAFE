// Database seed script with Sri Lankan products
import { db } from "./db";
import { categories, products, users } from "@shared/schema";

// Image URLs - using generated image paths
const ceylonBlackTeaImage = "/attached_assets/generated_images/ceylon_black_tea_product.png";
const spicedCeylonTeaImage = "/attached_assets/generated_images/spiced_ceylon_tea_product.png";
const kithulCoffeeImage = "/attached_assets/generated_images/kithul_coffee_product.png";
const cinnamonCoffeeImage = "/attached_assets/generated_images/cinnamon_coffee_product.png";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Create categories
  console.log("📁 Creating categories...");
  
  const [coffeeCategory] = await db
    .insert(categories)
    .values({
      name: "Coffee",
      slug: "coffee",
      description: "Premium Ceylon coffee blends sourced from Sri Lanka's finest estates",
      imageUrl: "/api/placeholder/coffee-category",
      displayOrder: 1,
    })
    .onConflictDoNothing()
    .returning();

  const [teaCategory] = await db
    .insert(categories)
    .values({
      name: "Tea",
      slug: "tea",
      description: "Authentic Ceylon tea from the misty highlands of Sri Lanka",
      imageUrl: "/api/placeholder/tea-category",
      displayOrder: 2,
    })
    .onConflictDoNothing()
    .returning();

  const [pastriesCategory] = await db
    .insert(categories)
    .values({
      name: "Pastries",
      slug: "pastries",
      description: "Traditional Sri Lankan pastries and baked goods",
      imageUrl: "/api/placeholder/pastries-category",
      displayOrder: 3,
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Categories created");

  // Get category IDs (in case they already existed)
  const allCategories = await db.select().from(categories);
  const coffee = allCategories.find(c => c.slug === "coffee")!;
  const tea = allCategories.find(c => c.slug === "tea")!;
  const pastries = allCategories.find(c => c.slug === "pastries")!;

  // Create products
  console.log("☕ Creating products...");

  const productsData = [
    // Ceylon Tea Products
    {
      categoryId: tea.id,
      name: "Ceylon Black Tea",
      slug: "ceylon-black-tea",
      description: "Premium black tea from the highlands of Nuwara Eliya. Rich, full-bodied flavor with hints of citrus and a smooth finish. Perfect for morning tea or afternoon refreshment.",
      price: "12.99",
      imageUrl: ceylonBlackTeaImage,
      origin: "Nuwara Eliya, Sri Lanka",
      brewingSuggestions: "Steep 1 teaspoon per cup in freshly boiled water for 3-5 minutes. Best enjoyed with a splash of milk and honey.",
      inStock: true,
      featured: true,
    },
    {
      categoryId: tea.id,
      name: "Spiced Ceylon Tea",
      slug: "spiced-ceylon-tea",
      description: "An aromatic blend of premium Ceylon black tea infused with traditional spices including cinnamon, cardamom, and clove. Warming and invigorating.",
      price: "14.99",
      imageUrl: spicedCeylonTeaImage,
      origin: "Kandy, Sri Lanka",
      brewingSuggestions: "Steep for 4-5 minutes in boiling water. Excellent with milk and natural sweetener. Perfect for cool evenings.",
      inStock: true,
      featured: true,
    },
    {
      categoryId: tea.id,
      name: "Silver Tips White Tea",
      slug: "silver-tips-white-tea",
      description: "Rare and exquisite white tea made from hand-picked silver tips. Delicate floral notes with natural sweetness. One of the world's finest teas.",
      price: "24.99",
      imageUrl: ceylonBlackTeaImage,
      origin: "Nuwara Eliya, Sri Lanka",
      brewingSuggestions: "Steep in water at 175°F (80°C) for 2-3 minutes. Enjoy pure without milk or sugar to appreciate its subtle flavors.",
      inStock: true,
      featured: false,
    },
    {
      categoryId: tea.id,
      name: "Ceylon Green Tea",
      slug: "ceylon-green-tea",
      description: "Light and refreshing green tea with grassy notes and a clean finish. Rich in antioxidants and perfect for daily wellness.",
      price: "11.99",
      imageUrl: spicedCeylonTeaImage,
      origin: "Dimbula, Sri Lanka",
      brewingSuggestions: "Steep in water at 175°F (80°C) for 2-3 minutes. Can be enjoyed multiple times throughout the day.",
      inStock: true,
      featured: false,
    },

    // Coffee Products
    {
      categoryId: coffee.id,
      name: "Kithul Coffee Blend",
      slug: "kithul-coffee-blend",
      description: "Unique artisanal coffee sweetened naturally with kithul palm treacle. Smooth, rich flavor with caramel undertones. A Sri Lankan specialty.",
      price: "16.99",
      imageUrl: kithulCoffeeImage,
      origin: "Kandy & Southern Province, Sri Lanka",
      brewingSuggestions: "Brew as espresso or French press. The natural sweetness from kithul means less sugar needed. Best enjoyed black to appreciate the unique flavor.",
      inStock: true,
      featured: true,
    },
    {
      categoryId: coffee.id,
      name: "Ceylon Cinnamon Coffee",
      slug: "ceylon-cinnamon-coffee",
      description: "Premium Arabica coffee infused with authentic Ceylon cinnamon. Warm, spicy notes complement the coffee's natural richness perfectly.",
      price: "15.99",
      imageUrl: cinnamonCoffeeImage,
      origin: "Central Highlands, Sri Lanka",
      brewingSuggestions: "Perfect for pour-over or drip coffee. The cinnamon adds natural sweetness and warmth. Excellent as a morning brew.",
      inStock: true,
      featured: true,
    },
    {
      categoryId: coffee.id,
      name: "Single Origin Arabica",
      slug: "single-origin-arabica",
      description: "Pure Ceylon Arabica coffee from high-altitude estates. Complex flavor profile with notes of chocolate and berries. Medium roast.",
      price: "18.99",
      imageUrl: kithulCoffeeImage,
      origin: "Nuwara Eliya, Sri Lanka",
      brewingSuggestions: "Best brewed as pour-over or French press to highlight its complex flavors. Grind fresh for optimal taste.",
      inStock: true,
      featured: false,
    },
    {
      categoryId: coffee.id,
      name: "Robusta Dark Roast",
      slug: "robusta-dark-roast",
      description: "Bold Ceylon Robusta coffee with deep, intense flavor. Higher caffeine content and full body. Perfect for espresso.",
      price: "13.99",
      imageUrl: cinnamonCoffeeImage,
      origin: "Kandy, Sri Lanka",
      brewingSuggestions: "Ideal for espresso machines. Creates excellent crema. Strong and invigorating.",
      inStock: true,
      featured: false,
    },

    // Pastries
    {
      categoryId: pastries.id,
      name: "Coconut Roti (6 pack)",
      slug: "coconut-roti-pack",
      description: "Traditional Sri Lankan coconut roti, freshly made. Flaky layers filled with sweetened coconut. A beloved breakfast treat.",
      price: "8.99",
      imageUrl: "/api/placeholder/coconut-roti",
      origin: "Made fresh in Colombo",
      brewingSuggestions: "Best enjoyed warm with Ceylon tea. Can be lightly toasted before serving.",
      inStock: true,
      featured: false,
    },
    {
      categoryId: pastries.id,
      name: "Kimbula Banis (Tiger Buns)",
      slug: "kimbula-banis",
      description: "Sweet buns with distinctive tiger-stripe pattern. Soft, slightly sweet bread perfect with tea or coffee.",
      price: "7.99",
      imageUrl: "/api/placeholder/kimbula-banis",
      origin: "Traditional recipe from Galle",
      brewingSuggestions: "Delicious on their own or with butter. Pairs wonderfully with Ceylon tea.",
      inStock: true,
      featured: false,
    },
    {
      categoryId: pastries.id,
      name: "Bibikkan (Coconut Cake)",
      slug: "bibikkan-cake",
      description: "Traditional Sri Lankan coconut cake made with jaggery, cashews, and aromatic spices. Dense, moist, and richly flavored.",
      price: "12.99",
      imageUrl: "/api/placeholder/bibikkan",
      origin: "Traditional Ceylon recipe",
      brewingSuggestions: "Slice and serve at room temperature. Perfect afternoon snack with tea.",
      inStock: true,
      featured: false,
    },
  ];

  for (const productData of productsData) {
    await db
      .insert(products)
      .values(productData)
      .onConflictDoNothing();
  }

  console.log("✅ Products created");

  console.log("👤 Checking for admin user...");
  
  // Note: The first user to log in will need to be manually set as admin in the database
  // or you can create a specific admin user here if you have their ID from Replit
  console.log("ℹ️  To set a user as admin, update their record in the database:");
  console.log("   UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com'");

  console.log("\n✨ Database seeding completed successfully!");
  console.log("📊 Summary:");
  console.log(`   - Categories: ${allCategories.length}`);
  console.log(`   - Products: ${productsData.length}`);
}

seed()
  .then(() => {
    console.log("👋 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });
