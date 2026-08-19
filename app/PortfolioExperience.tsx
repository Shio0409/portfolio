"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  careerEvents,
  categories,
  type CategoryId,
  processSteps,
  type Project,
  projects,
} from "./portfolio-data";

const sections = [
  { id: "top", number: "01", label: "TOP" },
  { id: "creation", number: "02", label: "CREATION" },
  { id: "career", number: "03", label: "CAREER" },
  { id: "future", number: "04", label: "FUTURE" },
] as const;

const solarPlanets = [
  { name: "MERCURY", jp: "水星", prefix: "問いを", color: "#a9a5a1", glow: "#cbc6bd", size: 42, image: "/planets/mercury.jpg", category: "system" as CategoryId },
  { name: "VENUS", jp: "金星", prefix: "関係を", color: "#efb56f", glow: "#ff8d47", size: 58, image: "/planets/venus.jpg", category: "community" as CategoryId },
  { name: "EARTH", jp: "地球", prefix: "体験を", color: "#5ee9ff", glow: "#3156ff", size: 62, image: "/planets/earth.jpg", category: "world" as CategoryId },
  { name: "MARS", jp: "火星", prefix: "遊びを", color: "#f17655", glow: "#d83c2e", size: 54, image: "/planets/mars.jpg", category: "play" as CategoryId },
  { name: "JUPITER", jp: "木星", prefix: "世界を", color: "#e4b48c", glow: "#c16e55", size: 112, image: "/planets/jupiter.jpg", category: "world" as CategoryId },
  { name: "SATURN", jp: "土星", prefix: "仕組みを", color: "#e8d394", glow: "#d49b55", size: 100, image: "/planets/saturn.jpg", category: "system" as CategoryId },
  { name: "URANUS", jp: "天王星", prefix: "文化を", color: "#8ce7e8", glow: "#4eb8ca", size: 82, image: "/planets/uranus.webp", category: "community" as CategoryId },
  { name: "NEPTUNE", jp: "海王星", prefix: "未来を", color: "#6a79ff", glow: "#3447e2", size: 78, image: "/planets/neptune.webp", category: "play" as CategoryId },
] as const;

const orbitGeometry = { centerX: 0, centerY: 50, radiusX: 96, radiusY: 32.5 } as const;

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
  { id: "01", title: "VIRTUAL WORLD", src: "/media/hero-world.mp4" },
  { id: "02", title: "SHARED EXPERIENCE", src: "/media/hero-experience.mp4" },
  { id: "03", title: "NEW REALITY", src: "/media/hero-reality.mp4" },
] as const;

type LoaderState = "visible" | "leaving" | "hidden";

function ProjectVisual({ project }: { project: Project }) {
  return (
    <div className={`project-visual visual-${project.visual}`} aria-hidden="true">
      <span className="visual-index">{project.number}</span>
      <div className="visual-stage">
        {Array.from({ length: 10 }, (_, index) => (
          <i key={index} style={{ "--i": index } as CSSProperties} />
        ))}
      </div>
      <span className="visual-caption">MEDIA PLACEHOLDER / 16:10</span>
    </div>
  );
}

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
  const [activeCategory, setActiveCategory] = useState<CategoryId>("world");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSolar, setActiveSolar] = useState(2);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [careerProgress, setCareerProgress] = useState(0);
  const [careerCharacterY, setCareerCharacterY] = useState(-100);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const careerRef = useRef<HTMLElement>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, startY: 0, moved: false });

  const activeCategoryData = useMemo(
    () => categories.find((category) => category.id === activeCategory) ?? categories[0],
    [activeCategory],
  );

  const visibleProjects = useMemo(
    () => projects.filter((project) => project.category === activeCategory),
    [activeCategory],
  );

  const dismissIntro = useCallback(() => {
    setLoaderState((current) => {
      if (current !== "visible") return current;
      window.setTimeout(() => setLoaderState("hidden"), 520);
      return "leaving";
    });
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
    if (!selectedProject) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.documentElement.classList.add("dialog-open");
    return () => document.documentElement.classList.remove("dialog-open");
  }, [selectedProject]);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      const section = careerRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight * 0.45, 1);
      const next = Math.min(1, Math.max(0, (window.innerHeight * 0.58 - rect.top) / travel));
      const viewportCenter = window.innerHeight * 0.5;
      const entryEnd = 0.14;
      const exitStart = 0.86;
      let characterY = viewportCenter;

      if (next < entryEnd) {
        const entry = next / entryEnd;
        const easedEntry = 1 - Math.pow(1 - entry, 3);
        characterY = -100 + (viewportCenter + 100) * easedEntry;
      } else if (next > exitStart) {
        const exit = (next - exitStart) / (1 - exitStart);
        const easedExit = Math.pow(exit, 3);
        characterY = viewportCenter + (viewportCenter + 100) * easedExit;
      }

      setCareerProgress(Number(next.toFixed(3)));
      setCareerCharacterY(Math.round(characterY));
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

  const openProject = (project: Project, event: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget;
    setSelectedProject(project);
  };

  const closeProject = () => dialogRef.current?.close();

  const handleDialogClosed = () => {
    setSelectedProject(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  const selectSolarPlanet = (index: number) => {
    const next = wrapIndex(index, solarPlanets.length);
    setActiveSolar(next);
    setActiveCategory(solarPlanets[next].category);
    setDragOffset(0);
  };

  const handleOrbitPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handleOrbitPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 7) dragRef.current.moved = true;
    setDragOffset(Math.max(-150, Math.min(150, deltaX * 0.32 + deltaY * 0.1)));
  };

  const finishOrbitDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const steps = Math.round(dragOffset / 45);
    const next = wrapIndex(activeSolar - steps, solarPlanets.length);
    setActiveSolar(next);
    setActiveCategory(solarPlanets[next].category);
    setDragOffset(0);
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const navProgress = Math.max(0, sections.findIndex((section) => section.id === activeSection) / (sections.length - 1));
  const makerVisible = activeSection === "top" || activeSection === "creation";
  const activePlanet = solarPlanets[activeSolar];
  const activeSolarProject = projects[activeSolar];

  return (
    <>
      {loaderState !== "hidden" && (
        <div className={`intro-loader ${loaderState === "leaving" ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="ポートフォリオを読み込んでいます">
          <button className="loader-skip-surface" type="button" onClick={dismissIntro} aria-label="ローディング演出をスキップ" />
          <div className="loader-topline"><span>[NAME] / PORTFOLIO</span><span>METAVERSE LOG — 2026</span></div>
          <div className="loader-orbit" aria-hidden="true"><i /><i /><i /><span>N</span></div>
          <div className="loader-center"><p>ESTABLISHING CONNECTION</p><div className="loader-word"><span>U</span><span>N</span><span>I</span><span>V</span><span>E</span><span>R</span><span>S</span><span>E</span></div></div>
          <div className="loader-bottom"><span>CLICK / TAP / ENTER TO SKIP</span><div className="loader-progress"><i /></div><span>01 — 100</span></div>
        </div>
      )}

      <a className="skip-link" href="#main-content">本文へスキップ</a>

      <main id="main-content" aria-hidden={loaderState !== "hidden"}>
        <div
          className={`fixed-making-statement ${makerVisible ? "" : "is-hidden"} ${activeSection === "creation" ? "is-creation" : ""}`}
          style={{ "--making-accent": activePlanet.color } as CSSProperties}
        >
          <p className={`fixed-making-prefix ${activeSection === "creation" ? "is-visible" : ""}`}>{activePlanet.prefix}</p>
          <h1 id="hero-title" className="fixed-maker-word">つくる。</h1>
        </div>

        <div
          className={`career-character career-character-overlay ${careerProgress > 0 && careerProgress < 1 ? "is-visible" : ""}`}
          style={{ "--career-character-y": `${careerCharacterY}px` } as CSSProperties}
          aria-hidden="true"
        ><span /><span /><b>YOU</b></div>

        <section className="cosmic-hero page-section" id="top" aria-labelledby="hero-title">
          <div className="cosmic-sky" aria-hidden="true"><i /><i /><i /><i /></div>
          <header className="cosmic-header">
            <button className="cosmic-wordmark" type="button" onClick={() => scrollToSection("top")}><span className="cosmic-mark">N</span><span>[NAME]</span></button>
            <p>PROJECT MANAGER / DIRECTOR</p><p>PORTFOLIO 2026 — TOKYO</p>
          </header>
          <div className="cosmic-reel" aria-label="制作映像ショーリール">
            {heroShots.map((shot, index) => (
              <figure className={`cosmic-shot shot-${index + 1}`} key={shot.id}>
                <video autoPlay muted loop playsInline preload="metadata" aria-label={shot.title}><source src={shot.src} type="video/mp4" /></video>
                <div className="shot-fallback" aria-hidden="true"><span className="shot-planet" /><span className="shot-horizon" /></div>
                <figcaption><span>{shot.id} / 03</span><span>{shot.title}</span></figcaption>
              </figure>
            ))}
            <div className="reel-reticle" aria-hidden="true"><i /><i /><span>PLAYING</span></div>
            <div className="reel-progress" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="cosmic-intro"><p className="cosmic-index"><span>01</span> / TOP</p><p className="cosmic-manifesto">境界を越えて、まだ名前のない体験へ。<br />人と世界が出会う瞬間を設計する。</p></div>
          <button className="cosmic-scroll" type="button" onClick={() => scrollToSection("creation")}><span>ENTER ORBIT</span><i aria-hidden="true" /></button>
        </section>

        <section className="creation-section page-section" id="creation" aria-labelledby="creation-title" style={{ "--category-accent": activeCategoryData.accent } as CSSProperties}>
          <div className="creation-stars" aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => (
              <i
                key={index}
                style={{
                  "--star-x": `${(index * 37 + 11) % 100}%`,
                  "--star-y": `${(index * 61 + 7) % 100}%`,
                  "--star-size": `${1 + (index % 4) * 0.55}px`,
                  "--star-delay": `${-(index % 9) * 0.47}s`,
                  "--star-duration": `${2.3 + (index % 6) * 0.48}s`,
                } as CSSProperties}
              />
            ))}
          </div>
          <header className="section-header section-header-light" data-reveal><p><span>02</span> / CREATION</p><p>ROTATE THE SOLAR SYSTEM</p></header>
          <div className="creation-heading" data-reveal>
            <h2 id="creation-title">8つの軌道、<br /><span>8つの「つくる。」</span></h2>
            <div><p>太陽を中心に、異なる領域がひとつの世界を形づくる。</p><p className="drag-guide"><i aria-hidden="true">↔</i> DRAG / SWIPE TO ROTATE</p></div>
          </div>

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
              <h3>{activePlanet.prefix}<br /><span>つくる。</span></h3>
              <p>{activeSolarProject.description}</p>
              <div className="transmission-unlock"><span>CONNECTED FIELD</span><strong>{activePlanet.category.toUpperCase()}</strong></div>
              <div className="orbit-controls"><button type="button" onClick={() => selectSolarPlanet(activeSolar - 1)} aria-label="前の惑星">←</button><span>{String(activeSolar + 1).padStart(2, "0")} / 08</span><button type="button" onClick={() => selectSolarPlanet(activeSolar + 1)} aria-label="次の惑星">→</button></div>
            </article>
          </div>

          <div className="category-tabs" role="tablist" aria-label="制作カテゴリー" data-reveal>
            {categories.map((category) => (
              <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} aria-controls="project-panel" onClick={() => setActiveCategory(category.id)}>
                <span>{category.number}</span><strong>{category.label}</strong><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="category-statement" data-reveal><p>{activeCategoryData.number} / {activeCategoryData.label}</p><h3>{activeCategoryData.japanese}</h3><strong>{activeCategoryData.statement}</strong></div>
          <div className="project-grid" id="project-panel" role="tabpanel" aria-label={`${activeCategoryData.label} projects`}>
            {visibleProjects.map((project, index) => (
              <article className="project-card" key={project.id} data-reveal>
                <ProjectVisual project={project} />
                <div className="project-card-head"><span>{activeCategoryData.label} / {project.number}</span><span>0{index + 1} — 02</span></div>
                <h3>{project.title}</h3><p className="project-subtitle">{project.subtitle}</p><p className="project-description">{project.description}</p>
                <ul className="skill-list" aria-label="使用スキル">{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                <button className="project-open" type="button" onClick={(event) => openProject(project, event)}><span>OPEN PROJECT FILE</span><span aria-hidden="true">↗</span></button>
              </article>
            ))}
          </div>
        </section>

        <section className="career-section page-section" id="career" ref={careerRef} aria-labelledby="career-title">
          <div className="career-stars" aria-hidden="true" />
          <header className="section-header section-header-light" data-reveal><p><span>03</span> / CAREER</p><p>EXPERIENCE LOG</p></header>
          <div className="career-header">
            <h2 id="career-title" data-reveal>経験は、次の判断を<br /><span>つくっていく。</span></h2>
            <p data-reveal>点在していた経験がつながり、現在のProject Manager / Directorへ。スクロールとともに、獲得した視点をたどります。</p>
          </div>
          <div className="career-map" style={{ "--career-progress": careerProgress } as CSSProperties}>
            <div className="career-track" aria-hidden="true">
              <i />
            </div>
            <ol className="career-events">
              {careerEvents.map((event, index) => (
                <li key={`${event.title}-${index}`} data-reveal>
                  <article>
                    <div className="career-event-meta"><span>{event.year}</span><span>{event.type}</span></div>
                    <h3>{event.title}</h3><p>{event.description}</p>
                    <div className="unlock"><i /> SKILL UNLOCKED — {event.unlocked}</div>
                  </article>
                  <span className="career-node" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="career-next" data-reveal>
            <span>ALL EXPERIENCE CONNECTED</span><p>これまで身につけたものを、<br />次の世界へ。</p>
            <button type="button" onClick={() => scrollToSection("future")}>CONTINUE TO FUTURE ↓</button>
          </div>
        </section>

        <section className="future-section page-section" id="future" aria-labelledby="future-title">
          <div className="future-nebula" aria-hidden="true" />
          <header className="section-header section-header-light" data-reveal><p><span>04</span> / FUTURE</p><p>THE NEXT TRANSMISSION</p></header>
          <div className="future-heading" data-reveal><p>THE STORY IS STILL IN PROGRESS</p><h2 id="future-title">完成の先を、<br /><span>つくり続ける。</span></h2></div>
          <div className="future-grid">
            <article className="future-card now-card" data-reveal>
              <div className="future-card-top"><span>01 / NOW</span><span>IN ORBIT</span></div><p className="future-status"><i /> STATUS / IN PROGRESS</p><h3>[CURRENT PROJECT]</h3><p>[現在制作しているプロジェクトの概要を追加します。]</p><div className="future-orbit-visual" aria-hidden="true"><i /><i /><i /><span>62%</span></div>
            </article>
            <article className="future-card next-card" data-reveal>
              <div className="future-card-top"><span>02 / NEXT</span><span>UNIDENTIFIED</span></div><p className="future-status"><i /> STATUS / PROTOTYPING</p><h3>PROJECT // ???</h3><p>まだ見せられない構想。輪郭だけが、少しずつ見え始めています。</p><div className="classified">SIGNAL ENCRYPTED / CONCEPT IN DEVELOPMENT</div>
            </article>
          </div>
          <div className="vision-block" data-reveal>
            <div className="vision-copy"><span>03 / LONG-TERM VISION</span><h3>学びが、次の創作を<br />生み出す宇宙。</h3><p>Tutorial Worldを入口に、学び、出会い、制作、発表、支援が循環する。初心者がいつか、次の初心者を支える側へ。</p></div>
            <ol className="vision-cycle" aria-label="コミュニティ構想の循環">{["TUTORIAL WORLD", "STUDY EVENT", "COMMUNITY", "CREATION", "EXHIBITION", "SUPPORT"].map((label, index) => <li key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><i aria-hidden="true" /></li>)}</ol>
          </div>
          <div className="contact-block" data-reveal>
            <p>CONTACT / LINKS</p><h3>次の世界を、<br />一緒に。</h3><p className="contact-note">連絡先と各種リンクは準備中です。素材受領後、ここから各チャンネルへ接続します。</p>
            <div className="contact-placeholder">{['EMAIL', 'X', 'DISCORD', 'YOUTUBE', 'BOOTH', 'VRCHAT'].map((label) => <span key={label}>{label}<i>[ADD LINK]</i></span>)}</div>
          </div>
          <footer className="site-footer"><span>[NAME] / PORTFOLIO 2026</span><button type="button" onClick={() => scrollToSection("top")}>BACK TO TOP ↑</button><span>PROJECT MANAGER / DIRECTOR</span></footer>
        </section>
      </main>

      <aside className="side-navigation" aria-label="セクションナビゲーション" style={{ "--nav-progress": navProgress } as CSSProperties}>
        <span className="nav-rail" aria-hidden="true"><i /></span>
        {sections.map((section) => <button key={section.id} type="button" className={activeSection === section.id ? "is-active" : ""} aria-current={activeSection === section.id ? "true" : undefined} aria-label={`${section.number} ${section.label}へ移動`} onClick={() => scrollToSection(section.id)}><span>{section.number} {section.label}</span><i /></button>)}
      </aside>

      {selectedProject && (
        <dialog className="project-dialog" ref={dialogRef} onClose={handleDialogClosed} onCancel={(event) => { event.preventDefault(); closeProject(); }} aria-labelledby="dialog-title">
          <div className="dialog-shell">
            <header className="dialog-header"><span>PROJECT FILE / {selectedProject.number}</span><button type="button" onClick={closeProject} aria-label="作品詳細を閉じる">CLOSE <i>×</i></button></header>
            <div className="dialog-hero"><div><p>{selectedProject.subtitle}</p><h2 id="dialog-title">{selectedProject.title}</h2><p>{selectedProject.description}</p></div><ProjectVisual project={selectedProject} /></div>
            <dl className="project-facts"><div><dt>ROLE</dt><dd>{selectedProject.role}</dd></div><div><dt>PERIOD</dt><dd>{selectedProject.period}</dd></div><div><dt>TEAM</dt><dd>{selectedProject.team}</dd></div><div><dt>RESULT</dt><dd>{selectedProject.result}</dd></div></dl>
            <div className="process-intro"><span>PROCESS / DECISIONS</span><h3>完成品だけではなく、<br />そこに至る判断を。</h3></div>
            <ol className="process-list">{processSteps.map(([number, title, description]) => <li key={number}><span>{number}</span><h4>{title}</h4><p>{description}</p></li>)}</ol>
            <footer className="dialog-footer"><span>END OF PROJECT FILE</span><button type="button" onClick={closeProject}>BACK TO CREATIONS ↑</button></footer>
          </div>
        </dialog>
      )}
    </>
  );
}
