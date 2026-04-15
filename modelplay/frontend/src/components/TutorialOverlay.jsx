import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TutorialOverlay — Reusable glassmorphic educational modal.
 * Pauses the game loop while visible and displays contextual ML teaching.
 * 
 * @param {boolean} isVisible - Whether the overlay is shown
 * @param {string} title - Bold heading text
 * @param {string} content - Explanatory paragraph
 * @param {string} buttonText - CTA button label
 * @param {Function} onDismiss - Called when user clicks the button
 * @param {string} icon - Optional emoji icon for the header
 */
export default function TutorialOverlay({ isVisible, title, content, buttonText, onDismiss, icon = '🧠' }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                    style={{ pointerEvents: 'auto' }}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                        className="max-w-lg w-full mx-4 bg-slate-800/60 backdrop-blur-xl border border-indigo-500/30 rounded-[2rem] p-10 shadow-[0_0_60px_rgba(99,102,241,0.15)] relative overflow-hidden"
                    >
                        {/* Decorative glow */}
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-600 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            <span className="text-4xl block mb-4">{icon}</span>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                                {title}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-[15px] font-medium mb-8">
                                {content}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onDismiss}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all"
                            >
                                {buttonText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
