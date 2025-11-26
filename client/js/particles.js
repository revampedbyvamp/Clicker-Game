// Particle System for Visual Effects
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.floatingNumbers = [];

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Start animation loop
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createClickParticles(x, y, value) {
        // Create particle burst
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02,
                size: 3 + Math.random() * 3,
                color: `hsl(${250 + Math.random() * 40}, 80%, 60%)`,
            });
        }

        // Create floating number
        this.floatingNumbers.push({
            x,
            y,
            value: `+${this.formatNumber(value)}`,
            vy: -2,
            life: 1,
            decay: 0.015,
        });
    }

    createAmbientParticles() {
        if (this.particles.length < 50) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.5 - Math.random() * 0.5,
                life: 1,
                decay: 0.005,
                size: 1 + Math.random() * 2,
                color: `rgba(139, 92, 246, ${0.3 + Math.random() * 0.3})`,
            });
        }
    }

    update() {
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            return p.life > 0;
        });

        // Update floating numbers
        this.floatingNumbers = this.floatingNumbers.filter(n => {
            n.y += n.vy;
            n.life -= n.decay;
            return n.life > 0;
        });

        // Add ambient particles
        if (Math.random() < 0.1) {
            this.createAmbientParticles();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw floating numbers
        this.floatingNumbers.forEach(n => {
            this.ctx.globalAlpha = n.life;
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.font = 'bold 24px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(n.value, n.x, n.y);
        });

        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// Initialize particle system
const canvas = document.getElementById('particleCanvas');
const particleSystem = new ParticleSystem(canvas);
