import { useEffect, useRef, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const TRAIL_LENGTH = 28;       // number of dots in the tail
const LERP_SPEED   = 0.18;     // how fast the head chases the mouse (0–1)

// Gradient stops matching kikk.be: purple/blue head → orange/yellow tail
const GRADIENT: [number, string][] = [
    [0.00, "#6B4BF5"],  // deep violet (head)
    [0.15, "#8B5CF6"],  // purple
    [0.30, "#C084FC"],  // pink-purple
    [0.45, "#F472B6"],  // pink
    [0.60, "#FB923C"],  // orange
    [0.75, "#FBBF24"],  // amber
    [1.00, "#FDE68A"],  // pale yellow (tail tip)
];

// ─── Colour interpolation ─────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: [number,number,number], b: [number,number,number], t: number) {
    return [
        Math.round(a[0] + (b[0]-a[0])*t),
        Math.round(a[1] + (b[1]-a[1])*t),
        Math.round(a[2] + (b[2]-a[2])*t),
    ] as [number,number,number];
}

function gradientColor(t: number): string {
    // t = 0 → head (index 0), t = 1 → tail tip (last index)
    for (let i = 0; i < GRADIENT.length - 1; i++) {
        const [t0, c0] = GRADIENT[i];
        const [t1, c1] = GRADIENT[i + 1];
        if (t <= t1) {
            const local = (t - t0) / (t1 - t0);
            const [r, g, b] = lerpColor(hexToRgb(c0), hexToRgb(c1), local);
            return `rgb(${r},${g},${b})`;
        }
    }
    return GRADIENT[GRADIENT.length - 1][1];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }

function useKikkTrail(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    // Smooth head position (lerp target)
    const head  = useRef<Point>({ x: -500, y: -500 });
    // Mouse raw position
    const mouse = useRef<Point>({ x: -500, y: -500 });
    // Ring buffer of past head positions
    const trail = useRef<Point[]>(
        Array.from({ length: TRAIL_LENGTH }, () => ({ x: -500, y: -500 }))
    );
    const visible = useRef(false);
    const raf = useRef<number>(0);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) { raf.current = requestAnimationFrame(draw); return; }
        const ctx = canvas.getContext("2d")!;

        // Resize if needed
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!visible.current) { raf.current = requestAnimationFrame(draw); return; }

        // Smooth head
        head.current.x = lerp(head.current.x, mouse.current.x, LERP_SPEED);
        head.current.y = lerp(head.current.y, mouse.current.y, LERP_SPEED);

        // Push new head position into trail ring buffer (shift)
        trail.current.unshift({ x: head.current.x, y: head.current.y });
        trail.current.length = TRAIL_LENGTH;

        // Draw each dot along the trail
        for (let i = 0; i < TRAIL_LENGTH; i++) {
            const t   = i / (TRAIL_LENGTH - 1);           // 0 = head, 1 = tail
            const pt  = trail.current[i];

            // Radius: big ball at head, tiny dot at tail
            // Head: ~14px, tail tip: ~2px
            const radius = 14 * (1 - t) + 2 * t;

            // Opacity: full at head, fades out at tail
            const alpha = (1 - t * 0.85);

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradientColor(t)
                .replace("rgb(", "rgba(")
                .replace(")", `,${alpha})`);
            ctx.fill();
        }

        raf.current = requestAnimationFrame(draw);
    }, [canvasRef]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            visible.current  = true;
        };
        const onLeave  = () => { visible.current = false; };
        const onEnter  = () => { visible.current = true;  };

        window.addEventListener("mousemove",  onMove);
        window.addEventListener("mouseleave", onLeave);
        window.addEventListener("mouseenter", onEnter);
        raf.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("mousemove",  onMove);
            window.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("mouseenter", onEnter);
            cancelAnimationFrame(raf.current);
        };
    }, [draw]);
}

// ─── Canvas overlay ──────────────────────────────────────────────────────────

function KikkCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useKikkTrail(canvasRef);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position:      "fixed",
                inset:         0,
                pointerEvents: "none",
                zIndex:        9999,
                width:         "100vw",
                height:        "100vh",
            }}
        />
    );
}

// ─── Demo page ───────────────────────────────────────────────────────────────

export default function App() {
    useEffect(() => {
        document.body.style.cursor = "none";
        return () => { document.body.style.cursor = ""; };
    }, []);

    const projects = [
        { num: "01", title: "Festival",    desc: "International festival of digital and creative cultures" },
        { num: "02", title: "Le Pavillon", desc: "The former Belgian pavilion of the Milan World Expo" },
        { num: "03", title: "ProtoLab",    desc: "Namur creative hub for emerging technologies" },
        { num: "04", title: "MediaLab",    desc: "Turning ideas into experiences and stories" },
    ];

    return (
        <div style={{
            fontFamily:  "'Inter', 'Helvetica Neue', Arial, sans-serif",
            background:  "#0d0d0d",
            minHeight:   "100vh",
            color:       "#f0efe9",
            cursor:      "none",
            userSelect:  "none",
        }}>
            <KikkCursor />

            {/* Nav */}
            <nav style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                padding:        "1.5rem 3rem",
                borderBottom:   "1px solid rgba(255,255,255,0.08)",
            }}>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
          KIKK
        </span>
                <div style={{ display: "flex", gap: "2rem" }}>
                    {["About", "Projects", "News", "Contact"].map(item => (
                        <a key={item} href="#" style={{
                            fontSize:       13,
                            textDecoration: "none",
                            color:          "rgba(255,255,255,0.6)",
                            letterSpacing:  "0.03em",
                            cursor:         "none",
                            transition:     "color 0.2s",
                        }}
                           onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                           onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "6rem 3rem 4rem", maxWidth: 1100, margin: "0 auto" }}>
                <p style={{
                    fontSize:      12,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color:         "rgba(255,255,255,0.4)",
                    marginBottom:  "1.5rem",
                }}>
                    Art × Science × Tech
                </p>
                <h1 style={{
                    fontSize:      "clamp(3.5rem, 9vw, 8rem)",
                    fontWeight:    800,
                    lineHeight:    0.9,
                    letterSpacing: "-0.035em",
                    margin:        0,
                    color:         "#fff",
                }}>
                    LET'S<br />COLLABORATE
                </h1>
                <p style={{
                    maxWidth:    460,
                    marginTop:   "2.5rem",
                    fontSize:    16,
                    lineHeight:  1.7,
                    color:       "rgba(255,255,255,0.5)",
                }}>
                    Partnerships, residencies, European projects — discover how to work with KIKK.
                </p>
                <button style={{
                    marginTop:     "2.5rem",
                    padding:       "0.85rem 2.2rem",
                    border:        "1px solid rgba(255,255,255,0.3)",
                    background:    "transparent",
                    color:         "#fff",
                    fontSize:      12,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor:        "none",
                    borderRadius:  2,
                    transition:    "border-color 0.2s, background 0.2s",
                }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#fff";
                            e.currentTarget.style.background  = "rgba(255,255,255,0.05)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                            e.currentTarget.style.background  = "transparent";
                        }}
                >
                    Partner with KIKK →
                </button>
            </section>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0 3rem" }} />

            {/* Projects */}
            <section style={{ padding: "3rem", maxWidth: 1100, margin: "0 auto" }}>
                <div style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "baseline",
                    marginBottom:   "2rem",
                }}>
          <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
            Ecosystem
          </span>
                    <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "none", textDecoration: "none" }}>
                        Explore all →
                    </a>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    {projects.map((p, i) => (
                        <div
                            key={p.num}
                            style={{
                                padding:      "2rem 1.75rem",
                                borderTop:    "1px solid rgba(255,255,255,0.08)",
                                borderRight:  i < projects.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                                cursor:       "none",
                                transition:   "background 0.3s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
              <span style={{
                  display:       "block",
                  fontSize:      11,
                  letterSpacing: "0.12em",
                  color:         "rgba(255,255,255,0.25)",
                  marginBottom:  "1.5rem",
              }}>
                {p.num}
              </span>
                            <span style={{
                                display:       "block",
                                fontWeight:    700,
                                fontSize:      18,
                                letterSpacing: "-0.01em",
                                marginBottom:  "0.75rem",
                                color:         "#fff",
                            }}>
                {p.title}
              </span>
                            <span style={{
                                display:    "block",
                                fontSize:   13,
                                lineHeight: 1.6,
                                color:      "rgba(255,255,255,0.4)",
                            }}>
                {p.desc}
              </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section style={{
                padding:   "3rem",
                maxWidth:  1100,
                margin:    "0 auto",
                display:   "flex",
                gap:       "4rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
                {[
                    { n: "15", label: "Years" },
                    { n: "8",  label: "Active projects" },
                    { n: "BE", label: "Namur, Belgium"  },
                ].map(s => (
                    <div key={s.label}>
                        <div style={{
                            fontSize:      "clamp(2rem, 4vw, 3.5rem)",
                            fontWeight:    800,
                            letterSpacing: "-0.03em",
                            lineHeight:    1,
                            color:         "#fff",
                        }}>
                            {s.n}
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}