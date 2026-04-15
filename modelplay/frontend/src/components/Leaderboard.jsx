import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame } from 'lucide-react';
import axios from 'axios';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/leaderboard')
            .then(res => setLeaders(res.data))
            .catch(err => console.error(err));
    }, []);

    const rankStyles = {
        1: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        2: 'text-slate-300 border-slate-400/30 bg-slate-400/10',
        3: 'text-amber-600 border-amber-500/30 bg-amber-500/10'
    };

    return (
        <div className="space-y-4">
            {leaders.length === 0 && (
                <p className="text-slate-500 text-center py-8">No scholars on the board yet. Be the first!</p>
            )}
            {leaders.map((l, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${rankStyles[l.rank] || 'border-slate-700/50 bg-slate-800/30'}`}
                >
                    <span className={`text-2xl font-black w-10 text-center ${l.rank <= 3 ? rankStyles[l.rank]?.split(' ')[0] : 'text-slate-500'}`}>
                        {l.rank <= 3 ? ['🥇','🥈','🥉'][l.rank-1] : `#${l.rank}`}
                    </span>
                    <div className="flex-1">
                        <p className="font-bold text-white">{l.username}</p>
                        <p className="text-xs text-slate-400">{l.modulesCompleted} modules · {l.badgeCount} badges</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-4 h-4" fill="#f97316" />
                        <span className="font-bold text-sm">{l.streak}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
