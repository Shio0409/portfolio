"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import type {
  BufferGeometry,
  CanvasTexture,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Texture,
  WebGLRenderer,
} from "three";
import { solarPlanets } from "./solar-system-data";
import "./solar-system.css";

type SolarSystemWebGLProps = {
  activeIndex: number;
  dragOffset: number;
};

type PlanetNode = {
  group: Group;
  globe: Mesh;
  surface: MeshStandardMaterial;
  grid: MeshBasicMaterial;
  ring?: MeshBasicMaterial;
  initialized: boolean;
};

const targetAngle = -1.04;
const opacityStops = [1, .72, .43, .21, .1, .06, 0, 0] as const;
const scaleStops = [2.15, 1.08, .82, .66, .58, .72, 2.8, 2.5] as const;

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

function interpolateStops(stops: readonly number[], phase: number) {
  const normalized = wrap(phase, stops.length);
  const from = Math.floor(normalized);
  const amount = normalized - from;
  return stops[from] + (stops[(from + 1) % stops.length] - stops[from]) * amount;
}

function seededRandom(seed: { value: number }) {
  seed.value = (seed.value * 16807) % 2147483647;
  return (seed.value - 1) / 2147483646;
}

export default function SolarSystemWebGL({ activeIndex, dragOffset }: SolarSystemWebGLProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeIndex);
  const dragRef = useRef(dragOffset);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "fallback">("idle");

  useEffect(() => { activeRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { dragRef.current = dragOffset; }, [dragOffset]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || shouldLoad) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin:"720px 0px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!shouldLoad || !host || !canvas) return;

    let disposed = false;
    let frame = 0;
    let renderer: WebGLRenderer | null = null;
    let sceneVisible = true;
    const geometries: BufferGeometry[] = [];
    const materials: Material[] = [];
    const textures: Texture[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStatus("loading");

    const start = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:window.innerWidth > 760, powerPreference:"high-performance" });
        renderer.setClearColor(0x02040d, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 760 ? 1.25 : 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(43, 1, .1, 60);
        camera.position.set(0, .08, 10);
        camera.lookAt(-.25, -.1, 0);

        scene.add(new THREE.AmbientLight(0x6f82b7, .28));
        const sunLight = new THREE.PointLight(0xffe1a3, 92, 30, 1.7);
        sunLight.position.set(-5.25, .05, -.9);
        scene.add(sunLight);

        const loader = new THREE.TextureLoader();
        const loadTexture = (url: string) => {
          const texture = loader.load(url);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(4, renderer?.capabilities.getMaxAnisotropy() ?? 1);
          textures.push(texture);
          return texture;
        };

        const starSeed = { value:3749 };
        const starCount = window.innerWidth <= 760 ? 420 : 760;
        const starPositions = new Float32Array(starCount * 3);
        for (let index = 0; index < starCount; index += 1) {
          starPositions[index * 3] = (seededRandom(starSeed) - .5) * 27;
          starPositions[index * 3 + 1] = (seededRandom(starSeed) - .5) * 15;
          starPositions[index * 3 + 2] = -11 + seededRandom(starSeed) * 16;
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({ color:0xdce7ff, size:.025, transparent:true, opacity:.68, sizeAttenuation:true });
        scene.add(new THREE.Points(starGeometry, starMaterial));
        geometries.push(starGeometry);
        materials.push(starMaterial);

        const orbitPoints = Array.from({ length:193 }, (_, index) => {
          const theta = targetAngle + index / 192 * Math.PI * 2;
          return new THREE.Vector3(-.4 + Math.cos(theta) * 4.45, -.12 + Math.sin(theta) * 1.86, -Math.sin(theta) * 3.8);
        });
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color:0x758bcf, transparent:true, opacity:.19, depthWrite:false });
        scene.add(new THREE.LineLoop(orbitGeometry, orbitMaterial));
        geometries.push(orbitGeometry);
        materials.push(orbitMaterial);

        [1.09, .91].forEach((scale, index) => {
          const echoGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints.map((point) => point.clone().multiplyScalar(scale)));
          const echoMaterial = new THREE.LineBasicMaterial({ color:index ? 0x6c7ab4 : 0x8fa5ef, transparent:true, opacity:.055, depthWrite:false });
          scene.add(new THREE.LineLoop(echoGeometry, echoMaterial));
          geometries.push(echoGeometry);
          materials.push(echoMaterial);
        });

        const sunTexture = loadTexture("/planets/sun.jpg");
        const sunGeometry = new THREE.SphereGeometry(4.35, 48, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ map:sunTexture, color:0xffd99a });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.copy(sunLight.position);
        sun.rotation.z = -.08;
        scene.add(sun);
        geometries.push(sunGeometry);
        materials.push(sunMaterial);

        const glowCanvas = document.createElement("canvas");
        glowCanvas.width = 256;
        glowCanvas.height = 256;
        const glowContext = glowCanvas.getContext("2d");
        if (glowContext) {
          const gradient = glowContext.createRadialGradient(128, 128, 18, 128, 128, 126);
          gradient.addColorStop(0, "rgba(255,226,156,.9)");
          gradient.addColorStop(.22, "rgba(255,170,75,.35)");
          gradient.addColorStop(1, "rgba(255,120,40,0)");
          glowContext.fillStyle = gradient;
          glowContext.fillRect(0, 0, 256, 256);
        }
        const glowTexture: CanvasTexture = new THREE.CanvasTexture(glowCanvas);
        const glowMaterial = new THREE.SpriteMaterial({ map:glowTexture, transparent:true, opacity:.92, depthWrite:false, blending:THREE.AdditiveBlending });
        const glow = new THREE.Sprite(glowMaterial);
        glow.position.copy(sun.position);
        glow.scale.set(12.2, 12.2, 1);
        scene.add(glow);
        textures.push(glowTexture);
        materials.push(glowMaterial);

        const sphereGeometry = new THREE.SphereGeometry(1, window.innerWidth <= 760 ? 32 : 48, window.innerWidth <= 760 ? 22 : 32);
        geometries.push(sphereGeometry);
        const planetNodes: PlanetNode[] = solarPlanets.map((planet) => {
          const group = new THREE.Group();
          group.rotation.z = planet.axialTilt;

          const surface = new THREE.MeshStandardMaterial({
            map:loadTexture(planet.texture),
            color:planet.color,
            roughness:.91,
            metalness:0,
            transparent:true,
          });
          const globe = new THREE.Mesh(sphereGeometry, surface);
          group.add(globe);

          const grid = new THREE.MeshBasicMaterial({ color:planet.glow, wireframe:true, transparent:true, opacity:.055, depthWrite:false, blending:THREE.AdditiveBlending });
          const gridSphere = new THREE.Mesh(sphereGeometry, grid);
          gridSphere.scale.setScalar(1.018);
          group.add(gridSphere);

          let ring: MeshBasicMaterial | undefined;
          if (planet.ring) {
            const ringGeometry = new THREE.RingGeometry(planet.ring.inner, planet.ring.outer, 96);
            ring = new THREE.MeshBasicMaterial({ color:planet.color, side:THREE.DoubleSide, transparent:true, opacity:planet.ring.opacity, depthWrite:false });
            const ringMesh = new THREE.Mesh(ringGeometry, ring);
            ringMesh.rotation.x = Math.PI / 2;
            group.add(ringMesh);
            geometries.push(ringGeometry);
            materials.push(ring);
          }

          scene.add(group);
          materials.push(surface, grid);
          return { group, globe, surface, grid, ring, initialized:false };
        });

        const resize = () => {
          if (!renderer) return;
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        const visibilityObserver = new IntersectionObserver(([entry]) => { sceneVisible = entry.isIntersecting; }, { rootMargin:"180px" });
        visibilityObserver.observe(host);

        const onContextLost = (event: Event) => {
          event.preventDefault();
          setStatus("fallback");
          sceneVisible = false;
        };
        canvas.addEventListener("webglcontextlost", onContextLost);

        let previous = window.performance.now();
        const render = (now: number) => {
          if (disposed || !renderer) return;
          const delta = Math.min(.04, Math.max(.001, (now - previous) / 1000));
          previous = now;

          if (sceneVisible) {
            const dragPhase = dragRef.current / 45;
            planetNodes.forEach((node, index) => {
              const phase = wrap(index - activeRef.current + dragPhase, solarPlanets.length);
              const theta = targetAngle + phase / solarPlanets.length * Math.PI * 2;
              const desiredPosition = new THREE.Vector3(-.4 + Math.cos(theta) * 4.45, -.12 + Math.sin(theta) * 1.86, -Math.sin(theta) * 3.8);
              const desiredScale = solarPlanets[index].radius * interpolateStops(scaleStops, phase);
              const desiredOpacity = interpolateStops(opacityStops, phase);
              const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.6);

              if (!node.initialized) {
                node.group.position.copy(desiredPosition);
                node.group.scale.setScalar(desiredScale);
                node.initialized = true;
              } else {
                node.group.position.lerp(desiredPosition, blend);
                const scale = node.group.scale.x + (desiredScale - node.group.scale.x) * blend;
                node.group.scale.setScalar(scale);
              }

              const opacity = node.surface.opacity + (desiredOpacity - node.surface.opacity) * blend;
              node.surface.opacity = opacity;
              node.surface.depthWrite = opacity > .32;
              node.grid.opacity = opacity * (phase < .65 || phase > 7.35 ? .14 : .04);
              if (node.ring) node.ring.opacity = opacity * (solarPlanets[index].ring?.opacity ?? .3);
              node.group.visible = opacity > .015;
              if (!reducedMotion) node.globe.rotation.y += delta * solarPlanets[index].spin;
            });
            if (!reducedMotion) sun.rotation.y += delta * .012;
            renderer.render(scene, camera);
          }
          frame = window.requestAnimationFrame(render);
        };

        setStatus("ready");
        frame = window.requestAnimationFrame(render);

        return () => {
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          canvas.removeEventListener("webglcontextlost", onContextLost);
        };
      } catch {
        if (!disposed) setStatus("fallback");
        return undefined;
      }
    };

    let disconnectObservers: (() => void) | undefined;
    void start().then((cleanup) => { disconnectObservers = cleanup; });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      disconnectObservers?.();
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [shouldLoad]);

  const activePlanet = solarPlanets[activeIndex];
  return (
    <div className={`solar-webgl ${status === "ready" ? "is-ready" : "is-fallback"}`} data-render-status={status} ref={hostRef}>
      <canvas aria-hidden="true" ref={canvasRef} />
      <div className="solar-webgl-fallback" aria-hidden="true" style={{ "--fallback-planet":`url(${activePlanet.fallbackImage})`, "--fallback-glow":activePlanet.glow } as CSSProperties}><i /></div>
      <div className="webgl-target-reticle" aria-hidden="true"><i /><span>TARGET / {String(activeIndex + 1).padStart(2, "0")}</span></div>
      <p className="webgl-render-state" aria-hidden="true">{status === "ready" ? "WEBGL / LIVE" : status === "fallback" ? "LITE / ACTIVE" : "SYSTEM / SYNC"}</p>
    </div>
  );
}
