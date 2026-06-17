import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./starbackground.module.css";

export interface StarFieldProps {
  /** Total number of star particles. Default: 12 000 on desktop, 5 000 on mobile. */
  count?: number;
  /** How fast stars gently drift. 0 = frozen. Default: 0.012 */
  driftSpeed?: number;
  /** Enable gravitational cursor pull. Default: true */
  gravityEnabled?: boolean;
  /** Background colour (hex). Default: '#05060d' */
  bgColor?: string;
  /** z-index of the canvas. Default: 0 */
  zIndex?: number;
  /** If true, canvas is absolute inside parent instead of fixed fullscreen. Default: false */
  contained?: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const VERT =  `
  attribute float pSize;
  attribute float brightness;
  attribute vec3  seed;

  uniform float uTime;
  uniform float uDrift;
  uniform vec2  uMouse;
  uniform vec3  uMouseWorld;
  uniform float uGravity;
  uniform float uPixelRatio;

  varying float vBrightness;
  varying float vPull;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  void main() {
    vBrightness = brightness;

    // Slow ambient drift — each star moves on its own sine/cos path
    float t = uTime * uDrift;
    vec3 pos = position;
    pos.x += sin(t * 0.7 + seed.x) * 0.18;
    pos.y += cos(t * 0.5 + seed.y) * 0.14;
    pos.z += sin(t * 0.4 + seed.z) * 0.22;

    // Subtle mouse parallax (closer stars move more — simulate depth)
    float depth = (pos.z + 120.0) / 240.0; // 0..1 front..back
    pos.x += uMouse.x * (1.2 - depth * 0.9);
    pos.y += uMouse.y * (0.8 - depth * 0.6);

    // Gravitational cursor pull
    vec3 toMouse = uMouseWorld - pos;
    float dist    = length(toMouse) + 0.5;
    float force   = uGravity * 22.0 / (dist * dist);
    force        *= (0.6 + 0.8 * hash(seed.yzx));
    force         = clamp(force, 0.0, 7.0);

    vec3 pull   = normalize(toMouse);
    vec3 swirl  = normalize(cross(pull, vec3(0.0, 0.0, 1.0) + seed * 0.01));
    pos        += pull * force * 0.80 + swirl * force * 0.20;

    vPull = clamp(force / 5.0, 0.0, 1.0);

    vec4 mv   = modelViewMatrix * vec4(pos, 1.0);
    float sz  = pSize * (180.0 / max(-mv.z, 1.0)) * uPixelRatio;
    sz       *= (1.0 + vPull * 1.6);

    gl_PointSize = clamp(sz, 0.4, 14.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  varying float vBrightness;
  varying float vPull;

  uniform vec3  uColorCore;
  uniform vec3  uColorRim;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    // Soft circular point — sharp bright core, soft glow halo
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 1.4);

    // Colour: cold white-blue core → warmer rim on brighter stars
    vec3 col = mix(uColorCore, uColorRim, (1.0 - core) * 0.6);

    // Gravity pull brightens + warms the star
    col += vPull * vec3(0.85, 0.78, 0.55) * 1.1;

    float alpha = core * vBrightness;
    alpha      += vPull * 0.25;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function StarField({
                                    count,
                                    driftSpeed = 0.012,
                                    gravityEnabled = true,
                                    bgColor = "#05060d",
                                    zIndex = 0,
                                    contained = false,
                                  }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mobile    = window.innerWidth < 768;
    const COUNT     = count ?? (mobile ? 5000 : 12000);
    const BG        = parseInt(bgColor.replace("#", ""), 16);

    // ------------------------------------------------------------------
    // Renderer / Scene / Camera
    // ------------------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setClearColor(BG, 1);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 60);

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pr);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      (uniforms.uPixelRatio as { value: number }).value = pr;
    }

    // ------------------------------------------------------------------
    // Star positions — pure random scatter in a deep box volume
    // Stars are distributed in 3 depth layers so closer ones are fewer
    // but larger, matching how a real star field reads.
    // ------------------------------------------------------------------
    const positions   = new Float32Array(COUNT * 3);
    const seeds       = new Float32Array(COUNT * 3);
    const pSizes      = new Float32Array(COUNT);
    const brightnesses = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Depth layer: 60% background, 30% mid, 10% foreground
      const layer = Math.random();
      let zSpread: number, xySpread: number, baseSize: number, baseBright: number;

      if (layer < 0.60) {
        // Background — tiny, dim, densely packed
        zSpread   = rand(-120, -20);
        xySpread  = rand(60, 120);
        baseSize  = rand(0.3, 0.65);
        baseBright = rand(0.25, 0.55);
      } else if (layer < 0.90) {
        // Mid-field
        zSpread   = rand(-20, 20);
        xySpread  = rand(45, 90);
        baseSize  = rand(0.55, 1.0);
        baseBright = rand(0.45, 0.80);
      } else {
        // Foreground — few, large, bright
        zSpread   = rand(20, 50);
        xySpread  = rand(35, 75);
        baseSize  = rand(0.9, 1.6);
        baseBright = rand(0.65, 1.0);
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * xySpread;
      positions[i * 3]     = Math.cos(angle) * radius + rand(-8, 8);
      positions[i * 3 + 1] = Math.sin(angle) * radius + rand(-8, 8);
      positions[i * 3 + 2] = zSpread;

      seeds[i * 3]     = Math.random() * 6283;
      seeds[i * 3 + 1] = Math.random() * 6283;
      seeds[i * 3 + 2] = Math.random() * 6283;

      pSizes[i]      = baseSize;
      brightnesses[i] = baseBright;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position",   new THREE.BufferAttribute(positions,    3));
    geo.setAttribute("seed",       new THREE.BufferAttribute(seeds,        3));
    geo.setAttribute("pSize",      new THREE.BufferAttribute(pSizes,       1));
    geo.setAttribute("brightness", new THREE.BufferAttribute(brightnesses, 1));

    // ------------------------------------------------------------------
    // Uniforms
    // ------------------------------------------------------------------
    const uniforms = {
      uTime:        { value: 0 },
      uDrift:       { value: driftSpeed },
      uMouse:       { value: new THREE.Vector2(0, 0) },
      uMouseWorld:  { value: new THREE.Vector3(0, 0, 0) },
      uGravity:     { value: 0.0 },
      uPixelRatio:  { value: renderer.getPixelRatio() },
      uColorCore:   { value: new THREE.Color("#ddeeff") },
      uColorRim:    { value: new THREE.Color("#8ab4ff") },
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent:   true,
      depthWrite:    false,
      blending:      THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    resize();
    window.addEventListener("resize", resize);

    // ------------------------------------------------------------------
    // Mouse / gravity
    // ------------------------------------------------------------------
    const mouseTarget  = new THREE.Vector2(0, 0);
    const mouseCurrent = new THREE.Vector2(0, 0);
    const raycaster    = new THREE.Raycaster();
    const gravPlane    = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const worldPos     = new THREE.Vector3();
    let   gravTarget   = 0;
    let   idleTimer: ReturnType<typeof setTimeout> | null = null;

    function unprojectMouse(nx: number, ny: number) {
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      raycaster.ray.intersectPlane(gravPlane, worldPos);
      (uniforms.uMouseWorld.value as THREE.Vector3).copy(worldPos);
    }

    function onMouseMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseTarget.set(nx, ny);
      if (gravityEnabled) {
        unprojectMouse(nx, ny);
        gravTarget = 1.0;
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { gravTarget = 0; }, 2200);
      }
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      const nx = (t.clientX / window.innerWidth)  * 2 - 1;
      const ny = -((t.clientY / window.innerHeight) * 2 - 1);
      mouseTarget.set(nx, ny);
      if (gravityEnabled) {
        unprojectMouse(nx, ny);
        gravTarget = 0.65;
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { gravTarget = 0; }, 1600);
      }
    }

    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("touchmove",  onTouchMove, { passive: true });

    let rafId: number;

    function tick(now: number) {
      const t = now / 1000;
      (uniforms.uTime as { value: number }).value = t;

      // Smooth mouse
      mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.05);
      mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.05);
      (uniforms.uMouse.value as THREE.Vector2).set(mouseCurrent.x, mouseCurrent.y);

      const gc = (uniforms.uGravity as { value: number }).value;
      (uniforms.uGravity as { value: number }).value = lerp(gc, gravTarget, gravTarget > gc ? 0.10 : 0.022);

      // Extremely slow camera breathing — gives the scene life
      camera.position.x = Math.sin(t * 0.018) * 1.2;
      camera.position.y = Math.cos(t * 0.013) * 0.8;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("touchmove",  onTouchMove);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, [count, driftSpeed, gravityEnabled, bgColor]);

  return (
      <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${contained ? styles.contained : ""}`}
          style={{ zIndex }}
      />
  );
}