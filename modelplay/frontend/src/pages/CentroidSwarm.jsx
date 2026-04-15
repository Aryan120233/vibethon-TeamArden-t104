import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import useGameLoop from '../game/useGameLoop';
import { ParticleEmitter } from '../game/Particle';
import { AuthContext } from '../context/AuthContext';
import TutorialOverlay from '../components/TutorialOverlay';
import { API_URL } from '../utils/api';
import axios from 'axios';

// ─── Constants ───
const ARENA_W = 2000;
const ARENA_H = 2000;
const NUM_POINTS = 300;
const GAME_DURATION = 60; // seconds
const POINT_RADIUS = 5;
const CENTROID_RADIUS = 18;

// ─── Centroid Colors ───
const COLORS = {
    player: { core: '#22d3ee', glow: 'rgba(34,211,238,0.4)', trail: 'rgba(34,211,238,0.15)', name: 'Cyan' },
    enemy1: { core: '#e879f9', glow: 'rgba(232,121,249,0.4)', trail: 'rgba(232,121,249,0.15)', name: 'Magenta' },
    enemy2: { core: '#facc15', glow: 'rgba(250,204,21,0.4)', trail: 'rgba(250,204,21,0.15)', name: 'Gold' },
    unclaimed: '#475569'
};

// ─── Euclidean Distance ───
function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

// ─── Find closest centroid index for a data point ───
function closestCentroid(px, py, centroids) {
    let minD = Infinity, minI = -1;
    for (let i = 0; i < centroids.length; i++) {
        const d = dist(px, py, centroids[i].x, centroids[i].y);
        if (d < minD) { minD = d; minI = i; }
    }
    return minI;
}

// ─── Spawn data points ───
function spawnPoints() {
    const pts = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        pts.push({
            x: 100 + Math.random() * (ARENA_W - 200),
            y: 100 + Math.random() * (ARENA_H - 200),
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            owner: -1 // unclaimed
        });
    }
    return pts;
}

// ─── Main Component ───
export default function CentroidSwarm() {
    const { token } = useContext(AuthContext);
    const [gameState, setGameState] = useState('menu'); // menu | playing | result
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [scores, setScores] = useState([0, 0, 0]);
    const [winner, setWinner] = useState(-1);

    // ─── Tutorial State ───
    const [tutorial, setTutorial] = useState({ isVisible: true, phase: 'init' });
    const tutorialVisibleRef = useRef(true);
    const tutorialTriggeredRef = useRef({ distance: false, recluster: false });

    const gameRef = useRef({
        centroids: [],
        points: [],
        particles: new ParticleEmitter(),
        shake: { x: 0, y: 0, timer: 0 },
        camera: { x: 0, y: 0, scale: 1 },
        timer: GAME_DURATION,
        mouse: { x: 0, y: 0 },
        useMouseControl: false,
    });
    const keysRef = useRef({});

    // ─── Input ───
    useEffect(() => {
        const down = (e) => { keysRef.current[e.key.toLowerCase()] = true; };
        const up = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    // ─── Start ───
    const startGame = useCallback(() => {
        const g = gameRef.current;
        g.centroids = [
            { x: ARENA_W * 0.25, y: ARENA_H * 0.5, vx: 0, vy: 0, color: COLORS.player,   isPlayer: true },
            { x: ARENA_W * 0.75, y: ARENA_H * 0.3, vx: 120, vy: 80, color: COLORS.enemy1,  isPlayer: false },
            { x: ARENA_W * 0.75, y: ARENA_H * 0.7, vx: -90, vy: 110, color: COLORS.enemy2, isPlayer: false },
        ];
        g.points = spawnPoints();
        g.particles = new ParticleEmitter();
        g.shake = { x: 0, y: 0, timer: 0 };
        g.timer = GAME_DURATION;
        g.camera = { x: 0, y: 0, scale: 1 };
        setTimeLeft(GAME_DURATION);
        setScores([0, 0, 0]);
        setWinner(-1);
        setGameState('playing');
    }, []);

    // ─── UPDATE ───
    const update = useCallback((dt) => {
        if (gameState !== 'playing' || tutorialVisibleRef.current) return;
        const g = gameRef.current;
        const keys = keysRef.current;

        // Timer
        g.timer -= dt;
        setTimeLeft(Math.max(0, Math.ceil(g.timer)));
        if (g.timer <= 0) {
            // Game over — determine winner
            const counts = [0, 0, 0];
            g.points.forEach(p => { if (p.owner >= 0 && p.owner < 3) counts[p.owner]++; });
            const maxIdx = counts.indexOf(Math.max(...counts));
            setWinner(maxIdx);
            setScores(counts);

            // Confetti if player wins
            if (maxIdx === 0) {
                const pc = g.centroids[0];
                g.particles.emit(pc.x, pc.y, '#22d3ee', 80, 400);
                g.particles.emit(pc.x, pc.y, '#818cf8', 60, 350);
                g.shake.timer = 0.5;
            }
            setGameState('result');
            // Submit score
            try {
                const pct = Math.round((counts[0] / NUM_POINTS) * 100);
                axios.post(`${API_URL}/api/game/score`, {
                    payload: btoa(JSON.stringify({ score: pct * 100, ts: Date.now(), h: ((pct * 7 + 42) ^ 0xBEEF).toString(16) }))
                }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
            } catch(e) {}
            return;
        }

        // ─── Player Movement (WASD + mouse) ───
        const player = g.centroids[0];
        const accel = 600;
        const friction = 4;
        if (keys['w'] || keys['arrowup'])    player.vy -= accel * dt;
        if (keys['s'] || keys['arrowdown'])  player.vy += accel * dt;
        if (keys['a'] || keys['arrowleft'])  player.vx -= accel * dt;
        if (keys['d'] || keys['arrowright']) player.vx += accel * dt;
        player.vx *= (1 - friction * dt);
        player.vy *= (1 - friction * dt);
        player.x = Math.max(20, Math.min(ARENA_W - 20, player.x + player.vx * dt));
        player.y = Math.max(20, Math.min(ARENA_H - 20, player.y + player.vy * dt));

        // ─── AI Movement (bounce off walls with slight randomness) ───
        for (let i = 1; i < g.centroids.length; i++) {
            const c = g.centroids[i];
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            // Wall bounce
            if (c.x < 30 || c.x > ARENA_W - 30) { c.vx *= -1; c.vx += (Math.random() - 0.5) * 40; }
            if (c.y < 30 || c.y > ARENA_H - 30) { c.vy *= -1; c.vy += (Math.random() - 0.5) * 40; }
            c.x = Math.max(20, Math.min(ARENA_W - 20, c.x));
            c.y = Math.max(20, Math.min(ARENA_H - 20, c.y));
        }

        // ─── K-Means: Assign every point to nearest centroid ───
        const counts = [0, 0, 0];
        for (const p of g.points) {
            const prevOwner = p.owner;
            p.owner = closestCentroid(p.x, p.y, g.centroids);
            counts[p.owner]++;

            // Gravitational pull toward owner centroid (swarm flock effect)
            const target = g.centroids[p.owner];
            const dx = target.x - p.x, dy = target.y - p.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const pullStrength = 60; // gentle pull
            p.vx += (dx / d) * pullStrength * dt;
            p.vy += (dy / d) * pullStrength * dt;

            // Random drift
            p.vx += (Math.random() - 0.5) * 20 * dt;
            p.vy += (Math.random() - 0.5) * 20 * dt;

            // Friction
            p.vx *= (1 - 2 * dt);
            p.vy *= (1 - 2 * dt);

            // Move
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Clamp to arena
            p.x = Math.max(5, Math.min(ARENA_W - 5, p.x));
            p.y = Math.max(5, Math.min(ARENA_H - 5, p.y));

            // Steal sparkle effect
            if (prevOwner !== p.owner && prevOwner >= 0) {
                g.particles.emit(p.x, p.y, g.centroids[p.owner].color.core, 5, 60);
            }
        }
        setScores([...counts]);

        // Tutorial: Phase 2 — trigger when player captures 15+ points
        if (counts[0] >= 15 && !tutorialTriggeredRef.current.distance) {
            tutorialTriggeredRef.current.distance = true;
            tutorialVisibleRef.current = true;
            setTutorial({ isVisible: true, phase: 'distance' });
        }

        // Tutorial: Phase 3 — trigger when enemy steals from player (player count drops while others gain)
        if (tutorialTriggeredRef.current.distance && !tutorialTriggeredRef.current.recluster) {
            // Detect if any point changed from player to enemy this frame
            const stolen = g.points.some(p => p._prevOwner === 0 && p.owner !== 0);
            if (stolen) {
                tutorialTriggeredRef.current.recluster = true;
                tutorialVisibleRef.current = true;
                setTutorial({ isVisible: true, phase: 'recluster' });
            }
        }
        // Track prev owners for steal detection
        g.points.forEach(p => { p._prevOwner = p.owner; });

        // Camera follow player with dynamic zoom
        const playerPts = counts[0];
        const targetScale = Math.max(0.5, 1 - playerPts * 0.001);
        g.camera.scale += (targetScale - g.camera.scale) * dt * 2;
        g.camera.x += (player.x - g.camera.x) * dt * 3;
        g.camera.y += (player.y - g.camera.y) * dt * 3;

        // Shake decay
        if (g.shake.timer > 0) {
            g.shake.timer -= dt;
            g.shake.x = (Math.random() - 0.5) * 10;
            g.shake.y = (Math.random() - 0.5) * 10;
        } else { g.shake.x = 0; g.shake.y = 0; }

        g.particles.update(dt);

    }, [gameState, token]);

    // ─── DRAW ───
    const draw = useCallback((ctx, cw, ch) => {
        const g = gameRef.current;

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, cw, ch);

        ctx.save();
        // Camera transform
        const cx = cw / 2 - g.camera.x * g.camera.scale + g.shake.x;
        const cy = ch / 2 - g.camera.y * g.camera.scale + g.shake.y;
        ctx.translate(cx, cy);
        ctx.scale(g.camera.scale, g.camera.scale);

        // Arena border
        ctx.strokeStyle = 'rgba(99,102,241,0.2)';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, ARENA_W, ARENA_H);

        // Grid
        ctx.strokeStyle = 'rgba(99,102,241,0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= ARENA_W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_H); ctx.stroke(); }
        for (let y = 0; y <= ARENA_H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_W, y); ctx.stroke(); }

        // ─── Draw data points with additive blending ───
        ctx.globalCompositeOperation = 'lighter';
        for (const p of g.points) {
            const color = p.owner >= 0 ? g.centroids[p.owner].color.core : COLORS.unclaimed;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        // ─── Draw centroids ───
        for (let i = 0; i < g.centroids.length; i++) {
            const c = g.centroids[i];
            // Glow aura
            const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, CENTROID_RADIUS * 4);
            grad.addColorStop(0, c.color.glow);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(c.x, c.y, CENTROID_RADIUS * 4, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing ring
            const pulse = 1 + Math.sin(Date.now() * 0.005 + i) * 0.15;
            ctx.strokeStyle = c.color.core;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(c.x, c.y, CENTROID_RADIUS * pulse * 1.5, 0, Math.PI * 2);
            ctx.stroke();

            // Core
            ctx.fillStyle = c.color.core;
            ctx.shadowColor = c.color.core;
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(c.x, c.y, CENTROID_RADIUS * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Inner bright core
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(c.x, c.y, CENTROID_RADIUS * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(c.isPlayer ? 'YOU' : `K${i + 1}`, c.x, c.y - CENTROID_RADIUS * 2 - 5);
        }

        // Particles
        g.particles.draw(ctx);

        ctx.restore(); // end camera

        // ─── Menu Overlay ───
        if (gameState === 'menu') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, 0, cw, ch);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 52px "Inter", sans-serif';
            ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 30;
            ctx.fillText('CENTROID SWARM', cw / 2, ch / 2 - 70);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px "Inter", sans-serif';
            ctx.fillText('Compete for cluster domination using real K-Means logic.', cw / 2, ch / 2 - 25);
            ctx.fillText('WASD or Arrow Keys to move. Steal points by proximity!', cw / 2, ch / 2 + 5);
            ctx.fillStyle = '#22d3ee';
            const bw = 220, bh = 50, bx = cw / 2 - bw / 2, by = ch / 2 + 40;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 18px "Inter", sans-serif';
            ctx.fillText('PRESS ENTER', cw / 2, by + 33);
        }

        // ─── Result Overlay ───
        if (gameState === 'result') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.fillRect(0, 0, cw, ch);
            ctx.textAlign = 'center';

            const winColor = winner === 0 ? '#22d3ee' : winner === 1 ? '#e879f9' : '#facc15';
            ctx.fillStyle = winColor;
            ctx.font = 'bold 46px "Inter", sans-serif';
            ctx.shadowColor = winColor; ctx.shadowBlur = 30;
            ctx.fillText(winner === 0 ? '🏆 CLUSTER DOMINATION!' : '💀 DOMINATED...', cw / 2, ch / 2 - 60);
            ctx.shadowBlur = 0;

            // Scores breakdown
            const labels = ['You (K1)', 'K2', 'K3'];
            const colors = [COLORS.player.core, COLORS.enemy1.core, COLORS.enemy2.core];
            for (let i = 0; i < 3; i++) {
                const pct = Math.round((scores[i] / NUM_POINTS) * 100);
                ctx.fillStyle = colors[i];
                ctx.font = 'bold 22px "Inter", sans-serif';
                ctx.fillText(`${labels[i]}: ${pct}% (${scores[i]} pts)`, cw / 2, ch / 2 - 5 + i * 35);
            }

            ctx.fillStyle = '#22d3ee';
            const bw = 240, bh = 50, bx = cw / 2 - bw / 2, by = ch / 2 + 110;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.fillText('PRESS ENTER TO REMATCH', cw / 2, by + 33);
        }

    }, [gameState, scores, winner]);

    // ─── Enter key ───
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter' && (gameState === 'menu' || gameState === 'result')) startGame();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [gameState, startGame]);

    // ─── Game Loop ───
    const { canvasRef } = useGameLoop(update, draw, true);

    // ─── Responsive Canvas ───
    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [canvasRef]);

    // ─── Tutorial Content Definitions ───
    const tutorialContent = {
        init: {
            icon: '🎯',
            title: "Step 1: Initialize 'K' Centroids",
            content: "In K-Means Clustering, 'K' represents the number of centroids. You are K=1 (Cyan). The enemy bots are K=2 (Magenta) and K=3 (Gold). Your objective is to claim the most data points by moving to the center of unlabelled data. Use WASD or Arrow Keys to navigate the arena.",
            buttonText: 'Deploy Centroid'
        },
        distance: {
            icon: '📏',
            title: 'Step 2: Euclidean Distance',
            content: 'Look at the swarm! Every single data point is constantly calculating its straight-line Euclidean Distance to all centroids, magnetically snapping to whichever center is closest. The formula sqrt((x₂-x₁)² + (y₂-y₁)²) runs 300 times per frame — that\'s the mathematical heartbeat of K-Means.',
            buttonText: 'Keep Grouping'
        },
        recluster: {
            icon: '🔄',
            title: 'Step 3: Dynamic Re-Clustering',
            content: 'An enemy moved closer and stole your data! As centroids shift, the algorithm dynamically recalculates and reassigns points. This loop — assign, update, reassign — continues until convergence, when the clusters stop changing. In real ML, this is the iterative core of the K-Means algorithm.',
            buttonText: 'Reclaim the Swarm'
        }
    };

    const currentTutorial = tutorialContent[tutorial.phase];

    return (
        <div className="w-full h-screen bg-[#0f172a] relative overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* HUD */}
            {gameState === 'playing' && !tutorial.isVisible && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-8 py-4 rounded-2xl flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</p>
                            <p className={`text-3xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</p>
                        </div>
                        {[
                            { label: 'You', color: 'text-cyan-400', count: scores[0] },
                            { label: 'K2', color: 'text-fuchsia-400', count: scores[1] },
                            { label: 'K3', color: 'text-yellow-400', count: scores[2] }
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${s.color}`}>{s.label}</p>
                                <p className="text-2xl font-black text-white tabular-nums">{Math.round((s.count / NUM_POINTS) * 100)}%</p>
                            </div>
                        ))}
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
                        if (tutorial.phase === 'init' && gameState === 'menu') startGame();
                    }}
                />
            )}
        </div>
    );
}
