import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BrainCircuit, Waypoints, Cpu } from 'lucide-react';
import { getModuleBySlug } from '../utils/contentLoader';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

function RenderTheory({ theory, isDark }) {
    return theory.map((block, i) => {
        switch (block.type) {
            case 'heading':
                return <h3 key={i}>{block.content}</h3>;
            case 'paragraph':
                return <p key={i} dangerouslySetInnerHTML={{ __html: block.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />;
            case 'callout':
                return (
                    <div key={i} className={`border-l-4 border-purple-500 p-8 rounded-r-3xl shadow-lg my-10 relative overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <h4 className={`text-xl font-bold mt-0 mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <span className="text-purple-500">⚙️</span> {block.title}
                        </h4>
                        <ul className="m-0 space-y-4 marker:text-purple-500">
                            {block.items.map((item, j) => (
                                <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                            ))}
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    });
}

export default function ModulePage() {
    const { slug } = useParams();
    const mod = getModuleBySlug(slug);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    if (!mod) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <h2 className="text-3xl font-bold">Module not found.</h2>
            </div>
        );
    }

    const colorMap = {
        purple: { accent: 'from-purple-400 to-blue-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
        blue:   { accent: 'from-blue-400 to-cyan-400',   border: 'border-blue-500/30',   bg: 'bg-blue-500/20',   text: 'text-blue-300' },
        emerald:{ accent: 'from-emerald-400 to-teal-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', text: 'text-emerald-300' }
    };
    const colors = colorMap[mod.color] || colorMap.purple;

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-800'} selection:bg-purple-200`}>
            {/* Header */}
            <div className={`w-full border-b py-20 px-8 relative overflow-hidden ${isDark ? 'bg-slate-900 border-indigo-900/50' : 'bg-gradient-to-r from-slate-900 to-indigo-900 border-indigo-800'}`}>
                <div className="absolute top-6 right-6 z-20"><ThemeToggle /></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <span className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} font-bold px-4 py-2 rounded-full text-sm uppercase tracking-widest mb-6 border ${colors.border}`}>
                        <BookOpen className="w-4 h-4" /> Module
                    </span>
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${colors.accent}`}>{mod.title}</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">{mod.description}</p>
                </div>
            </div>

            {/* Article */}
            <div className="max-w-3xl mx-auto px-8 py-16">
                <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`prose prose-lg max-w-none font-medium leading-loose ${isDark ? 'prose-invert text-slate-300' : 'prose-indigo text-slate-600'}`}
                >
                    <RenderTheory theory={mod.theory} isDark={isDark} />
                </motion.article>

                {/* CTA */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-slate-900 rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-extrabold mb-4">
                            {mod.interactiveComponent ? "Enough Theory." : "Test Your Knowledge."}
                        </h3>
                        <p className="text-slate-400 mb-10 text-lg">
                            {mod.interactiveComponent
                                ? "Experience the geometry of algorithms dynamically."
                                : "Complete the quiz to earn your badge and advance your streak."
                            }
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link 
                                to={mod.interactiveComponent ? `/play/${slug}` : `/quiz/${slug}`}
                                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
                            >
                                {mod.interactiveComponent ? 'Enter Playground' : 'Start Quiz'} <ArrowRight className="w-6 h-6 text-purple-600" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
