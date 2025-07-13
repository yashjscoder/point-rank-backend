const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const ClaimHistory = require('./models/ClaimHistory');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://yashjscoder:UyC7UEThyt0U3G4Q@cluster0.tfgunrn.mongodb.net/userpoints?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected');
  initUsers();
})
.catch(error => {
  console.error('❌ MongoDB connection error:', error);
});


// Create 10 default users if DB is empty
async function initUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    const names = ['Rahul', 'Kamal', 'Sanak', 'User4', 'User5', 'User6', 'User7', 'User8', 'User9', 'User10'];
    await User.insertMany(names.map(name => ({ name })));
    console.log('📦 Default users added');
  }
}

// Get all users sorted by points
app.get('/api/users', async (req, res) => {
  const users = await User.find().sort({ totalPoints: -1 });
  res.json(users);
});

// Add new user
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newUser = new User({ name });
  await newUser.save();
  res.json(newUser);
});

// Claim random points
app.post('/api/claim', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const points = Math.floor(Math.random() * 10) + 1;
  user.totalPoints += points;
  await user.save();

  const history = new ClaimHistory({ userId, pointsClaimed: points });
  await history.save();

  res.json({ user, claimedPoints: points });
});

// Get claim history (optional)
app.get('/api/claim-history', async (req, res) => {
  const history = await ClaimHistory.find()
    .populate('userId', 'name')
    .sort({ claimedAt: -1 });
  res.json(history);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
