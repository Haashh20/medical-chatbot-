require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");
    
    const users = await User.find({}).select('email medicalProfile');
    
    console.log("\n--- USER DATABASE DUMP ---");
    if (users.length === 0) {
      console.log("No users found in database.");
    } else {
      users.forEach(user => {
        console.log(`\nEmail: ${user.email}`);
        console.log(`Medical Profile Data:`);
        console.log(JSON.stringify(user.medicalProfile, null, 2));
      });
    }
    console.log("\n--------------------------");
    
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    mongoose.connection.close();
  }
};

checkDB();
