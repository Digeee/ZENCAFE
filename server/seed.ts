  console.log("👤 Checking for admin user...");
  
  // Note: The first user to log in will need to be manually set as admin in the database
  // or you can create a specific admin user here if you have their ID
  console.log("ℹ️  To set a user as admin, update their record in the database:");
  console.log("   UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com'");