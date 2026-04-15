import { useRef, useEffect, useCallback } from 'react';

/**
 * useGameLoop — Custom hook for a rock-solid 60FPS game loop.
 * Decouples update() (physics/logic) from draw() (rendering).
 * 
 * @param {Function} update - Called every frame with deltaTime in seconds
 * @param {Function} draw - Called every frame with the canvas 2D context
 * @param {boolean} isRunning - Whether the loop should be active
 * @returns {{ canvasRef: React.RefObject }}
 */
export default function useGameLoop(update, draw, isRunning) {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const lastTimeRef = useRef(0);

    const loop = useCallback((timestamp) => {
        const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05); // Cap delta to 50ms
        lastTimeRef.current = timestamp;

        // Physics tick
        update(dt);

        // Render tick
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw(ctx, canvas.width, canvas.height);
        }

        animFrameRef.current = requestAnimationFrame(loop);
    }, [update, draw]);

    useEffect(() => {
        if (isRunning) {
            lastTimeRef.current = performance.now();
            animFrameRef.current = requestAnimationFrame(loop);
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isRunning, loop]);

    return { canvasRef };
}
