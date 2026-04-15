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

const { MongoMemoryServer } = require('mongodb-memory-server');

// Initialize MongoDB
const connectDB = async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('MongoDB Memory Server Connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
};

connectDB();

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

// Quiz completion endpoint
app.post('/api/quiz/complete', authMiddleware, async (req, res) => {
    try {
        const { module, score, badge } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user.completed_modules.includes(module)) {
            user.completed_modules.push(module);
        }

        // Award badge if not already earned
        const hasBadge = user.badges.some(b => b.title === badge.title);
        if (!hasBadge) {
            user.badges.push({ title: badge.title, icon: badge.icon, date_earned: new Date() });
        }

        // Increment streak
        user.current_streak = (user.current_streak || 0) + 1;
        await user.save();

        res.json({ message: 'Quiz completed!', user: { completed_modules: user.completed_modules, badges: user.badges, current_streak: user.current_streak } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await User.find()
            .select('username completed_modules badges current_streak')
            .sort({ 'completed_modules': -1 })
            .limit(50);

        const leaderboard = users.map((u, i) => ({
            rank: i + 1,
            username: u.username,
            modulesCompleted: u.completed_modules.length,
            badgeCount: u.badges.length,
            streak: u.current_streak
        }));

        res.json(leaderboard);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ModelPlay Node Backend running securely on http://localhost:${PORT}`);
});
