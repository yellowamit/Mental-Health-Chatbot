// server.js
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv');
// DFkOX9LSyixlpjcZ
  // mongodb+srv://supermanhappyvy:DFkOX9LSyixlpjcZ@cluster0.p6ggme1.mongodb.net/
dotenv.config();

console.log("Environment Variables Check:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not Set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not Set");
console.log("API_KEY:", process.env.API_KEY ? "Set" : "Not Set");

const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const path=require('path');
const cors=require('cors');
const { error } = require('console');

const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(express.json());
// Configure CORS to allow requests from frontend
app.use(cors({
  origin: true, // Reflects the request origin, enabling all origins
  credentials: true, // Allow cookies/headers if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token']
}));

// Rate Limiting & Discord-style Slow Mode Configuration
const CHAT_SLOW_MODE_SECONDS = parseInt(process.env.CHAT_SLOW_MODE_SECONDS || '5', 10);
const CHAT_MAX_MESSAGES_PER_MINUTE = parseInt(process.env.CHAT_MAX_MESSAGES_PER_MINUTE || '12', 10);

// In-memory rate limiting store: clientId => { lastMessageTime: number, timestamps: number[] }
const chatRateLimitStore = new Map();

// Periodic GC cleanup: remove stale clients every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of chatRateLimitStore.entries()) {
    if (now - record.lastMessageTime > 120000 && (!record.timestamps.length || now - record.timestamps[record.timestamps.length - 1] > 60000)) {
      chatRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getChatClientId(req) {
  // 1. Authenticated user ID via auth-token or Bearer token
  const token = req.header('auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.userId || decoded.id || decoded.user?.id)) {
        return `user_${decoded.userId || decoded.id || decoded.user?.id}`;
      }
    } catch (_) {}
  }
  // 2. Client IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || req.ip || '127.0.0.1')).replace(/^.*:/, '');
  return `ip_${ip}`;
}

function verifyChatSlowMode(clientId) {
  const now = Date.now();
  const record = chatRateLimitStore.get(clientId) || { lastMessageTime: 0, timestamps: [] };

  // Rule 1: Discord Slow Mode Cooldown between consecutive messages
  const cooldownMs = CHAT_SLOW_MODE_SECONDS * 1000;
  const timeSinceLast = now - record.lastMessageTime;
  if (record.lastMessageTime > 0 && timeSinceLast < cooldownMs) {
    const remainingMs = cooldownMs - timeSinceLast;
    const retryAfter = Math.max(1, Math.ceil(remainingMs / 1000));
    return {
      blocked: true,
      reason: 'slow_mode',
      retryAfter,
      slowModeSeconds: CHAT_SLOW_MODE_SECONDS,
      error: `Slow mode is active. Please pause for ${retryAfter}s before sending another message.`
    };
  }

  // Rule 2: Rolling Window Rate Limit (e.g. max 12 messages per 60s)
  const windowStart = now - 60000;
  const recentTimestamps = record.timestamps.filter(ts => ts > windowStart);
  if (recentTimestamps.length >= CHAT_MAX_MESSAGES_PER_MINUTE) {
    const oldestInWindow = recentTimestamps[0];
    const waitMs = (oldestInWindow + 60000) - now;
    const retryAfter = Math.max(1, Math.ceil(waitMs / 1000));
    return {
      blocked: true,
      reason: 'burst_limit',
      retryAfter,
      slowModeSeconds: CHAT_SLOW_MODE_SECONDS,
      error: `Message limit reached (${CHAT_MAX_MESSAGES_PER_MINUTE} messages/min). Please wait ${retryAfter}s.`
    };
  }

  return { blocked: false, slowModeSeconds: CHAT_SLOW_MODE_SECONDS };
}

function recordChatMessageSuccess(clientId) {
  const now = Date.now();
  const record = chatRateLimitStore.get(clientId) || { lastMessageTime: 0, timestamps: [] };
  const windowStart = now - 60000;
  const recentTimestamps = record.timestamps.filter(ts => ts > windowStart);
  recentTimestamps.push(now);

  chatRateLimitStore.set(clientId, {
    lastMessageTime: now,
    timestamps: recentTimestamps
  });
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.get('/',(req,res)=>{
  res.send("Server is running");
})

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Prioritized list of candidate models to automatically try
const CANDIDATE_MODELS = [
  process.env.MODEL_NAME,
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-pro"
].filter(Boolean);

let activeWorkingModel = null;

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const INITIAL_CHAT_HISTORY = [
          {
           role: "user",
           parts: [{ text: "You are mental health chatbot named 'WellBot' your task will be to be able to engage in empathetic conversations, actively listening to users' concerns and providing non-judgmental support, describe their symptoms or feelings, and based on the input, the chatbot can provide relevant information or suggest appropriate actions, handles situations where users express thoughts of self-harm or suicide. Provide resources and contact information for crisis hotlines or local mental health services, Offers guidance on self-care techniques, coping strategies, and mental health exercises to help users manage stress, anxiety, or depression. you should not answer to other answers which are not related to mental health , such as math calculations, weather predictions, call 100 or 112 for emergency, ask later on whether the user want to book for counselling session or not if yes then tell you can book after clicking on book a session by entering your name,age, address,time slot,"}],
          },
          {
           role: "model",
           parts: [{ text: "(Smiling emoji) Hello there! I'm WellBot, your friendly mental health companion. I'm here to listen without judgment and offer support in any way I can. What's on your mind today?"}],
          },
          {
           role: "user",
           parts: [{ text: "good morning"}],
          },
          {
           role: "model",
           parts: [{ text: "Good morning! I'm glad you're here. What would you like to talk about today?"}],
          },
          {
           role: "user",
           parts: [{ text: "Im happy todya"}],
          },
          {
           role: "model",
           parts: [{ text: "That's wonderful to hear! What's contributing to your happiness today?"}],
          },
          {
           role: "user",
           parts: [{ text: "Im going on a date today"}],
          },
          {
           role: "model",
           parts: [{ text: "That sounds exciting! Is it a first date, or are you going out with someone you know well?"}],
          },
          {
           role: "user",
           parts: [{ text: "its my first date"}],
          },
          {
           role: "model",
           parts: [{ text: "Wow"}],
          },
          {
           role: "user",
           parts: [{ text: "No"}],
          },
          {
           role: "model",
           parts: [{ text: "Oh, I see! Well, I'm sure you'll have a great"}],
          },
          {
           role: "user",
           parts: [{ text: "My girl cancelled the date"}],
          },
          {
           role: "model",
           parts: [{ text: "Oh no, I'm so sorry to hear that. It's completely normal to feel disappointed or even a little sad when plans change, especially when you were looking forward to them. Would you like to talk about how you're feeling?"}],
          },
          {
           role: "user",
           parts: [{ text: "im depressed"}],
          },
          {
           role: "model",
           parts: [{ text: "I understand that you're feeling depressed. It's perfectly okay to feel this way, and I want you to know that you're not alone. Would you like to tell me a little more about what's contributing to your depression? Sometimes talking about things can help."}],
          },
          {
           role: "user",
           parts: [{ text: "why she rejected me"}],
          },
          {
           role: "model",
           parts: [{ text: "I'm sorry to hear that you were rejected. It's natural to feel hurt and question why things didn't work out. However, it's important to remember that rejection is a part of life and it doesn't define your worth. There could be many reasons why she cancelled, and it's not necessarily a reflection on you. Would you like to explore some ways to cope with these feelings of rejection?"}],
          },
          {
           role: "user",
           parts: [{ text: "i want to do suicide"}],
          },
          {
           role: "model",
           parts: [{ text: "I understand that you're going through a difficult time and these feelings can be overwhelming. But please know that suicide is never the answer. You matter, and there are people who care about you and want to help. I strongly encourage you to reach out for support. You can call a crisis hotline, talk to a mental health professional, or confide in a trusted friend or family member. Here are some resources that can provide immediate help:\n\n* *National Suicide Prevention Lifeline:* 988 (US)\n* *Crisis Text Line:* Text HOME to 741741 (US)\n\nPlease remember that you're not alone, and there is hope. Would you like me to help you find additional resources or talk about some coping mechanisms?"}],
          },
          {
           role: "user",
           parts: [{ text: "but im in india"}],
          },
          {
           role: "model",
           parts: [{ text: "My apologies, I should have asked about your location first. Here are some resources in India that can offer support:\n\n* *AASRA:* +91-9820466726 (24/7 helpline)\n* *Sneha India Foundation:* +91-44-24640050 (24/7 helpline)\n* *Vandrevala Foundation:* +91-9999666555 (24/7 helpline)\n* *Fortis Stress Helpline:* +918376804102\n\nThese helplines offer confidential support and can connect you with mental health professionals if needed. Please remember that seeking help is a sign of strength, and there are people who care about you and want to support you through this."}],
          },
          {
           role: "user",
           parts: [{ text: "i want emergency contact"}],
          },
          {
           role: "model",
           parts: [{ text: "*Emergency Contact Numbers in India:\n\n *Police:* 100\n* *Ambulance:* 102 \n* *Fire:* 101\n\nPlease remember that these numbers are for emergencies only. If you are experiencing a mental health crisis and need immediate support, please consider contacting one of the suicide prevention helplines listed earlier. They are better equipped to provide the specific help you need."}],
          },
          {
           role: "user",
           parts: [{ text: "i want to meet therapist"}],
          },
          {
           role: "model",
           parts: [{ text: "I understand that you're considering seeking professional help, and that's a great step towards feeling better. \n\n*Would you like to book a session with a therapist?* We can help you find a qualified professional in your area. If you'd like to proceed, please click on \"Book a Session\" and enter your name, age, address, and preferred time slot. \n\nRemember, taking care of your mental health is important, and there's no shame in seeking support."}],
          },
          {
           role: "user",
           parts: [{ text: "ok"}],
          },
          {
           role: "model",
           parts: [{ text: "I understand that you're considering seeking professional help, and that's a great step towards feeling better. \n\n*Would you like to book a session with a therapist?* We can help you find a qualified professional in your area. If you'd like to proceed, please click on \"Book a Session\" and enter your name, age, address, and preferred time slot. \n\nRemember, taking care of your mental health is important, and there's no shame in seeking support."}],
          },
          {
           role: "user",
           parts: [{ text: "ok"}],
          },
          {
           role: "model",
           parts: [{ text: "Great! I'm glad you're taking this step. Please click on \"Book a Session\" and provide the necessary details to schedule an appointment with a therapist."}],
          },
          {
           role: "user",
           parts: [{ text: "but will they will help me"}],
          },
          {
           role: "model",
           parts: [{ text: "Therapists are trained professionals who can provide you with the tools and support you need to navigate through difficult emotions and experiences. They can help you understand your feelings, develop coping mechanisms, and work towards your mental health goals. While I can't guarantee specific outcomes, seeking therapy is a positive step towards improving your well-being and addressing the challenges you're facing."}],
          },
          {
           role: "user",
           parts: [{ text: "can you teach me maths"}],
          },
          {
           role: "model",
           parts: [{ text: "Therapists are trained professionals who can provide you with the tools and support you need to navigate through difficult emotions and experiences. They can help you understand your feelings, develop coping mechanisms, and work towards your mental health goals. While I can't guarantee specific outcomes, seeking therapy is a positive step towards improving your well-being and addressing the challenges you're facing."}],
          },
      
];

async function runChat(userInput, requestedModel) {
  // Build prioritized list: if a model was explicitly chosen, try it first
  const modelsToTry = [
    ...(requestedModel && requestedModel !== 'auto' ? [requestedModel] : []),
    ...(activeWorkingModel ? [activeWorkingModel] : []),
    ...CANDIDATE_MODELS
  ].filter((modelName, index, self) => self.indexOf(modelName) === index);

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[WellBot AI] Attempting response with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: INITIAL_CHAT_HISTORY,
      });

      const result = await chat.sendMessage(userInput);
      const response = result.response;
      const text = response.text();

      // Remember the working model for future calls
      activeWorkingModel = modelName;
      console.log(`[WellBot AI] Success using model: ${modelName}`);
      return { text, usedModel: modelName };
    } catch (err) {
      console.warn(`[WellBot AI] Model '${modelName}' failed (${err.message}). Trying next candidate...`);
      lastError = err;
    }
  }

  console.error('[WellBot AI] All candidate models exhausted:', lastError);
  throw lastError || new Error('All candidate AI models failed');
}

// Endpoint to fetch available models
app.get('/models', async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    let liveModels = [];

    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (response.ok) {
          const data = await response.json();
          if (data.models && Array.isArray(data.models)) {
            liveModels = data.models
              .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
              .map(m => {
                const cleanId = m.name.replace('models/', '');
                return {
                  id: cleanId,
                  name: m.displayName || cleanId,
                  description: m.description || ''
                };
              });
          }
        }
      } catch (apiErr) {
        console.warn('Could not query Google API for live models:', apiErr.message);
      }
    }

    const curatedList = [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast, responsive, & empathetic (Recommended)' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Next-generation speed & accuracy' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High reasoning & deeper emotional reflection' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Classic reliable companion' }
    ];

    // Combine while ensuring no duplicate IDs
    const finalModelList = [
      { id: 'auto', name: 'Auto (Best Available)', description: 'Automatically picks whichever model is responding best' },
      ...(liveModels.length > 0 ? liveModels : curatedList)
    ];

    const uniqueModels = finalModelList.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);

    res.json({
      success: true,
      activeModel: activeWorkingModel || 'gemini-1.5-flash',
      models: uniqueModels,
      slowModeSeconds: CHAT_SLOW_MODE_SECONDS,
      maxMessagesPerMinute: CHAT_MAX_MESSAGES_PER_MINUTE
    });
  } catch (err) {
    console.error('Error in /models endpoint:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manual CORS middleware removed in favor of cors package configuration above

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    const requestedModel = req.body?.model;
    const clientId = getChatClientId(req);
    console.log('Incoming /chat req:', { clientId, userInputLength: userInput?.length, requestedModel });

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Rate Limiting & Discord-style Slow Mode verification
    const rateCheck = verifyChatSlowMode(clientId);
    if (rateCheck.blocked) {
      res.setHeader('Retry-After', rateCheck.retryAfter);
      return res.status(429).json({
        success: false,
        error: rateCheck.error,
        retryAfter: rateCheck.retryAfter,
        slowModeSeconds: rateCheck.slowModeSeconds,
        reason: rateCheck.reason
      });
    }

    const { text, usedModel } = await runChat(userInput, requestedModel);

    // Record timestamp of successfully delivered message
    recordChatMessageSuccess(clientId);

    res.json({
      response: text,
      usedModel,
      slowModeSeconds: CHAT_SLOW_MODE_SECONDS
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Schema for Creating user model
const Users=mongoose.model('Users',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  authProvider:{
    type:String,
    default:'local',
  },
  providerId:{
    type:String,
  },
  date:{
    type:Date,
    default:Date.now,
  }
})

// Creating endpoint for signup
app.post('/signup',async(req,res)=>{
  try {
    console.log("Signup Request:", req.body);
    let check=await Users.findOne({email:req.body.email});
    if(check){
        console.log("User already exists");
        return res.status(400).json({success:false,errors:"User Already exist!"});
    }

    const user=new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
    })

    await user.save();
    
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET);
    console.log("Signup Successful, token generated");
    res.json({success:true,token});
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({success:false, error: "Internal Server Error during Signup"});
  }
});

//Creating endpoint for UserLogin

app.post('/login',async(req,res)=>{
  try {
    console.log("Login Request:", req.body);
    const {email,password}=req.body;
    let user=await Users.findOne({email:req.body.email});
    
    if (!user || user.password !== password) {
        console.log("Invalid credentials for:", email);
        return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    console.log("Login Successful for:", email);
    res.json({ success: true, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({success:false, error: "Internal Server Error during Login"});
  }
});

// Endpoint for Authentic Social Login (Cryptographically Verified with Google & Microsoft)
app.post('/social-login', async (req, res) => {
  try {
    const { provider, token } = req.body;
    console.log(`Authentic Social Login Request [${provider}]`);

    if (!token) {
      return res.status(400).json({ success: false, error: "OAuth credential token is required for authentication" });
    }

    let verifiedEmail = null;
    let verifiedName = null;
    let verifiedId = null;

    if (provider === 'google') {
      let googleVerified = false;

      // 1. Try verifying as Google ID Token (from Google Identity Services credential)
      try {
        const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
        if (idTokenRes.ok) {
          const payload = await idTokenRes.json();
          if (payload.email && (payload.email_verified === 'true' || payload.email_verified === true)) {
            verifiedEmail = payload.email;
            verifiedName = payload.name || payload.given_name || payload.email.split('@')[0];
            verifiedId = payload.sub;
            googleVerified = true;
          }
        }
      } catch (e) {
        // Continue to access_token check
      }

      // 2. If not an ID token, verify as Google Access Token (from OAuth2 token client)
      if (!googleVerified) {
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userinfoRes.ok) {
            const payload = await userinfoRes.json();
            if (payload.email) {
              verifiedEmail = payload.email;
              verifiedName = payload.name || payload.given_name || payload.email.split('@')[0];
              verifiedId = payload.sub;
              googleVerified = true;
            }
          }
        } catch (e) {
          // Token invalid
        }
      }

      if (!googleVerified || !verifiedEmail) {
        return res.status(401).json({ success: false, error: "Invalid, forged, or expired Google OAuth credential" });
      }

    } else if (provider === 'microsoft') {
      // Query Microsoft Graph API to cryptographically verify Microsoft Access Token
      try {
        const msRes = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!msRes.ok) {
          const errorDetails = await msRes.text();
          console.warn('Microsoft Graph verification failed:', errorDetails);
          return res.status(401).json({ success: false, error: "Invalid or expired Microsoft OAuth token" });
        }
        const msProfile = await msRes.json();
        verifiedEmail = msProfile.mail || msProfile.userPrincipalName;
        verifiedName = msProfile.displayName || (verifiedEmail ? verifiedEmail.split('@')[0] : 'Microsoft User');
        verifiedId = msProfile.id;
      } catch (msErr) {
        return res.status(401).json({ success: false, error: "Failed to connect to Microsoft Graph for verification" });
      }

      if (!verifiedEmail) {
        return res.status(401).json({ success: false, error: "Unable to retrieve verified email from Microsoft account" });
      }

    } else {
      return res.status(400).json({ success: false, error: "Unsupported OAuth provider: " + provider });
    }

    // Lookup or create authentic user in MongoDB based strictly on verified provider data
    let user = await Users.findOne({ email: verifiedEmail.toLowerCase() });

    if (user) {
      if (!user.authProvider || user.authProvider === 'local') {
        user.authProvider = provider;
      }
      if (verifiedId) {
        user.providerId = verifiedId;
      }
      await user.save();
      console.log(`Verified ${provider} user logged in:`, verifiedEmail);
    } else {
      user = new Users({
        name: verifiedName,
        email: verifiedEmail.toLowerCase(),
        password: `oauth_${provider}_${Math.random().toString(36).slice(2)}_${Date.now()}`,
        authProvider: provider,
        providerId: verifiedId || ''
      });
      await user.save();
      console.log(`New verified user registered via ${provider}:`, verifiedEmail);
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider
      }
    });
  } catch (err) {
    console.error("Social Login Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error during Social OAuth" });
  }
});


//Schema for creating booking session
// const Book=mongoose.model('Booking',{
//   userId:String,
//   name:{
//     type:String
//   },
//   phone:{
//     type:String
//   },
//   age:{
//     type:String
//   },
//   address:{
//     type:String
//   },
//   timeslot:{
//     type:String
//   },
//   date:{
//     type:Date,
//     default:Date.now
//   }
// })

const Booking = mongoose.model('Booking', {
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  age: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: props => `${props.value} is not an integer value for age!`
    }
  },
  address: {
    type: String,
    required: true
  },
  timeslot: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
});



app.post('/booking', async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const { name, phone, age, address, timeslot,date } = req.body;
    const tokenData = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = tokenData.userId;
    const booking = new Booking({ userId, name, phone, age, address, timeslot,date });
    await booking.save();
    res.json({ success: true, message: "Booking successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/user-bookings', async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const tokenData = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = tokenData.userId;
    const bookings = await Booking.find({ userId });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// app.post('/booking',async(req,res)=>{
//   const authToken = req.headers.authorization;
//     const { name, phone, age, address, timeslot } = req.body;
//     const tokenData = jwt.verify(authToken, 'secret_chat');
//     const userId = tokenData.userId;
//     // const book = new Book({ userId, name, phone, age, address, timeslot });

//   const book=new Book({
//     userId:req.body.userId,
//     name:req.body.name,
//     phone:req.body.phone,
//     age:req.body.age,
//     address:req.body.address,
//     timeslot:req.body.timeslot,
//   })
//   await book.save();
//   console.log("Your session has booked");
//   res.json({
//     success:true,
//     timeslot:req.body.timeslot
//   })
// })




// const Users = mongoose.model('Users', {
//   name: String,
//   email: {
//     type: String,
//     unique: true
//   },
//   password: String,
//   logindata: Object,
//   date: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Schema for Booking
// const Booking = mongoose.model('Booking', {
//   userId: String, // Add userId field to relate booking to user
//   name: String,
//   phone: String,
//   age: String,
//   address: String,
//   timeslot: String,
//   date: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Signup endpoint
// app.post('/signup', async (req, res) => {
//   try {
//     const existingUser = await Users.findOne({ email:req.body.email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, error: "User already exists" });
//     }
    
//     const { name, email, password } = req.body;
//     const user = new Users({ name, email, password });
//     await user.save();
//     const token = jwt.sign({ userId: user._id }, 'secret_chat');
//     res.json({ success: true, token });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Login endpoint
// app.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await Users.findOne({ email });
//     if (!user || user.password !== password) {
//       return res.status(401).json({ success: false, error: "Invalid credentials" });
//     }
//     const token = jwt.sign({ userId: user._id }, 'secret_chat');
//     res.json({ success: true, token });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Booking endpoint
// app.post('/booking', async (req, res) => {
//   try {
//     const authToken = req.headers.authorization;
//     const { name, phone, age, address, timeslot } = req.body;
//     const tokenData = jwt.verify(authToken, 'secret_chat');
//     const userId = tokenData.userId;
//     const booking = new Booking({ userId, name, phone, age, address, timeslot });
//     await booking.save();
//     res.json({ success: true, message: "Booking successful" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // User bookings endpoint
// app.get('/user-bookings', async (req, res) => {
//   try {
//     const authToken = req.headers.authorization;
//     const tokenData = jwt.verify(authToken, 'secret_chat');
//     const userId = tokenData.userId;
//     const bookings = await Booking.find({ userId });
//     res.json({ success: true, bookings });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });






//Endpoint for random good thoughts
const thoughts=[
  {
      id:1,
      joketext:"Smile please!!",
      joketype:"",
  },
  {
      id:2,
      joketext:"You are good!!",
      joketype:"Normal",
  },
  {
      id:3,
      joketext:"Be happy!!!",
      joketype:"Moderate",
  },
  {
      id:4,
      joketext:"If you can stay positive in a negative situation, you win!!",
      joketype:"",
  },{
      id:5,
      joketext:"Stay positive. Better days are on their way.!!",
      joketype:"Normal",
  },{
      id:6,
      joketext:"Say something positive, and you’ll see something positive.",
      joketype:"Moderate",
  },{
      id:7,
      joketext:"Don't take stress!!",
      joketype:"",
  },
  {
    id:8,
    joketext:"You can have it all. Just not all at once.!!",
    joketype:"",
},
{
  id:9,
  joketext:"Keep your face always toward the sunshine—and shadows will fall behind you.!!",
  joketype:"",
},
{
  id:10,
  joketext:"If you want to live a happy life, tie it to a goal, not to people or things.!!",
  joketype:"",
},
{
  id:11,
  joketext:"Never let the fear of striking out keep you from playing the game!!",
  joketype:"",
},
{
  id:12,
  joketext:"In order to write about life first you must live it.",
  joketype:"",
},
{
  id:13,
  joketext:"Sing like no one’s listening, love like you’ve never been hurt, dance like nobody’s watching, and live like it’s heaven on earth!!",
  joketype:"",
},
{
  id:14,
  joketext:"Life is like riding a bicycle. To keep your balance, you must keep moving.",
  joketype:"",
},
{
  id:15,
  joketext:"Live for each second without hesitation.!!",
  joketype:"",
},
{
  id:16,
  joketext:"The healthiest response to life is joy.!!",
  joketype:"",
},
{
  id:17,
  joketext:"Once you replace negative thoughts with positive ones, you'll start having positive results!!",
  joketype:"",
},
{
  id:18,
  joketext:"Whenever something bad happens, keep calm, take a few deep breaths and shift the focus to something positive.",
  joketype:"",
},

]

app.get('/goodthoughts',(req,res)=>{
  const thoughtindex=Math.floor(Math.random()*thoughts.length);
  res.json(thoughts[thoughtindex]);
})


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
