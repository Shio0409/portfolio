"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import type {
  BufferGeometry,
  CanvasTexture,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  SpriteMaterial,
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
  atmosphere: ShaderMaterial;
  halo: SpriteMaterial;
  ring?: ShaderMaterial;
  initialized: boolean;
};

const solarCenter = { x:-6.6, y:.05, z:-1.1 } as const;
const targetAngle = -.55;
const orbitProfiles = {
  desktop: { radiusX:9.9, radiusY:3.15, depth:6.4 },
  compact: { radiusX:5.75, radiusY:6.62, depth:3.84 },
} as const;
const opacityStops = [1, .72, .43, .21, .1, .06, 0, 0] as const;
const scaleStops = [2.75, 1.08, .82, .66, .58, .72, 2.8, 2.5] as const;

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

        const compact = window.innerWidth <= 760;
        const orbitProfile = compact ? orbitProfiles.compact : orbitProfiles.desktop;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(compact ? 50 : 43, 1, .1, 70);
        camera.position.set(0, .08, compact ? 16 : 10);
        camera.lookAt(compact ? -2.8 : -.25, -.1, 0);

        scene.add(new THREE.AmbientLight(0x8498cf, .42));
        const fillLight = new THREE.DirectionalLight(0x8ea8ff, .62);
        fillLight.position.set(4, 3, 8);
        scene.add(fillLight);
        const sunLight = new THREE.PointLight(0xffdc9b, 84, 36, 1.55);
        sunLight.position.set(solarCenter.x, solarCenter.y, solarCenter.z);
        scene.add(sunLight);

        const loader = new THREE.TextureLoader();
        const loadTexture = (url: string) => {
          const texture = loader.load(url);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, renderer?.capabilities.getMaxAnisotropy() ?? 1);
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          textures.push(texture);
          return texture;
        };

        const makeHologramMaterial = (color: string | number, opacity: number, density: number) => new THREE.ShaderMaterial({
          uniforms: {
            uColor:{ value:new THREE.Color(color) },
            uTime:{ value:0 },
            uOpacity:{ value:opacity },
            uDensity:{ value:density },
          },
          vertexShader:`
            varying vec3 vNormalView;
            varying vec3 vViewDirection;
            varying vec3 vObjectPosition;
            void main() {
              vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
              vNormalView = normalize(normalMatrix * normal);
              vViewDirection = normalize(-viewPosition.xyz);
              vObjectPosition = position;
              gl_Position = projectionMatrix * viewPosition;
            }
          `,
          fragmentShader:`
            uniform vec3 uColor;
            uniform float uTime;
            uniform float uOpacity;
            uniform float uDensity;
            varying vec3 vNormalView;
            varying vec3 vViewDirection;
            varying vec3 vObjectPosition;
            void main() {
              float rim = pow(1.0 - max(dot(vNormalView, vViewDirection), 0.0), 2.25);
              float wave = sin((vObjectPosition.y + uTime * 0.055) * uDensity);
              float scan = smoothstep(0.91, 1.0, wave);
              float latitude = smoothstep(0.965, 1.0, cos(vObjectPosition.y * uDensity * 0.24));
              float alpha = (rim * 0.72 + scan * 0.13 + latitude * 0.04) * uOpacity;
              vec3 light = uColor * (0.72 + rim * 0.86) + vec3(scan * 0.2);
              gl_FragColor = vec4(light, alpha);
            }
          `,
          transparent:true,
          depthWrite:false,
          blending:THREE.AdditiveBlending,
        });

        const orbitPoint = (theta: number, scale = 1) => new THREE.Vector3(
          solarCenter.x + Math.cos(theta) * orbitProfile.radiusX * scale,
          solarCenter.y + Math.sin(theta) * orbitProfile.radiusY * scale,
          solarCenter.z - Math.sin(theta) * orbitProfile.depth * scale,
        );

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
          return orbitPoint(theta);
        });
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color:0x758bcf, transparent:true, opacity:.19, depthWrite:false });
        scene.add(new THREE.LineLoop(orbitGeometry, orbitMaterial));
        geometries.push(orbitGeometry);
        materials.push(orbitMaterial);

        [1.09, .91].forEach((scale, index) => {
          const echoGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length:193 }, (_, pointIndex) => {
            const theta = targetAngle + pointIndex / 192 * Math.PI * 2;
            return orbitPoint(theta, scale);
          }));
          const echoMaterial = new THREE.LineBasicMaterial({ color:index ? 0x6c7ab4 : 0x8fa5ef, transparent:true, opacity:.055, depthWrite:false });
          scene.add(new THREE.LineLoop(echoGeometry, echoMaterial));
          geometries.push(echoGeometry);
          materials.push(echoMaterial);
        });

        const sunTexture = loadTexture("/planets/sun.jpg");
        const sunGeometry = new THREE.SphereGeometry(4.35, compact ? 40 : 64, compact ? 28 : 42);
        const sunGroup = new THREE.Group();
        sunGroup.position.set(solarCenter.x, solarCenter.y, solarCenter.z);
        scene.add(sunGroup);

        const sunMaterial = new THREE.MeshBasicMaterial({
          map:sunTexture,
          color:0xfff2d2,
          transparent:true,
          opacity:.56,
          depthWrite:true,
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.rotation.z = -.08;
        sunGroup.add(sun);

        const sunOccluderMaterial = new THREE.MeshBasicMaterial({ color:0x000000, colorWrite:false, depthWrite:true });
        const sunOccluder = new THREE.Mesh(sunGeometry, sunOccluderMaterial);
        sunOccluder.scale.setScalar(.985);
        sunGroup.add(sunOccluder);

        const sunGridMaterial = new THREE.MeshBasicMaterial({
          color:0xffc66d,
          wireframe:true,
          transparent:true,
          opacity:.12,
          depthWrite:false,
          blending:THREE.AdditiveBlending,
        });
        const sunGrid = new THREE.Mesh(sunGeometry, sunGridMaterial);
        sunGrid.scale.setScalar(1.018);
        sunGroup.add(sunGrid);

        const sunHologram = makeHologramMaterial(0xffbd64, .76, 92);
        const sunHologramMesh = new THREE.Mesh(sunGeometry, sunHologram);
        sunHologramMesh.scale.setScalar(1.035);
        sunGroup.add(sunHologramMesh);

        const sunRings = [
          { radius:4.72, rotation:[1.17, .16, -.22] as const, opacity:.3 },
          { radius:5.08, rotation:[1.34, -.2, .42] as const, opacity:.16 },
        ].map((ring) => {
          const geometry = new THREE.TorusGeometry(ring.radius, .014, 6, compact ? 96 : 160);
          const material = new THREE.MeshBasicMaterial({ color:0xffcf7d, transparent:true, opacity:ring.opacity, depthWrite:false, blending:THREE.AdditiveBlending });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.set(ring.rotation[0], ring.rotation[1], ring.rotation[2]);
          sunGroup.add(mesh);
          geometries.push(geometry);
          materials.push(material);
          return mesh;
        });

        geometries.push(sunGeometry);
        materials.push(sunMaterial, sunOccluderMaterial, sunGridMaterial, sunHologram);

        const glowCanvas = document.createElement("canvas");
        glowCanvas.width = 256;
        glowCanvas.height = 256;
        const glowContext = glowCanvas.getContext("2d");
        if (glowContext) {
          const gradient = glowContext.createRadialGradient(128, 128, 18, 128, 128, 126);
          gradient.addColorStop(0, "rgba(255,255,255,.92)");
          gradient.addColorStop(.2, "rgba(255,255,255,.28)");
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          glowContext.fillStyle = gradient;
          glowContext.fillRect(0, 0, 256, 256);
        }
        const glowTexture: CanvasTexture = new THREE.CanvasTexture(glowCanvas);
        const glowMaterial = new THREE.SpriteMaterial({ map:glowTexture, color:0xffa850, transparent:true, opacity:.38, depthWrite:false, blending:THREE.AdditiveBlending });
        const glow = new THREE.Sprite(glowMaterial);
        glow.position.set(solarCenter.x, solarCenter.y, solarCenter.z);
        glow.scale.set(13.4, 13.4, 1);
        scene.add(glow);
        textures.push(glowTexture);
        materials.push(glowMaterial);

        const sphereGeometry = new THREE.SphereGeometry(1, compact ? 40 : 64, compact ? 28 : 42);
        geometries.push(sphereGeometry);
        const planetNodes: PlanetNode[] = solarPlanets.map((planet) => {
          const group = new THREE.Group();
          group.rotation.z = planet.axialTilt;

          const surface = new THREE.MeshStandardMaterial({
            map:loadTexture(planet.texture),
            color:0xffffff,
            roughness:planet.roughness,
            metalness:0,
            emissive:new THREE.Color(planet.glow),
            emissiveIntensity:.025,
            transparent:true,
          });
          const globe = new THREE.Mesh(sphereGeometry, surface);
          group.add(globe);

          const grid = new THREE.MeshBasicMaterial({ color:planet.glow, wireframe:true, transparent:true, opacity:.04, depthWrite:false, blending:THREE.AdditiveBlending });
          const gridSphere = new THREE.Mesh(sphereGeometry, grid);
          gridSphere.scale.setScalar(1.024);
          group.add(gridSphere);

          const atmosphere = makeHologramMaterial(planet.glow, planet.atmosphere, 58);
          const atmosphereSphere = new THREE.Mesh(sphereGeometry, atmosphere);
          atmosphereSphere.scale.setScalar(1.065);
          group.add(atmosphereSphere);

          const halo = new THREE.SpriteMaterial({ map:glowTexture, color:planet.glow, transparent:true, opacity:.08, depthWrite:false, blending:THREE.AdditiveBlending });
          const haloSprite = new THREE.Sprite(halo);
          haloSprite.scale.set(2.9, 2.9, 1);
          group.add(haloSprite);

          let ring: ShaderMaterial | undefined;
          if (planet.ring) {
            const ringGeometry = new THREE.RingGeometry(planet.ring.inner, planet.ring.outer, 96);
            ring = new THREE.ShaderMaterial({
              uniforms:{
                uColor:{ value:new THREE.Color(planet.color) },
                uOpacity:{ value:planet.ring.opacity },
              },
              vertexShader:`
                varying float vRadius;
                void main() {
                  vRadius = length(position.xy);
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader:`
                uniform vec3 uColor;
                uniform float uOpacity;
                varying float vRadius;
                void main() {
                  float bands = 0.3 + 0.7 * pow(abs(sin(vRadius * 34.0)), 1.8);
                  float shimmer = 0.74 + 0.26 * sin(vRadius * 91.0);
                  gl_FragColor = vec4(uColor * (0.72 + shimmer * 0.34), uOpacity * bands * shimmer);
                }
              `,
              side:THREE.DoubleSide,
              transparent:true,
              depthWrite:false,
            });
            const ringMesh = new THREE.Mesh(ringGeometry, ring);
            ringMesh.rotation.x = Math.PI / 2;
            group.add(ringMesh);
            geometries.push(ringGeometry);
            materials.push(ring);
          }

          scene.add(group);
          materials.push(surface, grid, atmosphere, halo);
          return { group, globe, surface, grid, atmosphere, halo, ring, initialized:false };
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
              const desiredPosition = orbitPoint(theta);
              const desiredScale = solarPlanets[index].radius * interpolateStops(scaleStops, phase);
              const desiredOpacity = interpolateStops(opacityStops, phase);
              const phaseDistance = Math.min(phase, solarPlanets.length - phase);
              const targetProximity = Math.max(0, 1 - phaseDistance * 1.35);
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
              node.surface.emissiveIntensity = .025 + targetProximity * .065;
              node.grid.opacity = opacity * (.035 + targetProximity * .14);
              node.atmosphere.uniforms.uOpacity.value = opacity * solarPlanets[index].atmosphere * (.72 + targetProximity * .65);
              node.atmosphere.uniforms.uTime.value = reducedMotion ? 0 : now / 1000;
              node.halo.opacity = opacity * (.025 + targetProximity * .18);
              if (node.ring) node.ring.uniforms.uOpacity.value = opacity * (solarPlanets[index].ring?.opacity ?? .3);
              node.group.visible = opacity > .015;
              if (!reducedMotion) node.globe.rotation.y += delta * solarPlanets[index].spin;
            });
            sunHologram.uniforms.uTime.value = reducedMotion ? 0 : now / 1000;
            glowMaterial.opacity = .34 + Math.sin(now * .00062) * .055;
            if (!reducedMotion) {
              sun.rotation.y += delta * .014;
              sunGrid.rotation.y -= delta * .018;
              sunGrid.rotation.x += delta * .003;
              sunRings[0].rotation.z += delta * .012;
              sunRings[1].rotation.z -= delta * .008;
            }
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
      <p className="webgl-core-label" aria-hidden="true"><i />SOLAR CORE / 00</p>
      <div className="webgl-target-reticle" aria-hidden="true"><i /><span>TARGET / {String(activeIndex + 1).padStart(2, "0")}</span></div>
      <p className="webgl-render-state" aria-hidden="true">{status === "ready" ? "WEBGL / LIVE" : status === "fallback" ? "LITE / ACTIVE" : "SYSTEM / SYNC"}</p>
    </div>
  );
}
