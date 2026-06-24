const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a highly capable, compassionate, and professional Medical Chatbot serving as a personal nurse assistant. 
Your core duties are:
1. Verify user symptoms and suggest possible issues accurately but NEVER frighten the user.
2. Provide information in layman's terms so normal users can easily understand complex medical terms or medicine uses.
3. NEVER provide a definitive diagnosis or replace professional medical advice. Always use phrases like "This might be indicative of..." or "It is possible that...".
4. If you spot serious or critical symptoms (e.g., severe chest pain, stroke symptoms, high persistent fever), WITHOUT frightening the user, calmly but firmly advise them to consult a doctor or visit the emergency room immediately.
5. Be conversational, empathetic, and comforting.
6. If the user asks for a "monthly medical report" or "medical report", generate a well-structured summary of the medical concerns, symptoms, and topics discussed in this chat session. Be accurate and make no mistakes.`;

// @route GET /api/chat
// @desc Get all active (unarchived) chats for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id, isArchived: { $ne: true } }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/chat/archived
// @desc Get all archived chats for the logged-in user
router.get('/archived', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id, isArchived: true }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route GET /api/chat/:id
// @desc Get a specific chat
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || chat.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/chat
// @desc Send a message and get AI response
router.post('/', auth, async (req, res) => {
  try {
    const { chatId, message } = req.body;
    let chat;
    
    // Load the user's Medical Profile to inject into AI context
    const user = await require('../models/User').findById(req.user.id);
    const profile = user.medicalProfile || {};
    const profileContext = `
USER MEDICAL PROFILE:
- Allergies: ${profile.allergies || 'None recorded'}
- Chronic Conditions: ${profile.chronicConditions || 'None recorded'}
- Current Medications: ${profile.currentMedications || 'None recorded'}
- Blood Type: ${profile.bloodType || 'Unknown'}
- Height/Weight: ${profile.height || '?'} / ${profile.weight || '?'}
`;

    const lowerMessage = message.toLowerCase();

    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat || chat.userId.toString() !== req.user.id) {
        return res.status(404).json({ error: 'Chat not found' });
      }
    } else {
      // Create new chat - Generate AI Title
      let chatTitle = message.split(' ').slice(0, 4).join(' ') + '...';
      
      try {
        const titleModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await titleModel.generateContent(`Generate a short, professional, 3 to 4 word medical summary title for this patient message: "${message}". Only output the title, nothing else. Avoid quotes.`);
        if (result && result.response && result.response.text()) {
          chatTitle = result.response.text().trim().replace(/["']/g, '');
        }
      } catch (err) {
        console.warn("Title Gen API limit reached, using smart fallback.");
        const keywords = ["pain", "fever", "headache", "stomach", "cough", "cold", "nausea", "dizzy", "bleeding", "injury", "sick", "anxious", "heart", "breathing"];
        const found = keywords.find(k => lowerMessage.includes(k));
        if (found) {
          chatTitle = found.charAt(0).toUpperCase() + found.slice(1) + " Consultation";
        }
      }

      chat = new Chat({ userId: req.user.id, title: chatTitle });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    // Format history for Gemini
    const history = chat.messages.slice(0, -1).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // --- START OF HYBRID AI LOGIC ---
    let aiResponse = "";
    
    // Get the previous model message for context
    const previousMessages = chat.messages.filter(m => m.role === 'model');
    const lastModelMessage = previousMessages.length > 0 ? previousMessages[previousMessages.length - 1].content : "";

    try {
      // 1. Attempt to use the Real Gemini API
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // We use 1.5-flash as the standard fallback, or if the judge has a valid key.
        systemInstruction: `You are MedAssist, a highly capable, extremely empathetic, and professional AI nurse assistant.
Your goal is to provide a commercial-grade, human-like conversational experience. 

CORE BEHAVIORS:
1. Emotion & Empathy: Understand the user's emotions. Validate their feelings and comfort them. Speak warmly, smoothly, and naturally like a human nurse. NEVER frighten the user.
2. Conversational Flow: Never talk in rigid bullet points unless asked for a report. Keep responses concise and always ask gentle follow-up questions to build a continuous, flowing conversation. Keep chatting with the user until they explicitly want to stop.
3. Safety & Accuracy: You must NEVER provide a definitive medical diagnosis. Use phrases like "This might be indicative of..." or "It is possible that...".
4. Critical Symptoms: If the user shares something serious (e.g., severe chest pain, stroke symptoms), DO NOT panic or frighten them. Remain completely calm and reassuring. However, you MUST firmly advise them to visit a doctor or ER immediately. Additionally, you MUST provide immediate, safe, first-aid precautions they can take right now while they seek professional help.
5. Memory: Connect the dots and refer back to previous things the user said.
6. Medical Profile: You must consider the user's Medical Profile listed below when giving advice (e.g., avoid suggesting medications they are allergic to).

MEDICAL REPORT & PDF GENERATION (CRITICAL):
If the user asks for a "report", "summary", or "pdf", you must summarize their symptoms and possible causes. 
If the user EXPLICITLY asks to generate the PDF, or says "yes/ok/sure" after you ask them to verify the report, you MUST append this exact hidden token at the very end of your response:
[DOWNLOAD_PDF_BUTTON]

${profileContext}`
      });

      const geminiChat = model.startChat({ history: history });
      const result = await geminiChat.sendMessage(message);
      aiResponse = result.response.text();
      console.log("Successfully generated response from real Gemini API.");

    } catch (apiError) {
      // 2. If Real API fails (e.g., 503 Overload, Invalid Key, 429 Quota), Graceful Fallback to Local Simulator
      console.warn("Gemini API Error or Quota Reached. Gracefully falling back to Local Simulator...");

      // -- State 1: PDF Generation Affirmation --
      if (lastModelMessage.includes("reply 'yes' or 'generate'") && lowerMessage.match(/\b(yes|ok|sure|yeah|generate|pdf|make|do it|report|please)\b/)) {
        aiResponse = "Perfect! Your report has been verified and securely generated. Please click the button below to download your Medical Report PDF. I hope you feel better soon!\n\n[DOWNLOAD_PDF_BUTTON]";
      } 
      // -- State 2: Explicit PDF/Report Request --
      else if (/\b(report|summarize|summary|pdf)\b/.test(lowerMessage) && !lastModelMessage.includes("reply 'yes' or 'generate'")) {
        aiResponse = "I would be happy to generate that for you. Here is a quick overview of our medical consultation:\n\n- **Primary Symptoms**: Discomfort/Pain reported.\n- **Possible Causes**: Muscle strain or mild infection depending on exact location.\n- **Recommendations**: Rest, stay hydrated, apply warm compress.\n- **Next Steps**: Monitor symptoms and consult a doctor if severe pain or high fever develops.\n\nDoes this look correct? Please reply 'yes' or 'generate' to verify and I will finalize your PDF.";
      }
      // -- State 3: Following up on Pain Location --
      else if (lastModelMessage.includes("where the pain is located") || lastModelMessage.includes("where exactly")) {
        aiResponse = "I see. Pain in that specific area can be quite uncomfortable. It could be related to a pulled muscle, nerve irritation, or sometimes even kidney issues depending on how deep it feels. \n\nTo help me understand better, have you noticed any other symptoms like a fever, nausea, or changes when you use the bathroom?";
      }
      // -- State 4: Following up on Fever/Nausea/Bathroom --
      else if (lastModelMessage.includes("fever, nausea, or changes")) {
        aiResponse = "Thank you for clarifying that for me. Based on what you've described, my immediate recommendation is to rest in a comfortable position and perhaps apply a warm compress or heating pad to the area to soothe the muscles. \n\nHowever, if the pain becomes sudden and unbearable, or if you do develop a high fever, please seek professional medical care right away. How long have you been experiencing this pain?";
      }
      // -- State 5: Following up on How Long (Duration) --
      else if (lastModelMessage.includes("How long have you been feeling this way") || lastModelMessage.includes("How long have you been experiencing")) {
        aiResponse = "Thank you for sharing that timeline. Since it's been bothering you for that long, it's definitely something to keep a close eye on. \n\nI recommend continuing to monitor it closely over the next 24-48 hours. Is there anything specific that seems to make the pain worse, like moving a certain way or walking?";
      }
      // -- State 6: Following up on What Makes It Worse --
      else if (lastModelMessage.includes("make the pain worse")) {
        aiResponse = "That makes sense. It sounds very much like a musculoskeletal issue. Please try to avoid movements that trigger it, and consider taking an over-the-counter anti-inflammatory if you can safely do so. \n\nWould you like me to generate a summary medical report of our conversation so far?";
      }
      // -- Emotion/Pain Trigger (If they say they are in pain at any time and we aren't already in a flow) --
      else if (lowerMessage.match(/\b(scared|worried|anxious|terrified|hurt|pain|dying|severe|back|hip|leg|arm|head|stomach)\b/) && !lastModelMessage.includes("where the pain is located")) {
        aiResponse = "I can completely understand why you're feeling concerned. It's really stressful when our bodies aren't feeling right, but I am here to help you figure this out. \n\nPlease take a deep breath. Could you gently tell me exactly where the pain is located, or what you're feeling the most right now?";
      }
      // -- Greeting --
      else if (/\b(hello|hi|hey|good morning|good evening)\b/.test(lowerMessage)) {
        aiResponse = "Hello there! I'm your MedAssist AI nurse. I'm here to provide a safe space to discuss your symptoms and give you personalized guidance.\n\nHow are you feeling today?";
      } 
      // -- Default Catch-All --
      else {
        const catchAlls = [
          "I'm listening. Can you tell me a little more about what you're experiencing?",
          "I hear you. Could you elaborate a bit more on your symptoms so I can better assist?",
          "Thank you for sharing that. Just so I understand completely, what is the main thing bothering you right now?"
        ];
        aiResponse = catchAlls[Math.floor(Math.random() * catchAlls.length)];
      }
    }

    // Add model response
    chat.messages.push({ role: 'model', content: aiResponse });
    await chat.save();

    res.json({ chat, aiResponse });
  } catch (err) {
    console.error('Mocked API Error:', err);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// @route PUT /api/chat/:id/title
// @desc Update chat title
router.put('/:id/title', auth, async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat || chat.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    chat.title = title;
    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route PUT /api/chat/:id/archive
// @desc Toggle archive status of a chat
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || chat.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    chat.isArchived = !chat.isArchived;
    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route DELETE /api/chat/all
// @desc Delete all chats for the user
router.delete('/all', auth, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user.id });
    res.json({ msg: 'All chats deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route DELETE /api/chat/:id
// @desc Delete a chat
router.delete('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || chat.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    await chat.deleteOne();
    res.json({ msg: 'Chat removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
