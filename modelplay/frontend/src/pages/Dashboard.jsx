import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, BrainCircuit, Activity, Waypoints, Cpu, Trophy, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getAllModules } from '../utils/contentLoader';
import Leaderboard from '../components/Leaderboard';
import TrophyRoom from '../components/TrophyRoom';
import ThemeToggle from '../components/ThemeToggle';

const iconMap = { BrainCircuit, Waypoints, Cpu };

const colorStyles = {
    purple: { card: 'from-purple-600/10', iconBg: 'bg-purple-500/20', iconText: 'text-purple-400', btn: 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' },
    blue:   { card: 'from-blue-600/10',   iconBg: 'bg-blue-500/20',   iconText: 'text-blue-400',   btn: 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
    emerald:{ card: 'from-emerald-600/10', iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
};

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const modules = getAllModules();
    const [activeTab, setActiveTab] = useState('modules');

    const completedCount = user?.completed_modules?.length || 0;
    const totalModules = modules.length;
    const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    const tabs = [
        { key: 'modules', label: 'Modules', icon: BrainCircuit },
        { key: 'trophies', label: 'Trophy Room', icon: Trophy },
        { key: 'leaderboard', label: 'Leaderboard', icon: BarChart3 }
    ];

    return (
        <div className={`min-h-screen p-8 font-sans transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900'}`}>
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-5xl mx-auto w-full space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{user?.username || 'Scholar'}</span>
                        </h1>
                        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your interactive ML journey continues today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <motion.div whileHover={{ scale: 1.05 }} className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg border backdrop-blur-md ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                            <Flame className="w-8 h-8 text-orange-500 animate-pulse" fill="#f97316" />
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Streak</p>
                                <p className="text-2xl font-bold">{user?.current_streak || 1}</p>
                            </div>
                        </motion.div>
                        <button onClick={logout} className={`px-4 py-3 rounded-2xl text-sm font-bold transition-colors border ${isDark ? 'bg-slate-800/50 hover:bg-slate-700 border-slate-700/50' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>Logout</button>
                    </div>
                </div>

                {/* Progress */}
                <motion.div variants={itemVariants} className={`backdrop-blur-xl rounded-[2rem] p-8 border shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="text-purple-400" /> Course Progress</h3>
                            <span className="text-2xl font-black text-purple-400">{progressPercent}%</span>
                        </div>
                        <div className={`w-full rounded-full h-4 overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700/50' : 'bg-slate-100 border-slate-200'}`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5, type: 'spring' }} className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className={`flex gap-2 p-2 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                                activeTab === tab.key 
                                ? 'bg-purple-600 text-white shadow-lg' 
                                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}>
                                <Icon className="w-4 h-4" /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'modules' && (
                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((mod) => {
                            const IconComp = iconMap[mod.icon] || BrainCircuit;
                            const styles = colorStyles[mod.color] || colorStyles.purple;
                            const isCompleted = user?.completed_modules?.includes(mod.slug);
                            return (
                                <motion.div key={mod.slug} whileHover={{ y: -5, scale: 1.01 }} className={`backdrop-blur-lg p-8 rounded-[2rem] border shadow-xl overflow-hidden relative group transition-all ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${styles.card} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className={`${styles.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                                            <IconComp className={`${styles.iconText} w-6 h-6`} />
                                        </div>
                                        {isCompleted && <span className="absolute top-6 right-6 text-2xl">✅</span>}
                                        <h4 className="text-2xl font-bold mb-3">{mod.title}</h4>
                                        <p className={`leading-relaxed flex-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{mod.description}</p>
                                        <div className="mt-8 flex gap-3">
                                            <Link to={`/learn/${mod.slug}`} className={`flex-1 text-center px-4 py-3 rounded-xl font-semibold transition-colors text-sm ${isDark ? 'bg-slate-700/50 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Read</Link>
                                            {mod.interactiveComponent ? (
                                                <Link to={`/play/${mod.slug}`} className={`flex-1 text-center text-white px-4 py-3 rounded-xl font-semibold transition-all text-sm ${styles.btn}`}>Play</Link>
                                            ) : (
                                                <Link to={`/quiz/${mod.slug}`} className={`flex-1 text-center text-white px-4 py-3 rounded-xl font-semibold transition-all text-sm ${styles.btn}`}>Quiz</Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {activeTab === 'trophies' && <TrophyRoom earnedBadges={user?.badges || []} />}
                {activeTab === 'leaderboard' && <Leaderboard />}
            </motion.div>
        </div>
    );
}
