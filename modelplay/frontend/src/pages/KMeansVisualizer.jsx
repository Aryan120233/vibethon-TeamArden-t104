import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ML_URL } from '../utils/api';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const CLUSTER_COLORS = ['#a855f7','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6','#14b8a6','#f97316'];

export default function KMeansVisualizer() {
    const [numClusters, setNumClusters] = useState(3);
    const debouncedK = useDebounce(numClusters, 250);
    const [plotData, setPlotData] = useState([]);

    useEffect(() => {
        const fetchClusters = async () => {
            try {
                const res = await axios.post(`${ML_URL}/api/cluster`, { num_clusters: debouncedK });
                const { data_points, centroids } = res.data;

                // Group points by cluster label
                const traces = [];
                for (let k = 0; k < debouncedK; k++) {
                    const xk = data_points.x.filter((_, i) => data_points.labels[i] === k);
                    const yk = data_points.y.filter((_, i) => data_points.labels[i] === k);
                    traces.push({
                        x: xk, y: yk,
                        mode: 'markers', type: 'scatter',
                        name: `Cluster ${k + 1}`,
                        marker: { color: CLUSTER_COLORS[k % CLUSTER_COLORS.length], size: 10, line: { color: 'white', width: 1 } }
                    });
                }

                // Centroids
                traces.push({
                    x: centroids.x, y: centroids.y,
                    mode: 'markers', type: 'scatter',
                    name: 'Centroids',
                    marker: { color: 'white', size: 18, symbol: 'x', line: { color: '#1e293b', width: 3 } }
                });

                setPlotData(traces);
            } catch (err) {
                console.error("Error fetching clusters", err);
            }
        };
        fetchClusters();
    }, [debouncedK]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                K-Means Clustering Lab
            </h1>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
                {/* Controls */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] shadow-2xl h-fit">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="text-blue-400 text-3xl">🎯</span> Configuration
                    </h3>
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Number of Clusters (K)</label>
                            <span className="text-blue-400 font-bold bg-blue-500/20 px-3 py-1 rounded-xl">{numClusters}</span>
                        </div>
                        <input type="range" min="2" max="8" value={numClusters} onChange={(e) => setNumClusters(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">
                            K defines the number of groups the algorithm attempts to segment the data into. Too few clusters merge distinct groups; too many fragment coherent ones.
                        </p>
                    </div>
                </motion.div>

                {/* Canvas */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full lg:w-2/3 bg-slate-50 p-4 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.1)] border border-slate-700/50 flex justify-center items-center">
                    <Plot
                        data={plotData}
                        layout={{
                            title: { text: 'K-Means Cluster Assignment', font: { family: 'Inter, sans-serif', size: 18, color: '#334155' } },
                            font: { family: 'Inter, sans-serif' },
                            width: 800, height: 600,
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
