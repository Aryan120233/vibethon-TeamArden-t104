import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, BrainCircuit, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useContext(AuthContext);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto w-full space-y-12"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{user?.username || 'Scholar'}</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Your interactive ML journey continues today.</p>
                    </div>
                    
                    {/* Fire Streak Badge */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-2xl shadow-lg"
                    >
                        <Flame className="w-8 h-8 text-orange-500 animate-pulse" fill="#f97316" />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Streak</p>
                            <p className="text-2xl font-bold">{user?.current_streak || 1} Days</p>
                        </div>
                    </motion.div>
                </div>

                {/* Progress Bar Section */}
                <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl rounded-[2rem] p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="text-purple-400" /> Course Progress
                            </h3>
                            <span className="text-2xl font-black text-purple-400">12%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-700/50">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '12%' }}
                                transition={{ duration: 1.5, type: 'spring' }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Modules Grid */}
                <div>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <BrainCircuit className="text-blue-400" /> Available Modules
                    </h3>
                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                        {/* Decision Trees Card */}
                        <motion.div 
                            whileHover={{ y: -5, scale: 1.01 }}
                            className="bg-slate-800/30 backdrop-blur-lg p-8 rounded-[2rem] border border-slate-700/50 shadow-xl overflow-hidden relative group transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                    <BrainCircuit className="text-purple-400 w-6 h-6" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-3">Decision Trees</h4>
                                <p className="text-slate-400 leading-relaxed flex-1">
                                    Master the fundamental algorithms of data splitting. Learn visually with our interactive playground.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <Link to="/learn/decision-trees" className="flex-1 text-center bg-slate-700/50 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors">
                                        Read Concept
                                    </Link>
                                    <Link to="/play/decision-trees" className="flex-1 text-center bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-semibold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                                        Playground
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* More modules... */}
                        {/* ... omitted for brevity but standard glassmorphism structure ... */}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
