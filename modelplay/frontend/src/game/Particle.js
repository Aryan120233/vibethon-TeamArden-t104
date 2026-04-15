/**
 * Particle.js — Lightweight particle emitter for visual FX.
 * Used for correct-split sparks and death explosions.
 */

export class Particle {
    constructor(x, y, color, velocity, life = 1) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x + (Math.random() - 0.5) * 100;
        this.vy = velocity.y + (Math.random() - 0.5) * 100;
        this.life = life;
        this.maxLife = life;
        this.size = 2 + Math.random() * 4;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 200 * dt; // gravity
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }

    get isDead() {
        return this.life <= 0;
    }
}

export class ParticleEmitter {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 30, speed = 200) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const spd = speed * (0.5 + Math.random());
            this.particles.push(new Particle(x, y, color, {
                x: Math.cos(angle) * spd,
                y: Math.sin(angle) * spd
            }, 0.6 + Math.random() * 0.5));
        }
    }

    update(dt) {
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => !p.isDead);
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}
