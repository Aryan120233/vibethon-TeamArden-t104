import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import useGameLoop from '../game/useGameLoop';
import { ParticleEmitter } from '../game/Particle';
import { AuthContext } from '../context/AuthContext';
import TutorialOverlay from '../components/TutorialOverlay';
import axios from 'axios';

// ─── Constants ───
const PLAYER_SIZE = 22;
const LANE_WIDTH = 160;
const SPLIT_HEIGHT = 70;
const BASE_SCROLL_SPEED = 180;
const OBSTACLE_SIZE = 20;

// ─── Feature Pool for Decision Splits ───
const FEATURES = [
    { name: 'Color', values: ['Blue', 'Red', 'Green'], type: 'categorical' },
    { name: 'Shape', values: ['Circle', 'Square', 'Triangle'], type: 'categorical' },
    { name: 'Value', range: [10, 90], type: 'numeric' },
    { name: 'Weight', range: [1, 100], type: 'numeric' },
    { name: 'Depth', range: [1, 10], type: 'numeric' },
];

function randomFeatures() {
    const feats = {};
    FEATURES.forEach(f => {
        if (f.type === 'categorical') {
            feats[f.name] = f.values[Math.floor(Math.random() * f.values.length)];
        } else {
            feats[f.name] = Math.floor(f.range[0] + Math.random() * (f.range[1] - f.range[0]));
        }
    });
    return feats;
}

function generateSplit(playerFeatures) {
    const feat = FEATURES[Math.floor(Math.random() * FEATURES.length)];
    let condition, answer;
    if (feat.type === 'categorical') {
        const val = feat.values[Math.floor(Math.random() * feat.values.length)];
        condition = `${feat.name} == ${val}?`;
        answer = playerFeatures[feat.name] === val;
    } else {
        const threshold = Math.floor(feat.range[0] + Math.random() * (feat.range[1] - feat.range[0]));
        condition = `${feat.name} > ${threshold}?`;
        answer = playerFeatures[feat.name] > threshold;
    }
    return { condition, answer }; // answer: true = left lane, false = right lane
}

// ─── Main Game Component ───
export default function DataDash() {
    const { token } = useContext(AuthContext);
    const [gameState, setGameState] = useState('menu'); // menu | playing | gameover
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [finalScore, setFinalScore] = useState(0);

    // ─── Tutorial State ───
    const [tutorial, setTutorial] = useState({ isVisible: true, phase: 'intro' });
    const tutorialVisibleRef = useRef(true);
    const tutorialTriggeredRef = useRef({ infoGain: false });

    // Mutable game state (not in React state for perf)
    const gameRef = useRef({
        player: { x: 0, y: 0, vx: 0 },
        playerFeatures: {},
        scrollSpeed: BASE_SCROLL_SPEED,
        splits: [],
        obstacles: [],
        particles: new ParticleEmitter(),
        shake: { x: 0, y: 0, timer: 0 },
        comboTexts: [],
        score: 0,
        combo: 0,
        speedMultiplier: 1,
        distanceTraveled: 0,
        nextSplitDist: 400,
    });

    const keysRef = useRef({});

    // ─── Keyboard Input ───
    useEffect(() => {
        const onDown = (e) => { keysRef.current[e.key] = true; };
        const onUp = (e) => { keysRef.current[e.key] = false; };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
    }, []);

    // ─── Start Game ───
    const startGame = useCallback(() => {
        const g = gameRef.current;
        g.playerFeatures = randomFeatures();
        g.player = { x: 0, y: 0, vx: 0 };
        g.scrollSpeed = BASE_SCROLL_SPEED;
        g.splits = [];
        g.obstacles = [];
        g.particles = new ParticleEmitter();
        g.shake = { x: 0, y: 0, timer: 0 };
        g.comboTexts = [];
        g.score = 0;
        g.combo = 0;
        g.speedMultiplier = 1;
        g.distanceTraveled = 0;
        g.nextSplitDist = 500;
        setScore(0);
        setCombo(0);
        setGameState('playing');
    }, []);

    // ─── Submit Score ───
    const submitScore = useCallback(async (s) => {
        try {
            const payload = btoa(JSON.stringify({ score: s, ts: Date.now(), h: ((s * 7 + 42) ^ 0xDEAD).toString(16) }));
            await axios.post('http://localhost:5000/api/game/score', { payload }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) { console.error('Score submit failed', err); }
    }, [token]);

    // ─── UPDATE (Physics Tick) ───
    const update = useCallback((dt) => {
        if (gameState !== 'playing' || tutorialVisibleRef.current) return;
        const g = gameRef.current;
        const keys = keysRef.current;

        // Player momentum-based movement
        const accel = 1200;
        const friction = 6;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) g.player.vx -= accel * dt;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) g.player.vx += accel * dt;
        g.player.vx *= (1 - friction * dt); // drift friction
        g.player.x += g.player.vx * dt;

        // Scroll
        const scrollDelta = g.scrollSpeed * g.speedMultiplier * dt;
        g.distanceTraveled += scrollDelta;
        g.score += scrollDelta * 0.1 * g.speedMultiplier;

        // Ease speed multiplier back to 1
        g.speedMultiplier = 1 + (g.speedMultiplier - 1) * Math.pow(0.3, dt);

        // Generate splits
        if (g.distanceTraveled >= g.nextSplitDist) {
            const split = generateSplit(g.playerFeatures);
            split.y = -SPLIT_HEIGHT; // spawn above screen
            g.splits.push(split);
            g.nextSplitDist = g.distanceTraveled + 500 + Math.random() * 300;

            // Spawn noise obstacles between splits
            for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
                g.obstacles.push({
                    x: (Math.random() - 0.5) * LANE_WIDTH * 1.8,
                    y: -200 - Math.random() * 250,
                    size: OBSTACLE_SIZE
                });
            }
        }

        // Move splits and obstacles downward
        g.splits.forEach(s => { s.y += scrollDelta; });
        g.obstacles.forEach(o => { o.y += scrollDelta; });

        // Screen shake decay
        if (g.shake.timer > 0) {
            g.shake.timer -= dt;
            g.shake.x = (Math.random() - 0.5) * 8;
            g.shake.y = (Math.random() - 0.5) * 8;
        } else {
            g.shake.x = 0; g.shake.y = 0;
        }

        // Combo text decay
        g.comboTexts = g.comboTexts.filter(t => { t.life -= dt; t.y -= 40 * dt; return t.life > 0; });

        // Particles
        g.particles.update(dt);

        // Sync React state periodically
        setScore(Math.floor(g.score));
        setCombo(g.combo);

    }, [gameState]);

    // ─── Collision check (called during draw for accurate positioning) ───
    const checkCollisions = useCallback((cw, ch) => {
        if (gameState !== 'playing') return;
        const g = gameRef.current;
        const px = cw / 2 + g.player.x;
        const py = ch * 0.75;

        // Obstacle collisions (AABB)
        for (const o of g.obstacles) {
            const ox = cw / 2 + o.x;
            const oy = o.y;
            if (Math.abs(px - ox) < (PLAYER_SIZE + o.size) / 2 && Math.abs(py - oy) < (PLAYER_SIZE + o.size) / 2) {
                // Hit noise! Shake + small penalty
                g.shake.timer = 0.15;
                g.score = Math.max(0, g.score - 50);
                g.particles.emit(px, py, '#f59e0b', 10, 100);
                g.obstacles = g.obstacles.filter(ob => ob !== o);
                break;
            }
        }

        // Split crossing detection
        for (let i = g.splits.length - 1; i >= 0; i--) {
            const s = g.splits[i];
            if (s.y > py - 10 && s.y < py + 10 && !s.resolved) {
                s.resolved = true;
                // Determine lane: left of center = True, right = False
                const choseTrue = g.player.x < 0;
                const correct = (s.answer && choseTrue) || (!s.answer && !choseTrue);

                if (correct) {
                    // Correct! Speed boost + combo + green particles
                    g.speedMultiplier = 2.5;
                    g.combo += 1;
                    g.score += 500 * g.combo;
                    g.particles.emit(px, py, '#22c55e', 40, 250);
                    const comboStr = g.combo >= 5 ? '🔥 PERFECT SPLIT!' : g.combo >= 3 ? `x${g.combo} COMBO!` : `x${g.combo}`;
                    g.comboTexts.push({ text: comboStr, x: px, y: py - 40, life: 1.2 });

                    // Tutorial: trigger Phase 2 after 3 correct splits
                    if (g.combo === 3 && !tutorialTriggeredRef.current.infoGain) {
                        tutorialTriggeredRef.current.infoGain = true;
                        tutorialVisibleRef.current = true;
                        setTutorial({ isVisible: true, phase: 'infoGain' });
                    }
                } else {
                    // Wrong! Death explosion
                    g.particles.emit(px, py, '#ef4444', 60, 300);
                    g.particles.emit(px, py, '#f97316', 30, 200);
                    g.shake.timer = 0.3;
                    const fs = Math.floor(g.score);
                    setFinalScore(fs);
                    setGameState('gameover');
                    submitScore(fs);
                    return;
                }
            }
        }

        // Cleanup off-screen entities
        g.splits = g.splits.filter(s => s.y < ch + 100);
        g.obstacles = g.obstacles.filter(o => o.y < ch + 50);

        // Clamp player
        const maxX = LANE_WIDTH * 1.2;
        g.player.x = Math.max(-maxX, Math.min(maxX, g.player.x));

    }, [gameState, submitScore]);

    // ─── DRAW (Render Tick) ───
    const draw = useCallback((ctx, cw, ch) => {
        const g = gameRef.current;

        ctx.save();
        ctx.translate(g.shake.x, g.shake.y);

        // ─── Background ───
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, -10, cw + 20, ch + 20);

        // Grid lines (synthwave floor)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
        ctx.lineWidth = 1;
        const gridSpacing = 40;
        const gridOffset = (g.distanceTraveled % gridSpacing);
        for (let y = -gridSpacing + gridOffset; y < ch + gridSpacing; y += gridSpacing) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
        }
        for (let x = 0; x < cw; x += gridSpacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
        }

        // Center lane guides
        const centerX = cw / 2;
        ctx.setLineDash([8, 12]);
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, ch); ctx.stroke();
        ctx.setLineDash([]);

        // ─── Draw Splits ───
        for (const s of g.splits) {
            const sy = s.y;
            // Barrier background
            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.fillRect(centerX - LANE_WIDTH - 20, sy - SPLIT_HEIGHT / 2, LANE_WIDTH * 2 + 40, SPLIT_HEIGHT);
            
            // Barrier border
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.strokeRect(centerX - LANE_WIDTH - 20, sy - SPLIT_HEIGHT / 2, LANE_WIDTH * 2 + 40, SPLIT_HEIGHT);

            // Center divider
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(centerX - 2, sy - SPLIT_HEIGHT / 2, 4, SPLIT_HEIGHT);

            // Condition text
            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 15px "Inter", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(s.condition, centerX, sy - SPLIT_HEIGHT / 2 - 10);

            // Lane labels
            ctx.font = 'bold 20px "Inter", sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.fillText('TRUE', centerX - LANE_WIDTH / 2 - 10, sy + 6);
            ctx.fillStyle = '#ef4444';
            ctx.fillText('FALSE', centerX + LANE_WIDTH / 2 + 10, sy + 6);

            // Resolved glow
            if (s.resolved) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
                ctx.fillRect(centerX - LANE_WIDTH - 20, sy - SPLIT_HEIGHT / 2, LANE_WIDTH * 2 + 40, SPLIT_HEIGHT);
            }
        }

        // ─── Draw Obstacles ───
        for (const o of g.obstacles) {
            const ox = centerX + o.x;
            ctx.save();
            ctx.translate(ox, o.y);
            ctx.rotate(g.distanceTraveled * 0.005);
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.fillRect(-o.size / 2, -o.size / 2, o.size, o.size);
            ctx.restore();
        }

        // ─── Draw Player ───
        if (gameState === 'playing') {
            const px = centerX + g.player.x;
            const py = ch * 0.75;

            // Glow trail
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, PLAYER_SIZE * 2);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_SIZE * 2, 0, Math.PI * 2);
            ctx.fill();

            // Player body
            ctx.fillStyle = '#818cf8';
            ctx.shadowColor = '#818cf8';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Player core
            ctx.fillStyle = '#c7d2fe';
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_SIZE * 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Feature labels above player
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '10px "Inter", monospace';
            ctx.textAlign = 'center';
            const featureEntries = Object.entries(g.playerFeatures);
            featureEntries.slice(0, 3).forEach(([k, v], i) => {
                ctx.fillText(`${k}: ${v}`, px, py - PLAYER_SIZE - 12 - (i * 14));
            });
        }

        // Collision checks (run in draw for accurate screen-space coords)
        checkCollisions(cw, ch);

        // ─── Draw Particles ───
        g.particles.draw(ctx);

        // ─── Combo Texts ───
        for (const t of g.comboTexts) {
            const alpha = Math.min(1, t.life);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = t.text.includes('PERFECT') ? '#fbbf24' : '#22c55e';
            ctx.font = 'bold 24px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        }

        // ─── HUD Overlay ───
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(10, 10, 170, 60);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 170, 60);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${Math.floor(g.score)}`, 22, 35);
        ctx.fillStyle = g.combo >= 3 ? '#fbbf24' : '#94a3b8';
        ctx.fillText(`COMBO: x${g.combo}`, 22, 58);

        ctx.restore(); // end shake transform

        // ─── Menu Overlay ───
        if (gameState === 'menu') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(0, 0, cw, ch);

            // Title
            ctx.fillStyle = '#818cf8';
            ctx.font = 'bold 48px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#818cf8';
            ctx.shadowBlur = 30;
            ctx.fillText('DATA DASH', cw / 2, ch / 2 - 60);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px "Inter", sans-serif';
            ctx.fillText('Navigate the Decision Tree. Choose the correct lane.', cw / 2, ch / 2 - 15);

            // Start button
            ctx.fillStyle = '#6366f1';
            const btnW = 200, btnH = 50;
            const btnX = cw / 2 - btnW / 2, btnY = ch / 2 + 30;
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 14);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px "Inter", sans-serif';
            ctx.fillText('PRESS ENTER', cw / 2, btnY + 33);
        }

        // ─── Game Over Overlay ───
        if (gameState === 'gameover') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(0, 0, cw, ch);

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 42px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 25;
            ctx.fillText('CRASH!', cw / 2, ch / 2 - 50);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 22px "Inter", sans-serif';
            ctx.fillText(`Final Score: ${finalScore}`, cw / 2, ch / 2 + 5);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '15px "Inter", sans-serif';
            ctx.fillText(`Max Combo: x${combo}`, cw / 2, ch / 2 + 35);

            ctx.fillStyle = '#6366f1';
            const btnW = 220, btnH = 50;
            const btnX = cw / 2 - btnW / 2, btnY = ch / 2 + 65;
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 14);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.fillText('PRESS ENTER TO RETRY', cw / 2, btnY + 33);
        }

    }, [gameState, checkCollisions, finalScore, combo]);

    // ─── Enter key handler ───
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter') {
                if (gameState === 'menu' || gameState === 'gameover') startGame();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [gameState, startGame]);

    // ─── Game Loop ───
    const { canvasRef } = useGameLoop(update, draw, true);

    // ─── Responsive Canvas Size ───
    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [canvasRef]);

    // ─── Tutorial Content Definitions ───
    const tutorialContent = {
        intro: {
            icon: '🌳',
            title: 'The Root of the Problem',
            content: 'Welcome to the Decision Tree. Every complex choice is just a sequence of binary splits. Your goal is to navigate the data by asking "True or False" questions to separate the classes. Use the ← → arrow keys to steer into the correct lane before you cross each split barrier.',
            buttonText: 'Start Splitting'
        },
        infoGain: {
            icon: '📊',
            title: 'Maximizing Purity',
            content: 'Great job! By choosing the correct path, you are reducing Gini Impurity. The algorithm mathematically evaluates every feature to find the split that creates the most homogeneous (purest) branches. Each correct split earns a combo multiplier — just like how a well-chosen feature maximizes Information Gain.',
            buttonText: 'Continue Algorithm'
        }
    };

    const currentTutorial = tutorialContent[tutorial.phase];

    return (
        <div className="w-full h-screen bg-[#0f172a] relative overflow-hidden" style={{ cursor: 'none' }}>
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* React HUD Overlay for score */}
            {gameState === 'playing' && !tutorial.isVisible && (
                <div className="absolute top-4 right-4 text-right pointer-events-none select-none">
                    <div className="bg-slate-900/70 backdrop-blur-md border border-indigo-500/30 px-5 py-3 rounded-2xl">
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Score</p>
                        <p className="text-white text-3xl font-black tabular-nums">{score.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* Educational Tutorial Overlay */}
            {currentTutorial && (
                <TutorialOverlay
                    isVisible={tutorial.isVisible}
                    icon={currentTutorial.icon}
                    title={currentTutorial.title}
                    content={currentTutorial.content}
                    buttonText={currentTutorial.buttonText}
                    onDismiss={() => {
                        tutorialVisibleRef.current = false;
                        setTutorial(prev => ({ ...prev, isVisible: false }));
                        if (tutorial.phase === 'intro' && gameState === 'menu') startGame();
                    }}
                />
            )}
        </div>
    );
}
