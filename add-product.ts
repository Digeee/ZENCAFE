import { db } from "./server/db";
import { products, categories } from "./shared/schema";

async function addProduct() {
  try {
    // First, let's check existing categories
    const allCategories = await db.select().from(categories);
    console.log("Available categories:", allCategories);

    // If no categories exist, create one
    let coffeeCategory = allCategories.find(c => c.slug === "coffee");
    if (!coffeeCategory) {
      console.log("Creating coffee category...");
      await db
        .insert(categories)
        .values({
          id: "coffee_cat",
          name: "Coffee",
          slug: "coffee",
          description: "Premium Ceylon coffee blends",
          imageUrl: "/api/placeholder/coffee-category",
          displayOrder: 1,
        })
        .onDuplicateKeyUpdate({ set: { name: "Coffee" } })
        .execute();
      
      // Refresh the categories list
      const updatedCategories = await db.select().from(categories);
      coffeeCategory = updatedCategories.find(c => c.slug === "coffee");
    }

    // Add a new product
    console.log("Adding new product...");
    await db
      .insert(products)
      .values({
        id: "new_coffee_blend_" + Date.now(),
        categoryId: coffeeCategory!.id,
        name: "New Coffee Blend",
        slug: "new-coffee-blend-" + Date.now(),
        description: "A delicious new coffee blend from Sri Lanka",
        price: "15.99",
        imageUrl: "/api/placeholder/new-coffee",
        origin: "Kandy, Sri Lanka",
        brewingSuggestions: "Best brewed as espresso or French press",
        inStock: true,
        featured: true,
      })
      .onDuplicateKeyUpdate({ set: { name: "New Coffee Blend" } })
      .execute();

    console.log("Product added successfully!");
  } catch (error) {
    console.error("Error adding product:", error);
  } finally {
    process.exit(0);
  }
}

addProduct();