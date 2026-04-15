import React, { useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { getModuleBySlug } from '../utils/contentLoader';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { API_URL } from '../utils/api';
import axios from 'axios';

export default function Quiz() {
    const { slug } = useParams();
    const mod = getModuleBySlug(slug);
    const { user, token } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    if (!mod || !mod.quiz) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <h2 className="text-3xl font-bold">Quiz not found.</h2>
            </div>
        );
    }

    const quiz = mod.quiz;
    const q = quiz[currentQ];

    const handleSelect = (idx) => {
        if (showResult) return;
        setSelected(idx);
        setShowResult(true);
        if (idx === q.answer) setScore(prev => prev + 1);
    };

    const handleNext = async () => {
        if (currentQ < quiz.length - 1) {
            setCurrentQ(prev => prev + 1);
            setSelected(null);
            setShowResult(false);
        } else {
            setQuizDone(true);
            if (score + (selected === q.answer ? 1 : 0) >= Math.ceil(quiz.length * 0.5)) {
                try {
                    await axios.post(`${API_URL}/api/quiz/complete`, {
                        module: slug, score, badge: mod.badge
                    }, { headers: { Authorization: `Bearer ${token}` } });
                } catch (err) { console.error('Failed to save progress', err); }
            }
        }
    };

    if (quizDone) {
        const passed = score >= Math.ceil(quiz.length * 0.5);
        return (
            <div className={`min-h-screen flex items-center justify-center p-8 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className={`backdrop-blur-xl rounded-[2.5rem] p-12 border shadow-2xl text-center max-w-md ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    {passed ? (
                        <>
                            <div className="text-7xl mb-6">{mod.badge.icon}</div>
                            <h2 className="text-3xl font-extrabold mb-2">Badge Earned!</h2>
                            <p className="text-purple-400 font-bold text-xl mb-4">{mod.badge.title}</p>
                            <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You scored {score}/{quiz.length}. Impressive work, Scholar.</p>
                        </>
                    ) : (
                        <>
                            <div className="text-7xl mb-6">📚</div>
                            <h2 className="text-3xl font-extrabold mb-2">Keep Studying!</h2>
                            <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You scored {score}/{quiz.length}. Review the material and try again.</p>
                        </>
                    )}
                    <Link to="/dashboard" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all">
                        Back to Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-8 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <span className={`font-bold text-sm uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Question {currentQ + 1} / {quiz.length}</span>
                    <span className="text-purple-400 font-bold">Score: {score}</span>
                </div>
                <div className={`w-full rounded-full h-2 mb-10 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <motion.div animate={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }} className="bg-purple-500 h-full rounded-full" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', stiffness: 200, damping: 25 }}>
                        <h2 className="text-2xl font-bold mb-8 leading-relaxed">{q.question}</h2>
                        <div className="space-y-4">
                            {q.options.map((opt, idx) => {
                                let style = isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50';
                                if (showResult) {
                                    if (idx === q.answer) style = 'bg-emerald-500/20 border-emerald-500';
                                    else if (idx === selected && idx !== q.answer) style = 'bg-red-500/20 border-red-500';
                                    else style = isDark ? 'bg-slate-800/30 border-slate-700/30 opacity-50' : 'bg-slate-50 border-slate-200 opacity-50';
                                }
                                return (
                                    <motion.button key={idx} whileHover={!showResult ? { scale: 1.02 } : {}} whileTap={!showResult ? { scale: 0.98 } : {}} onClick={() => handleSelect(idx)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all font-medium flex items-center gap-4 ${style}`}>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {opt}
                                        {showResult && idx === q.answer && <CheckCircle className="ml-auto text-emerald-400 w-6 h-6 shrink-0" />}
                                        {showResult && idx === selected && idx !== q.answer && <XCircle className="ml-auto text-red-400 w-6 h-6 shrink-0" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {showResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex justify-end">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all">
                            {currentQ < quiz.length - 1 ? 'Next Question' : 'See Results'}
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
