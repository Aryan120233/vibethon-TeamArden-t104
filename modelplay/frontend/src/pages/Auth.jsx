import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(username, email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Authentication failed');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black min-h-screen">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                className="bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-slate-700/50 w-full max-w-md relative overflow-hidden"
            >
                {/* Decorative neon blur */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>
                
                <h2 className="text-4xl font-extrabold text-white mb-8 text-center tracking-tight">
                    {isLogin ? 'Welcome back' : 'Join ModelPlay'}
                </h2>
                
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="username"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-900/50 text-white px-5 py-4 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-inner"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-slate-900/50 text-white px-5 py-4 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-inner"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@school.edu"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-slate-900/50 text-white px-5 py-4 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-inner"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all mt-4"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-slate-400 text-sm relative z-10">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                        className="text-purple-400 font-bold hover:text-purple-300 transition-colors"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
