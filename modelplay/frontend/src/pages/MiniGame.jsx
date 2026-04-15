import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { motion } from 'framer-motion';

// Custom useDebounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function MiniGame() {
    const [maxDepth, setMaxDepth] = useState(3);
    const [minSamples, setMinSamples] = useState(5);
    const debouncedMaxDepth = useDebounce(maxDepth, 200);
    const debouncedMinSamples = useDebounce(minSamples, 200);
    
    const [plotData, setPlotData] = useState([]);
    
    useEffect(() => {
        const fetchBoundary = async () => {
            try {
                const res = await axios.post('http://localhost:8000/api/predict-boundary', {
                    max_depth: debouncedMaxDepth,
                    min_samples_split: debouncedMinSamples
                });
                
                const { data_points, grid } = res.data;
                
                // Construct Plotly data
                const contour = {
                    z: grid.z,
                    x: grid.xx[0], // 1D array of x coordinates
                    y: grid.yy.map(row => row[0]), // 1D array of y coordinates
                    type: 'contour',
                    colorscale: [[0, '#fecaca'], [1, '#bfdbfe']], // Red to Blue matching scatter
                    showscale: false,
                    opacity: 0.6,
                    line: { width: 0 },
                    hoverinfo: 'skip'
                };
                
                // Scatter for Class 0
                const scatter0 = {
                    x: data_points.x.filter((_, i) => data_points.classes[i] === 0),
                    y: data_points.y.filter((_, i) => data_points.classes[i] === 0),
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Class 0',
                    marker: { color: '#ef4444', size: 10, line: { color: 'white', width: 1.5 } }
                };
                
                // Scatter for Class 1
                const scatter1 = {
                    x: data_points.x.filter((_, i) => data_points.classes[i] === 1),
                    y: data_points.y.filter((_, i) => data_points.classes[i] === 1),
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Class 1',
                    marker: { color: '#3b82f6', size: 10, line: { color: 'white', width: 1.5 } }
                };
                
                setPlotData([contour, scatter0, scatter1]);
            } catch (err) {
                console.error("Error fetching boundary", err);
            }
        };
        fetchBoundary();
    }, [debouncedMaxDepth, debouncedMinSamples]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Decision Tree Playground
            </h1>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
                {/* Left Panel: Controls */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full md:w-1/3 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] shadow-2xl h-fit"
                >
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="text-purple-400 text-3xl">⚙️</span> Properties
                    </h3>
                    
                    <div className="mb-10">
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Max Depth</label>
                            <span className="text-purple-400 font-bold bg-purple-500/20 px-3 py-1 rounded-xl">{maxDepth}</span>
                        </div>
                        <input 
                            type="range" min="1" max="10" 
                            value={maxDepth} onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">Controls the maximum number of splits strings. Deeper trees fit the training data tighter but might overfit.</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Min Samples Split</label>
                            <span className="text-blue-400 font-bold bg-blue-500/20 px-3 py-1 rounded-xl">{minSamples}</span>
                        </div>
                        <input 
                            type="range" min="2" max="20" 
                            value={minSamples} onChange={(e) => setMinSamples(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">Minimum points required to split an internal node. Higher values aggressively prevent overfitting by forcing broader decisions.</p>
                    </div>
                </motion.div>

                {/* Right Panel: The Canvas */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full md:w-2/3 bg-slate-50 p-4 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.1)] border border-slate-700/50 flex justify-center items-center"
                >
                    <Plot
                        data={plotData}
                        layout={{
                            title: { text: 'Predictive Boundary Landscape', font: { family: 'Inter, sans-serif', size: 18, color: '#334155' } },
                            font: { family: 'Inter, sans-serif' },
                            width: 800,
                            height: 600,
                            margin: { l: 50, r: 50, b: 50, t: 80 },
                            xaxis: { showgrid: false, zeroline: false, showticklabels: false },
                            yaxis: { showgrid: false, zeroline: false, showticklabels: false },
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            hovermode: 'closest',
                            dragmode: false
                        }}
                        config={{ displayModeBar: false, responsive: true }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
