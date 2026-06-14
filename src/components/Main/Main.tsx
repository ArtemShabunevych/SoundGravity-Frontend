import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function LandingPage() {
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);
    const loaderRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = () => window.innerWidth < 768;

        // -------------------------------------------------------------------
        // Renderer / Scene / Camera
        // -------------------------------------------------------------------
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setClearColor(0x05060d, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 0, 60);

        // Оптимізація кількості частинок для мобілок (уберігає від лагів)
        const COUNT = isMobile() ? 15000 : 50000;

        function resize() {
            const w = window.innerWidth, h = window.innerHeight;
            renderer.setSize(w, h, false);
            const pr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.2 : 2);
            renderer.setPixelRatio(pr);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            if (uniforms.uPixelRatio) uniforms.uPixelRatio.value = pr;
            if (bgMat && bgMat.uniforms.uResolution) bgMat.uniforms.uResolution.value.set(w, h);
        }
        window.addEventListener('resize', resize);

        // -------------------------------------------------------------------
        // Formation Generators (Точні математичні моделі з main.js)
        // -------------------------------------------------------------------
        function rand(a, b) { return a + Math.random() * (b - a); }

        function formSphere() {
            const arr = new Float32Array(COUNT * 3);
            for (let i = 0; i < COUNT; i++) {
                const r = 14 * Math.pow(Math.random(), 0.45) + rand(-1.2, 1.2);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                arr[i * 3 + 2] = r * Math.cos(phi);
            }
            return arr;
        }

        function formTunnel() {
            const arr = new Float32Array(COUNT * 3);
            const ARC_R = 18; const ARM_H = 14; const CUP_R = 7.5; const CUP_DEPTH = 4.5;
            for (let i = 0; i < COUNT; i++) {
                const f = Math.random();
                if (f < 0.20) {
                    const a = Math.random() * Math.PI; const arcR = ARC_R + rand(-0.5, 0.5);
                    arr[i * 3] = Math.cos(a) * arcR;
                    arr[i * 3 + 1] = Math.abs(Math.sin(a)) * arcR * 0.55 + 4;
                    arr[i * 3 + 2] = rand(-0.9, 0.9);
                } else if (f < 0.35) {
                    const t = Math.random();
                    arr[i * 3] = -ARC_R + rand(-0.5, 0.5);
                    arr[i * 3 + 1] = (4) + t * (-(ARM_H * 0.5) - 4);
                    arr[i * 3 + 2] = rand(-0.6, 0.6);
                } else if (f < 0.50) {
                    const t = Math.random();
                    arr[i * 3] = ARC_R + rand(-0.5, 0.5);
                    arr[i * 3 + 1] = (4) + t * (-(ARM_H * 0.5) - 4);
                    arr[i * 3 + 2] = rand(-0.6, 0.6);
                } else if (f < 0.72) {
                    const cupCX = -ARC_R; const cupCY = -(ARM_H * 0.5); const subF = Math.random();
                    if (subF < 0.45) {
                        const a = Math.random() * Math.PI * 2; const cr = CUP_R + rand(-0.35, 0.35);
                        arr[i * 3] = cupCX + Math.cos(a) * cr; arr[i * 3 + 1] = cupCY + Math.sin(a) * cr; arr[i * 3 + 2] = rand(-0.4, 0.4);
                    } else if (subF < 0.75) {
                        const r = CUP_R * Math.sqrt(Math.random()); const a = Math.random() * Math.PI * 2;
                        arr[i * 3] = cupCX + Math.cos(a) * r; arr[i * 3 + 1] = cupCY + Math.sin(a) * r; arr[i * 3 + 2] = -CUP_DEPTH + rand(-0.25, 0.25);
                    } else {
                        const a = Math.random() * Math.PI * 2; const cr = CUP_R + rand(-0.25, 0.25);
                        arr[i * 3] = cupCX + Math.cos(a) * cr; arr[i * 3 + 1] = cupCY + Math.sin(a) * cr; arr[i * 3 + 2] = rand(-CUP_DEPTH, 0);
                    }
                } else if (f < 0.94) {
                    const cupCX = ARC_R; const cupCY = -(ARM_H * 0.5); const subF = Math.random();
                    if (subF < 0.45) {
                        const a = Math.random() * Math.PI * 2; const cr = CUP_R + rand(-0.35, 0.35);
                        arr[i * 3] = cupCX + Math.cos(a) * cr; arr[i * 3 + 1] = cupCY + Math.sin(a) * cr; arr[i * 3 + 2] = rand(-0.4, 0.4);
                    } else if (subF < 0.75) {
                        const r = CUP_R * Math.sqrt(Math.random()); const a = Math.random() * Math.PI * 2;
                        arr[i * 3] = cupCX + Math.cos(a) * r; arr[i * 3 + 1] = cupCY + Math.sin(a) * r; arr[i * 3 + 2] = -CUP_DEPTH + rand(-0.25, 0.25);
                    } else {
                        const a = Math.random() * Math.PI * 2; const cr = CUP_R + rand(-0.25, 0.25);
                        arr[i * 3] = cupCX + Math.cos(a) * cr; arr[i * 3 + 1] = cupCY + Math.sin(a) * cr; arr[i * 3 + 2] = rand(-CUP_DEPTH, 0);
                    }
                } else {
                    const t = Math.random(); const z = (t - 0.5) * 180; const angle = Math.random() * Math.PI * 2;
                    const bar = Math.floor(((angle / (Math.PI * 2)) * 32));
                    const barHeight = 0.35 + Math.abs(Math.sin(bar * 0.7 + z * 0.05)) * 0.55;
                    arr[i * 3] = Math.cos(angle) * (12 * barHeight + rand(-0.5, 0.5));
                    arr[i * 3 + 1] = Math.sin(angle) * (12 * barHeight + rand(-0.5, 0.5));
                    arr[i * 3 + 2] = z;
                }
            }
            return arr;
        }

        function formPlanets() {
            const arr = new Float32Array(COUNT * 3);
            const centers = [[-22, 10, 0], [22, 10, 0], [-22, -12, 0], [22, -12, 0]];
            const perPlanet = Math.floor(COUNT / 4);
            for (let p = 0; p < 4; p++) {
                const c = centers[p]; const start = p * perPlanet; const end = (p === 3) ? COUNT : (p + 1) * perPlanet;
                for (let i = start; i < end; i++) {
                    const local = i - start; const frac = local / (end - start);
                    if (frac < 0.45) {
                        const r = 5.5 * Math.pow(Math.random(), 0.42); const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
                        const sTheta = theta + (Math.floor(r * 3) * (Math.PI * 2 / 3)) * 0.08;
                        arr[i * 3] = c[0] + r * Math.sin(phi) * Math.cos(sTheta); arr[i * 3 + 1] = c[1] + r * Math.sin(phi) * Math.sin(sTheta); arr[i * 3 + 2] = c[2] + r * Math.cos(phi) * 0.62;
                    } else if (frac < 0.75) {
                        const band = Math.floor(Math.random() * 3); const ringR = (7.2 + band * 2.1) + Math.random() * 1.2; const angle = Math.random() * Math.PI * 2;
                        arr[i * 3] = c[0] + Math.cos(angle) * ringR; arr[i * 3 + 1] = c[1] + Math.sin(angle) * ringR * 0.12 + ((Math.random() - 0.5) * 0.18) * ringR * 0.3; arr[i * 3 + 2] = c[2] + Math.sin(angle) * ringR * 0.08 + rand(-0.25, 0.25);
                    } else if (frac < 0.90) {
                        const grooveR = 2.0 + Math.floor(Math.random() * 8) * 0.42; const grooveAngle = Math.random() * Math.PI * 2;
                        arr[i * 3] = c[0] + Math.cos(grooveAngle) * grooveR; arr[i * 3 + 1] = c[1] + Math.sin(grooveAngle) * grooveR * 0.92; arr[i * 3 + 2] = c[2] + Math.abs(Math.sin(grooveAngle)) * grooveR * 0.15 + rand(-0.08, 0.08);
                    } else {
                        const satIdx = local % 2; const satOrbitR = 9.5 + satIdx * 2.2; const satAngle = Math.random() * Math.PI * 2;
                        arr[i * 3] = c[0] + Math.cos(satAngle + satIdx * Math.PI) * satOrbitR; arr[i * 3 + 1] = c[1] + Math.sin(satAngle + satIdx * Math.PI) * satOrbitR * 0.55; arr[i * 3 + 2] = c[2] + Math.sin(satAngle) * satOrbitR * 0.2 + rand(-0.4, 0.4);
                    }
                }
            }
            return arr;
        }

        function formNetwork() {
            const arr = new Float32Array(COUNT * 3); const NODES = 140; const nodePos = [];
            for (let n = 0; n < NODES; n++) nodePos.push([rand(-60, 60), rand(-32, 32), rand(-40, 10)]);
            for (let i = 0; i < COUNT; i++) {
                if (i % 3 === 0) {
                    const n = nodePos[i % NODES];
                    arr[i * 3] = n[0] + rand(-1.5, 1.5); arr[i * 3 + 1] = n[1] + rand(-1.5, 1.5); arr[i * 3 + 2] = n[2] + rand(-1.5, 1.5);
                } else {
                    const a = nodePos[Math.floor(Math.random() * NODES)]; const b = nodePos[Math.floor(Math.random() * NODES)]; const t = Math.random();
                    arr[i * 3] = a[0] + (b[0] - a[0]) * t + rand(-0.3, 0.3); arr[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + rand(-0.3, 0.3); arr[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + rand(-0.3, 0.3);
                }
            }
            return arr;
        }

        function formClusters() {
            const arr = new Float32Array(COUNT * 3); const CLUSTERS = 9; const centers = [];
            for (let c = 0; c < CLUSTERS; c++) { const ang = (c / CLUSTERS) * Math.PI * 2; centers.push([Math.cos(ang) * rand(14, 34), Math.sin(ang) * rand(14, 34) * 0.6, rand(-20, 20)]); }
            for (let i = 0; i < COUNT; i++) {
                const c = centers[i % CLUSTERS]; const r = 5.5 * Math.pow(Math.random(), 0.6); const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
                arr[i * 3] = c[0] + r * Math.sin(phi) * Math.cos(theta); arr[i * 3 + 1] = c[1] + r * Math.sin(phi) * Math.sin(theta); arr[i * 3 + 2] = c[2] + r * Math.cos(phi);
            }
            return arr;
        }

        function formLogo() {
            const arr = new Float32Array(COUNT * 3);
            for (let i = 0; i < COUNT; i++) {
                const f = Math.random();
                if (f < 0.35) {
                    const a = Math.random() * Math.PI * 2; const r = 13 + rand(-0.25, 0.25);
                    arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 1] = Math.sin(a) * r; arr[i * 3 + 2] = rand(-0.4, 0.4);
                } else if (f < 0.6) {
                    const r = 4.5 * Math.pow(Math.random(), 0.4); const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
                    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta); arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); arr[i * 3 + 2] = r * Math.cos(phi);
                } else if (f < 0.85) {
                    const a = (Math.floor(Math.random() * 24) / 24) * Math.PI * 2;
                    const r = 14.2 + Math.random() * (2.5 + Math.abs(Math.sin(Math.floor(Math.random() * 24) * 1.3)) * 4);
                    arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 1] = Math.sin(a) * r; arr[i * 3 + 2] = rand(-0.3, 0.3);
                } else {
                    const r = rand(18, 42); const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
                    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta); arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); arr[i * 3 + 2] = r * Math.cos(phi);
                }
            }
            return arr;
        }

        const FORMATIONS = [formSphere(), formTunnel(), formPlanets(), formNetwork(), formClusters(), formLogo()];
        const SCENE_COUNT = FORMATIONS.length;

        const seeds = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);
        const colorMix = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
            seeds[i * 3] = Math.random() * 1000; seeds[i * 3 + 1] = Math.random() * 1000; seeds[i * 3 + 2] = Math.random() * 1000;
            sizes[i] = rand(0.5, 1.0); colorMix[i] = Math.random();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FORMATIONS[0]), 3));
        geometry.setAttribute('targetPos', new THREE.BufferAttribute(new Float32Array(FORMATIONS[1]), 3));
        geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 3));
        geometry.setAttribute('pSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('cMix', new THREE.BufferAttribute(colorMix, 1));

        // Shaders стрінги
        const vertexShader = `
      attribute vec3 targetPos; attribute vec3 seed; attribute float pSize; attribute float cMix;
      uniform float uMorph; uniform float uTime; uniform float uBass; uniform float uClickPulse;
      uniform float uPixelRatio; uniform float uSceneIndex; vec2 uMouse; uniform vec3 uMouseWorld;
      uniform float uGravityStrength; uniform float uFlightFactor;
      varying float vMix; varying float vGlow; varying float vSceneIndex; varying float vGravityPull;
      float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
      void main(){
        vMix = cMix; vSceneIndex = uSceneIndex;
        vec3 base = mix(position, targetPos, uMorph);
        float t = uTime * 0.15;
        vec3 drift = vec3(sin(t + seed.x), cos(t * 1.1 + seed.y), sin(t * 0.9 + seed.z)) * (0.6 + 0.6 * hash(seed));
        float impulse = clamp(uBass + uClickPulse, 0.0, 1.5);
        vec3 dir = normalize(base + 0.0001);
        vec3 displaced = base + drift + dir * impulse * (2.5 + 2.0 * hash(seed.zyx));
        vec3 toMouse = uMouseWorld - displaced;
        float distToMouse = length(toMouse) + 0.5;
        float gravForce = uGravityStrength * 28.0 / (distToMouse * distToMouse);
        gravForce *= (0.7 + 0.6 * hash(seed.yzx));
        gravForce = clamp(gravForce, 0.0, 9.0);
        vec3 pullDir = normalize(toMouse);
        vec3 swirl = normalize(cross(pullDir, vec3(0.0, 0.0, 1.0) + seed * 0.01));
        displaced += pullDir * gravForce * 0.82 + swirl * gravForce * 0.18;
        vGravityPull = clamp(gravForce / 6.0, 0.0, 1.0);
        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        float dist = -mvPosition.z;
        float size = pSize * (220.0 / max(dist, 1.0)) * uPixelRatio;
        size *= (1.0 + impulse * 1.8); size *= (1.0 + vGravityPull * 1.4);
        vGlow = impulse;
        gl_PointSize = clamp(size, 0.6, 16.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

        const fragmentShader = `
      precision mediump float;
      varying float vMix; varying float vGlow; varying float vSceneIndex; varying float vGravityPull;
      uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorAccentA; uniform vec3 uColorAccentB; uniform float uOpacity;
      void main(){
        vec2 uv = gl_PointCoord.xy - 0.5;
        if (length(uv) > 0.5) discard;
        float alpha = pow(smoothstep(0.5, 0.0, length(uv)), 1.6);
        vec3 col = mix(uColorA, uColorB, vMix);
        col = mix(col, mix(uColorAccentA, uColorAccentB, vMix), 0.18);
        col += vGlow * 0.6;
        col += vGravityPull * vec3(0.9, 0.85, 0.6) * 1.2;
        gl_FragColor = vec4(col, (alpha + vGravityPull * 0.3) * uOpacity);
      }
    `;

        const uniforms = {
            uMorph: { value: 0 }, uTime: { value: 0 }, uBass: { value: 0 }, uClickPulse: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() }, uSceneIndex: { value: 0 },
            uMouseWorld: { value: new THREE.Vector3(0, 0, 0) }, uGravityStrength: { value: 0.0 }, uFlightFactor: { value: 0 },
            uColorA: { value: new THREE.Color('#cfe8ff') }, uColorB: { value: new THREE.Color('#7fa8ff') },
            uColorAccentA: { value: new THREE.Color('#ffffff') }, uColorAccentB: { value: new THREE.Color('#9fd8ff') },
            uOpacity: { value: 0.9 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Background Mesh
        const bgGeo = new THREE.PlaneGeometry(2, 2);
        const bgMat = new THREE.ShaderMaterial({
            uniforms: {
                uColor1: { value: new THREE.Color('#05060d') }, uColor2: { value: new THREE.Color('#0d1230') },
                uMix: { value: 0 }, uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
            fragmentShader: `
        precision mediump float; uniform vec3 uColor1; uniform vec3 uColor2; uniform float uMix; uniform vec2 uResolution;
        void main(){
          float d = distance(gl_FragCoord.xy / uResolution, vec2(0.5));
          gl_FragColor = vec4(mix(uColor1, uColor2, smoothstep(0.0, 0.9, d) * (0.4 + uMix*0.6)), 1.0);
        }
      `,
            depthTest: false, depthWrite: false,
        });
        const bgMesh = new THREE.Mesh(bgGeo, bgMat);
        bgMesh.renderOrder = -1; bgMesh.frustumCulled = false;
        scene.add(bgMesh);

        const SCENE_CONFIG = [
            { colorA: '#cfe8ff', colorB: '#7fa8ff', accentA: '#ffffff', accentB: '#bfe1ff', cam: { pos: [0, 0, 60], fov: 55 }, flight: 0, bgMix: 0 },
            { colorA: '#9fe8ff', colorB: '#6effc1', accentA: '#ffffff', accentB: '#caffe9', cam: { pos: [0, 0, 22], fov: 70 }, flight: 1, bgMix: 0.3 },
            { colorA: '#ffb84d', colorB: '#6e7bff', accentA: '#ff5a3c', accentB: '#5b6788', cam: { pos: [0, 0, 58], fov: 58 }, flight: 0, bgMix: 0.5 },
            { colorA: '#bfe6ff', colorB: '#7fffd4', accentA: '#ffffff', accentB: '#9fd8ff', cam: { pos: [0, 0, 95], fov: 60 }, flight: 0, bgMix: 0.7 },
            { colorA: '#caa6ff', colorB: '#7fc8ff', accentA: '#ffd27a', accentB: '#caa6ff', cam: { pos: [10, 6, 70], fov: 56 }, flight: 0, bgMix: 0.55 },
            { colorA: '#ffd27a', colorB: '#ffb84d', accentA: '#ffffff', accentB: '#fff0d0', cam: { pos: [0, 0, 42], fov: 50 }, flight: 0, bgMix: 0.15 },
        ];

        // -------------------------------------------------------------------
        // Гравітаційне поле миші / Тачу
        // -------------------------------------------------------------------
        const raycaster = new THREE.Raycaster();
        const gravityPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const mouseWorldPos = new THREE.Vector3();
        let gravityStrengthTarget = 0;
        let mouseIdleTimer = null;

        function unprojectMouse(ndcX, ndcY) {
            raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
            raycaster.ray.intersectPlane(gravityPlane, mouseWorldPos);
            if (mouseWorldPos) uniforms.uMouseWorld.value.copy(mouseWorldPos);
        }

        const handleMouseMove = (e) => {
            const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
            const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
            unprojectMouse(ndcX, ndcY);

            if (cursorRef.current) {
                cursorRef.current.style.left = `${e.clientX}px`;
                cursorRef.current.style.top = `${e.clientY}px`;
            }

            gravityStrengthTarget = 1.0;
            if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
            mouseIdleTimer = setTimeout(() => { gravityStrengthTarget = 0; }, 2000);
        };

        const handleTouchMove = (e) => {
            if (!e.touches.length) return;
            const touch = e.touches[0];
            const ndcX = (touch.clientX / window.innerWidth) * 2 - 1;
            const ndcY = -((touch.clientY / window.innerHeight) * 2 - 1);
            unprojectMouse(ndcX, ndcY);
            gravityStrengthTarget = 0.6;
            if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
            mouseIdleTimer = setTimeout(() => { gravityStrengthTarget = 0; }, 1000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        // -------------------------------------------------------------------
        // Скрол-контроль сцен
        // -------------------------------------------------------------------
        let lastFloor = 0;
        function setSceneProgress(p) {
            p = Math.max(0, Math.min(SCENE_COUNT - 1, p));
            const floor = Math.floor(p); const next = Math.min(SCENE_COUNT - 1, floor + 1); const frac = p - floor;

            if (floor !== lastFloor) {
                const posAttr = geometry.getAttribute('position');
                const tgtAttr = geometry.getAttribute('targetPos');
                posAttr.array.set(FORMATIONS[floor]);
                tgtAttr.array.set(FORMATIONS[next]);
                posAttr.needsUpdate = true; tgtAttr.needsUpdate = true;
                lastFloor = floor;
            }

            uniforms.uMorph.value = frac; uniforms.uSceneIndex.value = p;

            const cA = SCENE_CONFIG[floor].cam; const cB = SCENE_CONFIG[next].cam;
            camera.position.set(lerp(cA.pos[0], cB.pos[0], frac), lerp(cA.pos[1], cB.pos[1], frac), lerp(cA.pos[2], cB.pos[2], frac));
            camera.fov = lerp(cA.fov, cB.fov, frac); camera.updateProjectionMatrix();
            uniforms.uFlightFactor.value = lerp(SCENE_CONFIG[floor].flight, SCENE_CONFIG[next].flight, frac) * 0.04;

            const cA1 = new THREE.Color(SCENE_CONFIG[floor].colorA), cA2 = new THREE.Color(SCENE_CONFIG[next].colorA);
            uniforms.uColorA.value.copy(cA1).lerp(cA2, frac);
            bgMat.uniforms.uMix.value = lerp(SCENE_CONFIG[floor].bgMix, SCENE_CONFIG[next].bgMix, frac);
        }

        const handleScroll = () => {
            const doc = document.documentElement;
            const maxScroll = doc.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            setSceneProgress(progress * (SCENE_COUNT - 1));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // -------------------------------------------------------------------
        // Анімаційний цикл (Loop)
        // -------------------------------------------------------------------
        let frameId = null;
        const tick = (now) => {
            const t = now / 1000;
            uniforms.uTime.value = t;

            const gTarget = gravityStrengthTarget;
            uniforms.uGravityStrength.value = lerp(uniforms.uGravityStrength.value, gTarget, gTarget > uniforms.uGravityStrength.value ? 0.12 : 0.025);

            const beatPhase = (t % 0.9) / 0.9;
            let pulse = Math.pow(Math.max(0, 1 - beatPhase * 6), 1.5);
            uniforms.uBass.value = lerp(uniforms.uBass.value, pulse * 0.4, 0.5);

            points.rotation.y = Math.sin(t * 0.03) * 0.06;
            points.rotation.x = Math.cos(t * 0.025) * 0.03;

            if (cursorRef.current) {
                const isActive = uniforms.uGravityStrength.value > 0.05;
                cursorRef.current.classList.toggle('active', isActive);
            }

            renderer.render(scene, camera);
            frameId = requestAnimationFrame(tick);
        };

        // Ініціалізація
        resize();
        setSceneProgress(0);
        frameId = requestAnimationFrame(tick);

        // Симуляція приховування завантажувача як в оригіналі
        if (loaderRef.current) {
            setTimeout(() => {
                if (loaderRef.current) {
                    loaderRef.current.style.opacity = '0';
                    setTimeout(() => { if (loaderRef.current) loaderRef.current.style.display = 'none'; }, 1000);
                }
            }, 600);
        }

        // -------------------------------------------------------------------
        // Очищення пам'яті React-компонента (Вкрай важливо)
        // -------------------------------------------------------------------
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
            geometry.dispose();
            bgGeo.dispose();
            material.dispose();
            bgMat.dispose();
            renderer.dispose();
        };
    }, []);

    function lerp(a, b, t) { return a + (b - a) * t; }

    return (
        <div style={{ backgroundColor: '#05060d', color: '#eef1fb', fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', cursor: 'none' }}>

            {/* Кастомний Лоадер з оригінального файлу */}
            <div ref={loaderRef} id="loader" style={loaderStyle}>
                <div style={loaderInnerStyle}>
                    <div className="loader-spinner" style={spinnerStyle}></div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#8a93b8', textTransform: 'uppercase' }}>Entering Gravity Field...</div>
                </div>
            </div>

            {/* 3D WebGL Canvas */}
            <canvas ref={canvasRef} style={canvasStyle} />

            {/* Гравітаційний Курсор */}
            <div ref={cursorRef} id="cursor-gravity" />
            <div style={vignetteStyle} />

            {/* Офіційні навігаційні елементи бренду */}
            <header style={headerStyle}>
                <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#cfe8ff', borderRadius: '50%', display: 'inline-block' }}></span>
                    SoundGravity
                </div>
                <nav style={{ display: 'flex', gap: '32px', fontSize: '13px', fontWeight: 500, color: '#8a93b8' }}>
                    <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Platform</a>
                    <a href="#universe" style={{ color: 'inherit', textDecoration: 'none' }}>Universe</a>
                    <a href="#manifesto" style={{ color: 'inherit', textDecoration: 'none' }}>Manifesto</a>
                </nav>
                <button style={navBtnStyle} onClick={() => alert('Redirecting to login...')}>Launch App</button>
            </header>

            {/* ПОУЛНОЦІННИЙ КОНТЕНТ УСІХ 6 СЦЕН З ОРИГІНАЛЬНОГО INDEX.HTML */}
            <main style={{ position: 'relative', zIndex: 10, pointerEvents: 'box-none' }}>

                {/* SCENE 1 — Hero */}
                <section className="scene" style={sceneStyle} data-align="left">
                    <div style={sceneNumStyle}>01 <span>/</span> 06</div>
                    <div style={sceneInnerStyle}>
                        <span style={eyebrowStyle}>INTRODUCING SOUNDGRAVITY</span>
                        <h1 style={sceneTitleStyle}>Feel the pull<br/>of music.</h1>
                        <p style={sceneSubStyle}>Абсолютно новий вимір прослуховування. SoundGravity перетворює звукові хвилі на фізичну силу, що об'єднує треки, людей та емоції в єдиний живий космос.</p>
                    </div>
                </section>

                {/* SCENE 2 — Rhythm Engine */}
                <section className="scene" style={{ ...sceneStyle, justifyContent: 'flex-end', paddingRight: '10%' }} data-align="right">
                    <div style={sceneNumStyle}>02 <span>/</span> 06</div>
                    <div style={sceneInnerStyle}>
                        <span style={eyebrowStyle}>THE RHYTHM ENGINE</span>
                        <h2 style={sceneTitleStyle}>Every beat<br/>creates motion.</h2>
                        <p style={sceneSubStyle}>Музика — це ритм. Наш рушій WebGL у реальному часі аналізує низькі частоти, змушуючи тисячі часток пульсувати та трансформуватися під кожен удар серця вашого треку.</p>
                    </div>
                </section>

                {/* SCENE 3 — Emotional Playlists */}
                <section className="scene" style={sceneStyle} data-align="left">
                    <div style={sceneNumStyle}>03 <span>/</span> 06</div>
                    <div style={sceneInnerStyle}>
                        <span style={eyebrowStyle}>EMOTIONAL GRAVITY</span>
                        <h2 style={sceneTitleStyle}>Playlists with<br/>their own orbit.</h2>
                        <p style={sceneSubStyle}>Почуття — це те, що нами керує. Створюйте власні світи: від енергійних сонячних спалахів до спокійних туманностей. Ваші плейлісти мають власну силу тяжіння.</p>
                    </div>
                </section>

                {/* SCENE 4 — Sharing / Connection */}
                <section className="scene" style={{ ...sceneStyle, justifyContent: 'flex-end', paddingRight: '10%' }} data-align="right">
                    <div style={sceneNumStyle}>04 <span>/</span> 06</div>
                    <div style={sceneInnerStyle}>
                        <span style={eyebrowStyle}>CONNECTED BY MUSIC</span>
                        <h2 style={sceneTitleStyle}>Share your vibe.<br/>Find your people.</h2>
                        <p style={sceneSubStyle}>Діліться своїм всесвітом. Кожен трек здатний зблизити мільйони. Будь-який поширений вами список відтворення стає яскравим вузлом у нашій музичній нейромережі.</p>
                    </div>
                </section>

                {/* SCENE 5 — AI Discovery */}
                <section className="scene" style={sceneStyle} data-align="left">
                    <div style={sceneNumStyle}>05 <span>/</span> 06</div>
                    <div style={sceneInnerStyle}>
                        <span style={eyebrowStyle}>AI DISCOVERY</span>
                        <h2 style={sceneTitleStyle}>Music that<br/>finds you.</h2>
                        <p style={sceneSubStyle}>SoundGravity вивчає ваші вподобання та відкриває нові горизонти звуку. Система групує аудіодоріжки, прокладає унікальні маршрути та пропонує ідеальні треки ще до того, як ви про них подумаєте.</p>
                    </div>
                </section>

                {/* SCENE 6 — Final Gravity */}
                <section className="scene" style={{ ...sceneStyle, justifyContent: 'center', textAlign: 'center', paddingBottom: '20vh' }} data-align="center">
                    <div style={sceneNumStyle}>06 <span>/</span> 06</div>
                    <div style={{ ...sceneInnerStyle, maxWidth: '640px', margin: '0 auto' }}>
                        <span style={eyebrowStyle}>FINAL GRAVITY</span>
                        <h2 style={sceneTitleStyle}>Become part of<br/>SoundGravity.</h2>
                        <p style={sceneSubStyle}>Створіть свій перший інтерактивний плейліст абсолютно безкоштовно. Космічний аудіовсесвіт продовжує рухатися навіть тоді, коли ви припиняєте скролити.</p>
                        <button className="cta-btn" style={ctaBtnStyle}>Почати слухати безкоштовно</button>
                    </div>
                </section>

            </main>

            {/* Копірайт футер */}
            <footer style={footerStyle}>
                <div>&copy; {new Date().getFullYear()} SOUNDGRAVITY. All orbits aligned.</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
                    <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                </div>
            </footer>
        </div>
    );
}

// -------------------------------------------------------------------
// Об'єкти інлайн-стилів для повної ізоляції в React
// -------------------------------------------------------------------
const canvasStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, display: 'block', pointerEvents: 'none' };
const vignetteStyle = { position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(5,6,13,0.8) 100%)' };

const loaderStyle = { position: 'fixed', inset: 0, background: '#05060d', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 1s ease' };
const loaderInnerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' };
const spinnerStyle = { width: '40px', height: '40px', border: '2px solid rgba(238,241,251,0.1)', borderTopColor: '#cfe8ff', borderRadius: '50%', animation: 'spin 1s linear infinite' };

const headerStyle = { position: 'fixed', top: 0, left: 0, width: '100%', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, pointerEvents: 'auto' };
const navBtnStyle = { background: '#eef1fb', color: '#05060d', border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', transition: 'transform 0.2s, background-color 0.2s' };

const sceneStyle = { minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', paddingLeft: '10%', position: 'relative', pointerEvents: 'box-none', boxSizing: 'border-box' };
const sceneInnerStyle = { maxWidth: '540px', position: 'relative', zIndex: 5, pointerEvents: 'auto' };
const sceneNumStyle = { fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#8a93b8', position: 'absolute', top: '12%', left: '10%', display: 'flex', gap: '6px' };
const eyebrowStyle = { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.25em', color: '#8a93b8', textTransform: 'uppercase', display: 'block', marginBottom: '16px' };
const sceneTitleStyle = { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px', color: '#eef1fb' };
const sceneSubStyle = { fontSize: '16px', lineHeight: 1.6, color: '#8a93b8', fontWeight: 400 };
const ctaBtnStyle = { marginTop: '32px', background: 'transparent', border: '1px solid rgba(238,241,251,0.2)', color: '#eef1fb', padding: '16px 32px', borderRadius: '30px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' };

const footerStyle = { width: '100%', padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#5b6788', fontFamily: "'JetBrains Mono', monospace", position: 'relative', zIndex: 10, borderTop: '1px solid rgba(238,241,251,0.03)' };