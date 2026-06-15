import  { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
}

export default function Cursor() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef<Point>({ x: 0, y: 0 });
    const isMovingRef = useRef<boolean>(false);

    const TRAIL_LENGTH = 45;
    const pointsRef = useRef<Point[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const initPoints = (x: number, y: number) => {
            pointsRef.current = Array.from({ length: TRAIL_LENGTH }, () => ({ x, y }));
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        document.body.style.cursor = 'none';

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            if (!isMovingRef.current) {
                isMovingRef.current = true;
                initPoints(e.clientX, e.clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const points = pointsRef.current;
            const mouse = mouseRef.current;

            if (points.length > 0) {

                points[0].x += (mouse.x - points[0].x) * 0.25;
                points[0].y += (mouse.y - points[0].y) * 0.25;

                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];

                    const ease = 0.35 + (i / points.length) * 0.15;
                    curr.x += (prev.x - curr.x) * ease;
                    curr.y += (prev.y - curr.y) * ease;
                }

                for (let i = points.length - 1; i >= 0; i--) {
                    const p = points[i];

                    const progress = 1 - i / points.length;

                    const radius = 3 + progress * 8;

                    const alpha = Math.pow(progress, 1.2);

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

                    let r = 207, g = 232, b = 255;

                    if (progress > 0.7) {
                        const t = (progress - 0.7) / 0.3;
                        r = Math.floor(110 * (1 - t) + 59 * t);
                        g = Math.floor(90 * (1 - t) + 102 * t);
                        b = Math.floor(210 * (1 - t) + 245 * t);
                    } else if (progress > 0.3) {
                        const t = (progress - 0.3) / 0.4;
                        r = Math.floor(235 * (1 - t) + 110 * t);
                        g = Math.floor(120 * (1 - t) + 90 * t);
                        b = Math.floor(120 * (1 - t) + 210 * t);
                    } else {
                        const t = progress / 0.3;
                        r = Math.floor(220 * (1 - t) + 235 * t);
                        g = Math.floor(210 * (1 - t) + 120 * t);
                        b = Math.floor(235 * (1 - t) + 120 * t);
                    }

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            document.body.style.cursor = 'auto';
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 99999,
            }}
        />
    );
}