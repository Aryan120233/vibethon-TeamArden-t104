import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Shield, Crown, BrainCircuit, Waypoints, Cpu, Gamepad2, Target, ChevronRight, Flame, Trophy, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getAllModules } from '../utils/contentLoader';
import Leaderboard from '../components/Leaderboard';
import TrophyRoom from '../components/TrophyRoom';
import ThemeToggle from '../components/ThemeToggle';

const iconMap = { BrainCircuit, Waypoints, Cpu };

const dayLabels = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
const today = new Date().getDay(); // 0=Sun
const todayIdx = today === 0 ? 6 : today - 1;

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const modules = getAllModules();
    const [activeSection, setActiveSection] = useState('home');

    const completedCount = user?.completed_modules?.length || 0;
    const totalModules = modules.length;
    const streak = user?.current_streak || 0;

    const arcadeGames = [
        { name: 'Data Dash', icon: '🎮', desc: 'Crossy Road × Decision Trees', path: '/play/data-dash', color: 'bg-indigo-50 border-indigo-200', iconBg: 'bg-indigo-100' },
        { name: 'Centroid Swarm', icon: '🌀', desc: 'Agar.io × K-Means', path: '/play/centroid-swarm', color: 'bg-cyan-50 border-cyan-200', iconBg: 'bg-cyan-100' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Top Nav */}
            <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="w-7 h-7 text-purple-500" />
                    <span className="text-xl font-extrabold tracking-tight">ModelPlay</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {['home', 'trophies', 'leaderboard'].map(s => (
                        <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${activeSection === s ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                            {s === 'home' ? 'Home' : s === 'trophies' ? 'Trophies' : 'Leaderboard'}
                        </button>
                    ))}
                    <button onClick={logout} className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl transition-colors">Logout</button>
                </div>
            </nav>

            {activeSection === 'trophies' && (
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <h2 className="text-2xl font-bold mb-6">Trophy Room</h2>
                    <TrophyRoom earnedBadges={user?.badges || []} />
                </div>
            )}

            {activeSection === 'leaderboard' && (
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <h2 className="text-2xl font-bold mb-6">Global Leaderboard</h2>
                    <Leaderboard />
                </div>
            )}

            {activeSection === 'home' && (
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ─── LEFT SIDEBAR (1/3) ─── */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search modules, concepts..." className="w-full pl-11 pr-16 py-3 rounded-full bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 shadow-sm" />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full transition-colors">Ask</button>
                            </div>

                            {/* Streak Card */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-4xl font-black text-gray-900">{streak}</span>
                                    <Zap className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500 mb-5">
                                    {streak > 0 ? `${streak}-day streak! Keep it going.` : 'Solve 3 problems to start a streak'}
                                </p>
                                <div className="flex items-center gap-2">
                                    {dayLabels.map((d, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            i === todayIdx
                                            ? 'border-2 border-gray-400 text-gray-700 bg-gray-50'
                                            : i < todayIdx && streak > 0
                                            ? 'bg-orange-400 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Premium Banner */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-bold text-gray-700">ModelPlay Premium</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Unlock all modules, games, and advanced ML content.</p>
                                <button className="w-full bg-gradient-to-r from-purple-400 to-orange-400 text-white rounded-xl py-2.5 text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
                                    Unlock all learning with Premium
                                </button>
                            </motion.div>

                            {/* Leagues Card */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="w-8 h-8 text-gray-300" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">UNLOCK LEAGUES</p>
                                        <p className="text-xs text-gray-400">{completedCount * 50} of 175 XP</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                                    <div className="bg-purple-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (completedCount * 50 / 175) * 100)}%` }}></div>
                                </div>
                            </motion.div>

                            {/* Progress Summary */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Progress</p>
                                <p className="text-2xl font-black text-gray-900">{completedCount}<span className="text-sm font-semibold text-gray-400">/{totalModules} modules</span></p>
                            </div>
                        </div>

                        {/* ─── RIGHT MAIN CONTENT (2/3) ─── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Hero Course Card */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                                <div className="p-8 pb-0">
                                    <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Recommended</span>
                                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Decision Trees</h2>
                                    <p className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-6">Level 1</p>
                                </div>
                                <div className="px-8 py-8 flex items-center justify-center">
                                    <div className="w-40 h-40 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl flex items-center justify-center border border-purple-100">
                                        <BrainCircuit className="w-20 h-20 text-purple-400" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div className="px-8 pb-8">
                                    <Link to="/learn/decision-trees">
                                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-2xl py-4 font-bold text-lg shadow-sm transition-colors">
                                            Start
                                        </motion.button>
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Module Carousel */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Continue Learning</h3>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {modules.map((mod) => {
                                        const IconComp = iconMap[mod.icon] || BrainCircuit;
                                        const colorMap = {
                                            purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-400', pill: 'bg-purple-100 text-purple-600' },
                                            blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-400', pill: 'bg-blue-100 text-blue-600' },
                                            emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-400', pill: 'bg-emerald-100 text-emerald-600' },
                                        };
                                        const c = colorMap[mod.color] || colorMap.purple;
                                        const isCompleted = user?.completed_modules?.includes(mod.slug);
                                        return (
                                            <Link key={mod.slug} to={`/learn/${mod.slug}`} className="shrink-0">
                                                <motion.div whileHover={{ y: -3 }} className={`w-44 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                                                    <div className={`w-12 h-12 ${c.bg} ${c.border} border rounded-xl flex items-center justify-center mb-3`}>
                                                        <IconComp className={`w-6 h-6 ${c.icon}`} />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{mod.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.pill}`}>
                                                            {isCompleted ? '✅ Done' : 'Module'}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Arcade Games Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">🎮 Arcade Games</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {arcadeGames.map((game) => (
                                        <Link key={game.path} to={game.path}>
                                            <motion.div whileHover={{ y: -2 }} className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4`}>
                                                <div className={`w-12 h-12 ${game.iconBg} rounded-xl flex items-center justify-center text-2xl shrink-0`}>{game.icon}</div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{game.name}</h4>
                                                    <p className="text-xs text-gray-500">{game.desc}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Interactive Labs */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">🔬 Interactive Labs</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link to="/play/decision-trees">
                                        <motion.div whileHover={{ y: -2 }} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0"><BrainCircuit className="w-6 h-6 text-purple-500" /></div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">Decision Boundary Lab</h4>
                                                <p className="text-xs text-gray-500">Tune max_depth & min_samples</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                                        </motion.div>
                                    </Link>
                                    <Link to="/play/k-means-clustering">
                                        <motion.div whileHover={{ y: -2 }} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><Waypoints className="w-6 h-6 text-blue-500" /></div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">K-Means Clustering Lab</h4>
                                                <p className="text-xs text-gray-500">Adjust K and watch clusters form</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                                        </motion.div>
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
