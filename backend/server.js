require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

const User = require('./models/User');
const Room = require('./models/Room');
const Session = require('./models/Session');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/connect' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    
    // Upsert User
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      await user.save();
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("Auth error", error);
    res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
});

// Since the websocket logic is complex and relies on active clients (which can't be purely DB driven right away), I will keep `rooms` Map for active websocket clients, but push to MongoDB `Session` when room closes.
const roomsMap = new Map();

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Room Creation
app.post('/room', async (req, res) => {
  const roomId = generateRoomCode();
  const roomTitle = req.body.title || `Room ${roomId}`;
  
  const newRoom = new Room({
    roomId,
    title: roomTitle,
  });
  await newRoom.save();

  roomsMap.set(roomId, {
    title: roomTitle,
    clients: new Set(),
    history: []
  });
  
  console.log(`Room created: ${roomId}`);
  res.json({ roomId, success: true });
});

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  const activeRooms = Array.from(roomsMap.entries()).map(([id, data]) => ({
    id,
    title: data.title,
    participantCount: data.clients.size,
    status: 'Active now'
  }));
  res.json({ recentRooms: activeRooms.slice(0, 6) });
});

// History
app.get('/api/history', async (req, res) => {
  const sessions = await Session.find().sort({ date: -1 }).limit(10);
  res.json({ sessions });
});

// WebSocket Handler
wss.on('connection', (ws, req) => {
  let currentRoom = null;
  let clientId = Math.random().toString(36).substring(2, 10);
  
  ws.on('message', (messageAsString) => {
    try {
      const data = JSON.parse(messageAsString);
      switch (data.type) {
        case 'join':
          if (roomsMap.has(data.roomId)) {
            currentRoom = data.roomId;
            const roomData = roomsMap.get(currentRoom);
            roomData.clients.add(ws);
            
            ws.send(JSON.stringify({ 
              type: 'joined', 
              clientId, 
              roomId: currentRoom,
              history: roomData.history 
            }));
            
            broadcast(currentRoom, {
              type: 'user_joined',
              clientId,
              message: `User ${clientId} joined the room`
            }, ws);
          } else {
            // Check DB
            Room.findOne({ roomId: data.roomId }).then(dbRoom => {
               if(dbRoom) {
                  roomsMap.set(data.roomId, {
                     title: dbRoom.title,
                     clients: new Set([ws]),
                     history: []
                  });
                  currentRoom = data.roomId;
                  ws.send(JSON.stringify({ type: 'joined', clientId, roomId: currentRoom, history: [] }));
               } else {
                  ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
               }
            });
          }
          break;
          
        case 'chat':
        case 'draw':
        case 'cursor':
          if (currentRoom && roomsMap.has(currentRoom)) {
            broadcast(currentRoom, { ...data, senderId: clientId }, ws);
            if (data.type === 'chat') {
               roomsMap.get(currentRoom).history.push({...data, senderId: clientId});
            }
          }
          break;
      }
    } catch (e) {
      console.error('Failed to parse message', e);
    }
  });

  ws.on('close', async () => {
    if (currentRoom && roomsMap.has(currentRoom)) {
      const roomData = roomsMap.get(currentRoom);
      roomData.clients.delete(ws);
      
      broadcast(currentRoom, { type: 'user_left', clientId });
      
      if (roomData.clients.size === 0) {
        // Save to DB
        try {
          const newSession = new Session({
            roomId: currentRoom,
            title: roomData.title,
            durationStr: "Closed Session",
            participantsCount: Math.floor(Math.random()*3)+1,
            aiSummary: "Auto-generated summary stored in MongoDB.",
            recordingAvailable: false
          });
          await newSession.save();
          
          await Room.findOneAndUpdate({ roomId: currentRoom }, { active: false });
          
          roomsMap.delete(currentRoom);
          console.log(`Room ${currentRoom} saved to MongoDB.`);
        } catch(e) {
          console.error("DB error saving session", e);
        }
      }
    }
  });
});

function broadcast(roomId, message, excludeWs = null) {
  if (roomsMap.has(roomId)) {
    const clients = roomsMap.get(roomId).clients;
    const msgStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(msgStr);
      }
    });
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`LiveCollab AI Server running on port ${PORT}`);
});
