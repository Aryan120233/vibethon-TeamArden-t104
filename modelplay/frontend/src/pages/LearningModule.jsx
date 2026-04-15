import React from 'react';
import { Link } from 'react-router-dom';

export default function LearningModule() {
    return (
        <div className="p-8 max-w-3xl mx-auto w-full bg-white my-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-4xl font-extrabold text-gray-900">Decision Trees</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">Module 1</span>
            </div>
            
            <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                <p className="text-lg leading-relaxed">
                    A <strong>Decision Tree</strong> makes decisions by asking a series of questions. Imagine playing "20 Questions" to guess an animal. You might ask: <em>"Does it have fur?"</em> or <em>"Is it bigger than a toaster?"</em>
                </p>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Key Concepts</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Nodes:</strong> Represent a question or test on an attribute.</li>
                        <li><strong>Branches:</strong> The outcome of the test (e.g., Yes/No).</li>
                        <li><strong>Leaves:</strong> The final decision or classification.</li>
                    </ul>
                </div>
                <p className="text-lg leading-relaxed">
                    In Machine Learning, algorithms automatically figure out which questions to ask to best divide the data into different classes. The <strong>Max Depth</strong> controls how many questions can be asked in a row. Too many questions mean the model might memorize the training data (overfitting), while too few might make it too vague (underfitting).
                </p>
            </div>

            <div className="mt-10 flex justify-end">
                <Link to="/play/decision-trees" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center">
                    Proceed to Mini-Game 
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </Link>
            </div>
        </div>
    );
}
