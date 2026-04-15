import React from 'react';
import { motion } from 'framer-motion';
import { getAllModules } from '../utils/contentLoader';

export default function TrophyRoom({ earnedBadges = [] }) {
    const allModules = getAllModules();
    const allBadges = allModules.map(m => m.badge);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {allBadges.map((badge, i) => {
                const isUnlocked = earnedBadges.some(b => b.title === badge.title);
                return (
                    <motion.div 
                        key={i}
                        whileHover={isUnlocked ? { scale: 1.05, rotate: 2 } : {}}
                        className={`relative p-8 rounded-[2rem] text-center border transition-all ${
                            isUnlocked 
                            ? 'bg-slate-800/40 border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.2)]' 
                            : 'bg-slate-800/20 border-slate-700/30 opacity-40 grayscale'
                        }`}
                    >
                        {isUnlocked && (
                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"></div>
                        )}
                        <div className="relative z-10">
                            <span className={`text-5xl block mb-4 ${isUnlocked ? 'animate-bounce' : ''}`}>
                                {badge.icon}
                            </span>
                            <p className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                {badge.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
