import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={toggleTheme}
            className={`p-3 rounded-2xl border transition-all ${
                isDark 
                ? 'bg-slate-800/50 border-slate-700/50 text-yellow-400 hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
    );
}
