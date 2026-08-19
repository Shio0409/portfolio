"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  careerEvents,
  type CategoryId,
} from "./portfolio-data";

const sections = [
  { id: "top", number: "01", label: "TOP" },
  { id: "creation", number: "02", label: "CREATION" },
  { id: "career", number: "03", label: "CAREER" },
  { id: "future", number: "04", label: "FUTURE" },
] as const;

const solarPlanets = [
  { name: "MERCURY", jp: "水星", prefix: "問いを", description: "曖昧な課題を分解し、チームが動き出せる問いへ変換する。", color: "#a9a5a1", glow: "#cbc6bd", size: 42, image: "/planets/mercury.jpg", category: "system" as CategoryId },
  { name: "VENUS", jp: "金星", prefix: "関係を", description: "立場の違いを翻訳し、人と人が協働できる接点を設計する。", color: "#efb56f", glow: "#ff8d47", size: 58, image: "/planets/venus.jpg", category: "community" as CategoryId },
  { name: "EARTH", jp: "地球", prefix: "体験を", description: "目的・導線・感情の変化をつなぎ、記憶に残る体験を組み立てる。", color: "#5ee9ff", glow: "#3156ff", size: 62, image: "/planets/earth.jpg", category: "world" as CategoryId },
  { name: "MARS", jp: "火星", prefix: "遊びを", description: "触れたくなる反応とルールを重ね、直感的な楽しさを実装する。", color: "#f17655", glow: "#d83c2e", size: 54, image: "/planets/mars.jpg", category: "play" as CategoryId },
  { name: "JUPITER", jp: "木星", prefix: "世界を", description: "空間・物語・行動を束ね、訪れる理由のある世界を立ち上げる。", color: "#e4b48c", glow: "#c16e55", size: 112, image: "/planets/jupiter.jpg", category: "world" as CategoryId },
  { name: "SATURN", jp: "土星", prefix: "仕組みを", description: "複雑な条件を整理し、アイデアが継続して届く構造へ変える。", color: "#e8d394", glow: "#d49b55", size: 100, image: "/planets/saturn.jpg", category: "system" as CategoryId },
  { name: "URANUS", jp: "天王星", prefix: "文化を", description: "参加と制作が循環し、関わる人が育てていける場をつくる。", color: "#8ce7e8", glow: "#4eb8ca", size: 82, image: "/planets/uranus.webp", category: "community" as CategoryId },
  { name: "NEPTUNE", jp: "海王星", prefix: "未来を", description: "まだ名前のない可能性を試作し、次の現実へつながる入口をつくる。", color: "#6a79ff", glow: "#3447e2", size: 78, image: "/planets/neptune.webp", category: "play" as CategoryId },
] as const;

const orbitGeometry = { centerX: 0, centerY: 50, radiusX: 86, radiusY: 40 } as const;

const orbitPass = [
  { angle: 52.8, scale: 4.8, opacity: 1, blur: 0, z: 1180, label: 1 },
  { angle: 0, scale: 0.62, opacity: 0.76, blur: 0.8, z: 630, label: 0.42 },
  { angle: -30, scale: 0.2, opacity: 0.42, blur: 2.4, z: 320, label: 0.12 },
  { angle: -58, scale: 0.09, opacity: 0.22, blur: 4.2, z: 160, label: 0 },
  { angle: -88, scale: 0.04, opacity: 0.08, blur: 7, z: 80, label: 0 },
  { angle: -130, scale: 0.02, opacity: 0, blur: 9, z: 30, label: 0 },
  { angle: -240, scale: 9, opacity: 0, blur: 1.8, z: 1700, label: 0 },
  { angle: -288, scale: 7.2, opacity: 0, blur: 0.2, z: 1500, label: 0 },
] as const;

const heroShots = [
  { id: "01", title: "VIRTUAL WORLD", image: "/planets/earth.jpg", accent: "#5ee9ff" },
  { id: "02", title: "SHARED EXPERIENCE", image: "/planets/jupiter.jpg", accent: "#e4b48c" },
  { id: "03", title: "NEW REALITY", image: "/planets/neptune.webp", accent: "#6a79ff" },
] as const;

const futurePrinciples = [
  { jp: "観察する", en: "UNDERSTAND", description: "ユーザー、事業、技術の現実を見つめ、曖昧な課題の輪郭を捉える。" },
  { jp: "つなぐ", en: "ALIGN", description: "立場の違いを翻訳し、人・優先順位・判断をひとつの方向へそろえる。" },
  { jp: "届ける", en: "DELIVER", description: "構想を体験へ変え、反応から学びながら継続的に価値を更新する。" },
] as const;

const contactChannels = [
  { label: "YOUTUBE", value: "@sio_manyan", href: "https://www.youtube.com/@sio_manyan", external: true },
  { label: "X", value: "@taque_0409", href: "https://x.com/taque_0409", external: true },
  { label: "EMAIL", value: "solt.0409@gmail.com", href: "mailto:solt.0409@gmail.com", external: false },
  { label: "DISCORD", value: "sio0409", href: null, external: false },
  { label: "BOOTH", value: "sio-shop", href: "https://sio-shop.booth.pm/", external: true },
  { label: "VRCHAT", value: "USER PROFILE", href: "https://vrchat.com/home/user/usr_8707d220-1408-4a8c-b25c-6a3b14a4c710", external: true },
] as const;

type LoaderState = "visible" | "leaving" | "hidden";

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function interpolateOrbitPass(phase: number) {
  const normalized = wrapIndex(phase, orbitPass.length);
  const fromIndex = Math.floor(normalized);
  const toIndex = (fromIndex + 1) % orbitPass.length;
  const progress = normalized - fromIndex;
  const from = orbitPass[fromIndex];
  const to = orbitPass[toIndex];
  const mix = (start: number, end: number) => start + (end - start) * progress;
  const toAngle = toIndex === 0 ? to.angle - 360 : to.angle;
  const angle = mix(from.angle, toAngle) * Math.PI / 180;

  return {
    x: orbitGeometry.centerX + Math.cos(angle) * orbitGeometry.radiusX,
    y: orbitGeometry.centerY + Math.sin(angle) * orbitGeometry.radiusY,
    scale: mix(from.scale, to.scale),
    opacity: mix(from.opacity, to.opacity), blur: mix(from.blur, to.blur),
    z: mix(from.z, to.z), label: mix(from.label, to.label),
  };
}

export default function PortfolioExperience() {
  const [loaderState, setLoaderState] = useState<LoaderState>("visible");
  const [activeSection, setActiveSection] = useState("top");
  const [activeSolar, setActiveSolar] = useState(2);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [makerDocked, setMakerDocked] = useState(false);
  const [careerProgress, setCareerProgress] = useState(0);
  const [careerCharacterVisible, setCareerCharacterVisible] = useState(false);
  const creationRef = useRef<HTMLElement>(null);
  const careerHeadingRef = useRef<HTMLHeadingElement>(null);
  const careerMapRef = useRef<HTMLDivElement>(null);
  const futureRef = useRef<HTMLElement>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, startY: 0, moved: false });

  const dismissIntro = useCallback(() => {
    setLoaderState((current) => {
      if (current !== "visible") return current;
      window.setTimeout(() => setLoaderState("hidden"), 520);
      return "leaving";
    });
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateMakerDock = () => {
      const creation = creationRef.current;
      if (!creation) return;
      setMakerDocked(creation.getBoundingClientRect().top <= 1);
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateMakerDock);
    };
    updateMakerDock();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(dismissIntro, reducedMotion ? 500 : 2100);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") dismissIntro();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dismissIntro]);

  useEffect(() => {
    document.documentElement.classList.toggle("intro-open", loaderState !== "hidden");
    return () => document.documentElement.classList.remove("intro-open");
  }, [loaderState]);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -48%", threshold: [0, 0.25, 0.55] },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    });
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      const map = careerMapRef.current;
      const heading = careerHeadingRef.current;
      const future = futureRef.current;
      if (!map || !heading || !future) return;
      const viewportHeight = window.innerHeight;
      const mapRect = map.getBoundingClientRect();
      const travel = Math.max(mapRect.height - viewportHeight * 0.5, 1);
      const next = Math.min(1, Math.max(0, (viewportHeight * 0.5 - mapRect.top) / travel));
      const headingHasArrived = heading.getBoundingClientRect().top <= viewportHeight * 0.22;
      const futureHasArrived = future.getBoundingClientRect().top <= viewportHeight * 0.92;
      setCareerProgress(Number(next.toFixed(3)));
      setCareerCharacterVisible(headingHasArrived && !futureHasArrived);
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const selectSolarPlanet = (index: number) => {
    const next = wrapIndex(index, solarPlanets.length);
    setActiveSolar(next);
    setDragOffset(0);
  };

  const handleOrbitPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handleOrbitPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 7) dragRef.current.moved = true;
    setDragOffset(Math.max(-150, Math.min(150, deltaX * 0.32 + deltaY * 0.1)));
  };

  const resetOrbitPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDragging) return;
    event.currentTarget.style.setProperty("--pointer-x", "72%");
    event.currentTarget.style.setProperty("--pointer-y", "58%");
  };

  const finishOrbitDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const steps = Math.round(dragOffset / 45);
    const next = wrapIndex(activeSolar - steps, solarPlanets.length);
    setActiveSolar(next);
    setDragOffset(0);
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const navProgress = Math.max(0, sections.findIndex((section) => section.id === activeSection) / (sections.length - 1));
  const makerVisible = !makerDocked && (activeSection === "top" || activeSection === "creation");
  const makerInCreationPose = activeSection === "creation" || makerDocked;
  const activePlanet = solarPlanets[activeSolar];

  return (
    <>
      {loaderState !== "hidden" && (
        <div className={`intro-loader ${loaderState === "leaving" ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="ポートフォリオを読み込んでいます">
          <button className="loader-skip-surface" type="button" onClick={dismissIntro} aria-label="ローディング演出をスキップ" />
          <div className="loader-topline"><span>MASATAKA SHIOZAWA / PORTFOLIO</span><span>METAVERSE LOG — 2026</span></div>
          <div className="loader-orbit" aria-hidden="true"><i /><i /><i /><span>S</span></div>
          <div className="loader-center"><p>ESTABLISHING CONNECTION</p><div className="loader-word"><span>U</span><span>N</span><span>I</span><span>V</span><span>E</span><span>R</span><span>S</span><span>E</span></div></div>
          <div className="loader-bottom"><span>CLICK / TAP / ENTER TO SKIP</span><div className="loader-progress"><i /></div><span>PRIVATE / NOINDEX</span></div>
        </div>
      )}

      <a className="skip-link" href="#main-content">本文へスキップ</a>

      <main id="main-content" aria-hidden={loaderState !== "hidden"}>
        <div
          className={`fixed-making-statement ${makerVisible ? "" : "is-hidden"} ${makerInCreationPose ? "is-creation" : ""}`}
          style={{ "--making-accent": activePlanet.color } as CSSProperties}
          aria-hidden={makerDocked}
        >
          <p className={`fixed-making-prefix ${activeSection === "creation" ? "is-visible" : ""}`}>{activePlanet.prefix}</p>
          <h1 id="hero-title" className="fixed-maker-word">つくる。</h1>
        </div>

        <div
          className={`career-character career-character-overlay ${careerCharacterVisible ? "is-visible" : ""}`}
          aria-hidden="true"
        ><span className="traveler-core" /><span className="traveler-ring" /><b>MS</b></div>

        <section className="cosmic-hero page-section" id="top" aria-labelledby="hero-title">
          <div className="cosmic-sky" aria-hidden="true"><i /><i /><i /><i /></div>
          <header className="cosmic-header">
            <button className="cosmic-wordmark" type="button" onClick={() => scrollToSection("top")}><span className="cosmic-mark">S</span><span>MASATAKA SHIOZAWA</span></button>
            <p>PROJECT MANAGER / DIRECTOR</p><p>PRIVATE APPLICATION / 2026</p>
          </header>
          <div className="cosmic-reel" aria-label="制作世界観ショーリール">
            {heroShots.map((shot, index) => (
              <figure
                className={`cosmic-shot shot-${index + 1}`}
                key={shot.id}
                style={{ "--shot-image": `url(${shot.image})`, "--shot-accent": shot.accent } as CSSProperties}
              >
                <div className="shot-fallback" aria-hidden="true"><span className="shot-planet" /><span className="shot-horizon" /></div>
                <figcaption><span>{shot.id} / 03</span><span>{shot.title}</span></figcaption>
              </figure>
            ))}
            <div className="reel-reticle" aria-hidden="true"><i /><i /><span>OBSERVATION POINT</span></div>
            <div className="reel-progress" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="cosmic-intro"><p className="cosmic-index"><span>01</span> / TOP</p><p className="cosmic-manifesto">境界を越えて、まだ名前のない体験へ。<br />人と世界が出会う瞬間を設計する。</p></div>
          <button className="cosmic-scroll" type="button" onClick={() => scrollToSection("creation")}><span>ENTER ORBIT</span><i aria-hidden="true" /></button>
        </section>

        <section className="creation-section page-section" id="creation" ref={creationRef} aria-labelledby="creation-title" style={{ "--category-accent": activePlanet.color } as CSSProperties}>
          <div className="creation-stars" aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => (
              <i
                key={index}
                style={{
                  "--star-x": `${(index * 37 + 11) % 100}%`,
                  "--star-y": `${(index * 61 + 7) % 100}%`,
                  "--star-size": `${1 + (index % 4) * 0.55}px`,
                  "--star-color": index % 11 === 0 ? "#ff9bdd" : index % 7 === 0 ? "#83b8ff" : "#ffffff",
                  "--star-delay": `${-(index % 9) * 0.47}s`,
                  "--star-duration": `${2.3 + (index % 6) * 0.48}s`,
                } as CSSProperties}
              />
            ))}
          </div>
          <header className="section-header section-header-light"><p id="creation-title"><span>02</span> / CREATION</p><p>INTERACTIVE SOLAR FIELD</p></header>

          <div className="solar-layout">
            <div
              className={`solar-stage ${isDragging ? "is-dragging" : ""}`}
              role="slider"
              tabIndex={0}
              aria-label="8つの惑星。ドラッグ、スワイプ、または左右キーで選択できます"
              aria-valuemin={1}
              aria-valuemax={solarPlanets.length}
              aria-valuenow={activeSolar + 1}
              aria-valuetext={`${activePlanet.jp} ${activePlanet.prefix}つくる。`}
              aria-orientation="horizontal"
              onPointerDown={handleOrbitPointerDown}
              onPointerMove={handleOrbitPointerMove}
              onPointerUp={finishOrbitDrag}
              onPointerCancel={finishOrbitDrag}
              onPointerLeave={resetOrbitPointer}
              onKeyDown={(event) => {
                if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) event.preventDefault();
                if (event.key === "ArrowRight" || event.key === "ArrowDown") selectSolarPlanet(activeSolar + 1);
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") selectSolarPlanet(activeSolar - 1);
              }}
            >
              <div className="solar-orbits" aria-hidden="true">
                {solarPlanets.map((planet, index) => (
                  <i key={planet.name} style={{ "--orbit-index": index } as CSSProperties} />
                ))}
              </div>
              <div className="solar-axis" aria-hidden="true"><i /><span>CREATION AXIS</span></div>
              <div className="solar-sun" aria-hidden="true"><i /><span>SUN / 00</span></div>
              {solarPlanets.map((planet, index) => {
                const phase = wrapIndex(index - activeSolar + dragOffset / 45, solarPlanets.length);
                const pass = interpolateOrbitPass(phase);
                const isActive = index === activeSolar && Math.abs(dragOffset) < 14;
                const isBehindSun = pass.z < 560;
                const isOutgoing = phase > 5;
                return (
                  <button
                    className={`solar-planet planet-${index + 1} ${isBehindSun ? "is-behind-sun" : "is-in-front"} ${isOutgoing ? "is-outgoing" : ""} ${isActive ? "is-active" : ""}`}
                    type="button"
                    key={planet.name}
                    aria-label={`${planet.jp}・${planet.prefix}つくる。を表示`}
                    aria-pressed={isActive}
                    onClick={() => { if (!dragRef.current.moved) selectSolarPlanet(index); }}
                    style={{
                      "--planet-x": `${pass.x}%`, "--planet-y": `${pass.y}%`, "--planet-scale": pass.scale,
                      "--planet-label-scale": Math.min(1, 1 / pass.scale), "--planet-label-opacity": pass.label,
                      "--planet-opacity": pass.opacity, "--planet-color": planet.color,
                      "--planet-glow": planet.glow, "--planet-z": Math.round(pass.z),
                      "--planet-size": `${planet.size}px`, "--planet-blur": `${pass.blur}px`,
                      "--planet-image": `url(${planet.image})`, "--planet-rotation": `${48 + index * 6}s`,
                    } as CSSProperties}
                  >
                    <i className="planet-surface" aria-hidden="true" />
                    <span>{planet.jp} / {planet.name}</span><b>{planet.prefix}</b>
                  </button>
                );
              })}
              <div className="solar-camera" aria-hidden="true"><i /><span>FRONT / ALIGN</span></div>
              <p className="solar-source-credit">OBSERVATION IMAGERY / NASA・JPL・GSFC</p>
            </div>

            <article className="solar-transmission" key={activeSolar} aria-live="polite">
              <div className="transmission-meta"><span>{String(activeSolar + 1).padStart(2, "0")} / 08</span><span>{activePlanet.jp} / {activePlanet.name}</span></div>
              <p className="transmission-signal"><i /> ORBIT ALIGNED</p>
              <div className={`transmission-docked-title ${makerDocked ? "is-visible" : ""}`} aria-hidden="true">
                <p>{activePlanet.prefix}</p><strong>つくる。</strong>
              </div>
              <p>{activePlanet.description}</p>
              <div className="planet-selector" aria-label="惑星を直接選択">
                {solarPlanets.map((planet, index) => (
                  <button
                    type="button"
                    key={planet.name}
                    className={index === activeSolar ? "is-active" : ""}
                    onClick={() => selectSolarPlanet(index)}
                    aria-label={`${planet.jp}を選択`}
                    aria-pressed={index === activeSolar}
                  ><span>{String(index + 1).padStart(2, "0")}</span></button>
                ))}
              </div>
              <div className="transmission-unlock"><span>CONNECTED FIELD</span><strong>{activePlanet.category.toUpperCase()}</strong></div>
              <div className="orbit-controls"><button type="button" onClick={() => selectSolarPlanet(activeSolar - 1)} aria-label="前の惑星">←</button><span>{String(activeSolar + 1).padStart(2, "0")} / 08</span><button type="button" onClick={() => selectSolarPlanet(activeSolar + 1)} aria-label="次の惑星">→</button></div>
            </article>
          </div>

        </section>

        <section className="career-section page-section" id="career" aria-labelledby="career-title">
          <div className="career-stars" aria-hidden="true" />
          <header className="section-header section-header-light" data-reveal><p><span>03</span> / CAREER</p><p>EXPERIENCE LOG</p></header>
          <div className="career-header">
            <h2 id="career-title" ref={careerHeadingRef} data-reveal>経験は、次の判断を<br /><span>つくっていく。</span></h2>
            <p data-reveal>心理学、教育、教室運営、事業づくり。人と組織の変化に向き合った経験がつながり、現在のProject Manager / Directorへ。</p>
          </div>
          <div className="career-map" ref={careerMapRef} style={{ "--career-progress": careerProgress } as CSSProperties}>
            <div className="career-track" aria-hidden="true">
              <i />
            </div>
            <ol className="career-events">
              {careerEvents.map((event, index) => (
                <li key={`${event.title}-${index}`} data-reveal>
                  <article>
                    <div className="career-event-meta"><span>{event.year}</span><span>{event.type}</span></div>
                    <h3>{event.title}</h3>
                    {event.role && <p className="career-role">{event.role}</p>}
                    <p className="career-description">{event.description}</p>
                    {event.highlights && (
                      <ul className="career-highlights" aria-label={`${event.title}の実績`}>
                        {event.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                      </ul>
                    )}
                    <div className="unlock"><i /> CAPABILITY / {event.unlocked}</div>
                  </article>
                  <span className="career-node" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="future-section page-section" id="future" ref={futureRef} aria-labelledby="future-title">
          <div className="future-nebula" aria-hidden="true" />
          <header className="section-header section-header-light" data-reveal><p><span>04</span> / FUTURE</p><p>THE NEXT TRANSMISSION</p></header>
          <div className="future-heading" data-reveal><p>NEXT ORBIT / 2026—</p><h2 id="future-title">完成の先を、<br /><span>つくり続ける。</span></h2></div>
          <div className="future-system" data-reveal>
            <article className="future-vector">
              <div className="future-card-top"><span>01 / CURRENT VECTOR</span><span>METAVERSE</span></div>
              <p className="future-status"><i /> ROLE / PROJECT MANAGER・DIRECTOR</p>
              <h3>人と判断をつなぎ、<br />体験を前へ進める。</h3>
              <p>心理学、教育、教室運営、事業づくりで培った視点を、メタバースの体験設計へ。目的と現場の間に立ち、チームが動ける構造をつくります。</p>
            </article>
            <ol className="future-principles" aria-label="プロジェクトを前へ進める3つの原則">
              {futurePrinciples.map((principle, index) => (
                <li key={principle.en}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>{principle.en}</small><strong>{principle.jp}</strong><p>{principle.description}</p></div>
                  <i aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
          <div className="vision-block" data-reveal>
            <div className="vision-copy"><span>02 / LONG-TERM VISION</span><h3>学びが、次の創作を<br />生み出す宇宙。</h3><p>Tutorial Worldを入口に、学び、出会い、制作、発表、支援が循環する。初心者がいつか、次の初心者を支える側へ。</p></div>
            <ol className="vision-cycle" aria-label="コミュニティ構想の循環">{["TUTORIAL WORLD", "STUDY EVENT", "COMMUNITY", "CREATION", "EXHIBITION", "SUPPORT"].map((label, index) => <li key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><i aria-hidden="true" /></li>)}</ol>
          </div>
          <div className="contact-block" data-reveal>
            <p>CONTACT / LINKS</p><h3>次の世界を、<br />一緒に。</h3><p className="contact-note">プロジェクトや制作のご相談は、メールまたは各プラットフォームからご連絡ください。</p>
            <div className="contact-links">
              {contactChannels.map((channel) => channel.href ? (
                <a className="contact-link" key={channel.label} href={channel.href} target={channel.external ? "_blank" : undefined} rel={channel.external ? "noopener noreferrer" : undefined}>
                  <span>{channel.label}</span><strong>{channel.value}</strong><i aria-hidden="true">↗</i>
                </a>
              ) : (
                <div className="contact-link is-static" key={channel.label}>
                  <span>{channel.label}</span><strong>{channel.value}</strong><i>ID</i>
                </div>
              ))}
            </div>
          </div>
          <footer className="site-footer"><span>塩澤 正高 / MASATAKA SHIOZAWA</span><button type="button" onClick={() => scrollToSection("top")}>BACK TO TOP ↑</button><span>PROJECT MANAGER / DIRECTOR</span></footer>
        </section>
      </main>

      <aside className="side-navigation" aria-label="セクションナビゲーション" style={{ "--nav-progress": navProgress } as CSSProperties}>
        <span className="nav-rail" aria-hidden="true"><i /></span>
        {sections.map((section) => <button key={section.id} type="button" className={activeSection === section.id ? "is-active" : ""} aria-current={activeSection === section.id ? "true" : undefined} aria-label={`${section.number} ${section.label}へ移動`} onClick={() => scrollToSection(section.id)}><span>{section.number} {section.label}</span><i /></button>)}
      </aside>

    </>
  );
}
