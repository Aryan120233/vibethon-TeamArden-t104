import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function MiniGame() {
    const [maxDepth, setMaxDepth] = useState(2);
    const [minSamples, setMinSamples] = useState(2);
    const [data, setData] = useState([]);
    const [gridPoints, setGridPoints] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch dummy dataset initially
        axios.get('http://localhost:8000/api/data')
            .then(res => {
                const formatted = res.data.X.map((point, i) => ({
                    x: point[0],
                    y: point[1],
                    class: res.data.y[i]
                }));
                setData(formatted);
            })
            .catch(err => console.error("Error fetching data.", err));
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.post('http://localhost:8000/api/train', {
            max_depth: maxDepth,
            min_samples_split: minSamples
        })
        .then(res => {
            const { x_min, x_max, y_min, y_max, step, grid_Z } = res.data;
            const points = [];
            // Parse grid into sparse array for Recharts or just ignore Recharts boundary rendering for exactness and use color zones.
            // For MVP, we will extract boundary decision points to visually show them:
            for(let i=0; i<grid_Z.length; i+=3) {
                for(let j=0; j<grid_Z[i].length; j+=3) {
                    points.push({
                        bg_x: x_min + j * step,
                        bg_y: y_min + i * step,
                        z: grid_Z[i][j]
                    });
                }
            }
            setGridPoints(points);
            setLoading(false);
        })
        .catch(err => {
            console.error("Backend error", err);
            setLoading(false);
        });
    }, [maxDepth, minSamples]);

    return (
        <div className="p-8 max-w-6xl mx-auto w-full flex gap-8">
            <div className="w-1/3 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col gap-6 h-fit">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Hyperparameter Tuning</h2>
                    <p className="text-gray-500 text-sm">Adjust settings to see how the decision boundary changes.</p>
                </div>

                <div>
                    <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                        Max Depth: <span className="text-indigo-600">{maxDepth}</span>
                    </label>
                    <input 
                        type="range" min="1" max="10" 
                        value={maxDepth} onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                    />
                    <p className="text-xs text-gray-400 mt-1">Controls how deep the tree can grow.</p>
                </div>

                <div>
                    <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                        Min Samples Split: <span className="text-indigo-600">{minSamples}</span>
                    </label>
                    <input 
                        type="range" min="2" max="20" 
                        value={minSamples} onChange={(e) => setMinSamples(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum samples needed to split an internal node.</p>
                </div>
            </div>

            <div className="w-2/3 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col relative">
                <h3 className="text-xl font-bold mb-4 font-sans text-center">Decision Boundary Visualization</h3>
                {loading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-bold text-indigo-600 z-10">Training Model...</div>}
                <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" name="X" domain={[-4, 4]} />
                            <YAxis type="number" dataKey="y" name="Y" domain={[-4, 4]} />
                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                            
                            {/* Background Boundary Points */}
                            <Scatter data={gridPoints} shape="square" dataKey="bg_y" 
                                fill={(entry) => entry.z === 1 ? '#bfdbfe' : '#fecaca'} 
                                fillOpacity={0.4} 
                                isAnimationActive={false} />

                            <Scatter name="Class 0" data={data.filter(d => d.class === 0)} fill="#ef4444" />
                            <Scatter name="Class 1" data={data.filter(d => d.class === 1)} fill="#3b82f6" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500 font-medium">
                    Blue and Red areas represent the model's decision zones
                </div>
            </div>
        </div>
    );
}
