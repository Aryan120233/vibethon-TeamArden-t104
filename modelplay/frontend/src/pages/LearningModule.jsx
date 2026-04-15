import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit } from 'lucide-react';

export default function LearningModule() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-purple-200">
            {/* Header Canvas */}
            <div className="w-full bg-slate-900 border-b border-indigo-900/50 py-20 px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <span className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 font-bold px-4 py-2 rounded-full text-sm uppercase tracking-widest mb-6 border border-indigo-500/30">
                        <BookOpen className="w-4 h-4" /> Module 1
                    </span>
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                        Decoding <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Decision Trees</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                        Every complex choice is just a sequence of simple binary boundaries. Let's learn how algorithms slice the universe into logical segments.
                    </p>
                </div>
            </div>

            {/* Article Content */}
            <div className="max-w-3xl mx-auto px-8 py-16">
                <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-lg prose-indigo max-w-none font-medium leading-loose text-slate-600"
                >
                    <p>
                        A <strong>Decision Tree</strong> makes classifications by asking a sequential hierarchy of questions. Imagine playing "20 Questions" to identify an animal. You might ask: <em>"Does it have fur?"</em> If true, you travel down the left branch. If false, the right.
                    </p>

                    <h3>The Architecture of Choice</h3>
                    <p>
                        Unlike humans, algorithms don't manually guess which questions to ask. Instead, they algorithmically evaluate every possible feature and slice the dataset at points that maximize the <strong>Gini Impurity</strong> drop or <strong>Information Gain</strong>. 
                    </p>
                    
                    <div className="bg-white border-l-4 border-purple-500 p-8 rounded-r-3xl shadow-lg my-10 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-5">
                            <BrainCircuit className="w-48 h-48" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mt-0 mb-4 flex items-center gap-2">
                            <span className="text-purple-500">⚙️</span> Key Parameters
                        </h4>
                        <ul className="m-0 space-y-4 marker:text-purple-500">
                            <li><strong>Max Depth:</strong> Restricts the vertical progression of the tree. Endless depth results in a model that memorizes training data perfectly (Overfitting) but cannot generalize.</li>
                            <li><strong>Min Samples Split:</strong> The minimum isolated points required to justify spinning up a new branch. A tighter constraint forces broader generalization.</li>
                        </ul>
                    </div>

                    <p>
                        You don't need to understand the underlying mathematics to wield the power of Decision Trees. You just need to understand the conceptual boundaries. When you constrain the geometry of a model, you alter its predictive universe.
                    </p>
                </motion.article>

                {/* Integration Hook: Straight to Mini-Game */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-slate-900 rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-extrabold mb-4">Enough Theory.</h3>
                        <p className="text-slate-400 mb-10 text-lg">
                            Experience the geometry of algorithms dynamically. Adjust the hyperparameters and watch the mathematical boundary shift in real-time.
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/play/decision-trees" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all">
                                Enter Protocol <ArrowRight className="w-6 h-6 text-purple-600" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
