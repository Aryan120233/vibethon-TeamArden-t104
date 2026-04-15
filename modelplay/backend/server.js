require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error. Ensure MongoDB is running or update MONGO_URI in .env:', err.message));

// Routes
app.use('/api/auth', authRoutes);

// Protected routes
app.get('/api/progress', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json({
            completedModules: user.completed_modules,
            currentStreak: user.current_streak,
            badges: user.badges
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.post('/api/progress', authMiddleware, async (req, res) => {
    try {
        const { module } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user.completed_modules.includes(module)) {
            user.completed_modules.push(module);
            await user.save();
        }
        res.json({ message: 'Progress updated', progress: user.completed_modules });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ModelPlay Node Backend running securely on http://localhost:${PORT}`);
});
