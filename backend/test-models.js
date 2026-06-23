require('dotenv').config();

async function test() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Using key:", key);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    const flashModels = data.models.filter(m => m.name.includes('flash'));
    console.log(JSON.stringify(flashModels, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
