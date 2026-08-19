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
  { id: "career", number: "02", label: "CAREER" },
  { id: "creation", number: "03", label: "CREATION" },
  { id: "future", number: "04", label: "FUTURE" },
] as const;

const careerPlanets = [
  { name: "ORIGIN", prefix: "世界を", color: "#7b90ff", glow: "#3156ff" },
  { name: "IDEA", prefix: "企画を", color: "#6ff2ff", glow: "#00b6d7" },
  { name: "EXPERIENCE", prefix: "体験を", color: "#ff83d4", glow: "#e2269a" },
  { name: "CONNECT", prefix: "関係を", color: "#ffc75f", glow: "#ff7b38" },
  { name: "NEXT", prefix: "未来を", color: "#a9ff73", glow: "#4ed54e" },
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

export default function PortfolioExperience() {
  const [loaderState, setLoaderState] = useState<LoaderState>("visible");
  const [activeSection, setActiveSection] = useState("top");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("world");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCareer, setActiveCareer] = useState(2);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, startY: 0 });

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

  const selectCareer = (index: number) => {
    setActiveCareer(wrapIndex(index, careerPlanets.length));
    setDragOffset(0);
  };

  const handleOrbitPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handleOrbitPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setDragOffset(Math.max(-150, Math.min(150, deltaX * 0.32 + deltaY * 0.1)));
  };

  const finishOrbitDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const steps = Math.round(dragOffset / 72);
    setActiveCareer((current) => wrapIndex(current - steps, careerPlanets.length));
    setDragOffset(0);
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const navProgress = Math.max(0, sections.findIndex((section) => section.id === activeSection) / (sections.length - 1));
  const makerVisible = activeSection === "top" || activeSection === "career";
  const activeCareerData = careerEvents[activeCareer];
  const activePlanet = careerPlanets[activeCareer];

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
          <h1 id="hero-title" className={`fixed-maker-word ${makerVisible ? "" : "is-hidden"}`}>つくる。</h1>
          <p className={`fixed-making-prefix ${activeSection === "career" ? "is-visible" : ""}`}>{activePlanet.prefix}</p>
          <button className="cosmic-scroll" type="button" onClick={() => scrollToSection("career")}><span>ENTER ORBIT</span><i aria-hidden="true" /></button>
        </section>

        <section className="career-section page-section" id="career" aria-labelledby="career-title">
          <div className="career-stars" aria-hidden="true" />
          <header className="section-header section-header-light" data-reveal><p><span>02</span> / CAREER</p><p>ROTATE YOUR PERSPECTIVE</p></header>
          <div className="career-intro" data-reveal>
            <h2 id="career-title">点だった経験を、<br /><span>ひとつの軌道へ。</span></h2>
            <div><p>専門領域をまたいだ経験は、すべて次の判断につながっている。</p><p className="drag-guide"><i aria-hidden="true">↔</i> DRAG / SWIPE THE ORBIT</p></div>
          </div>
          <div className="career-universe">
            <div
              className={`career-orbit-stage ${isDragging ? "is-dragging" : ""}`}
              role="slider"
              tabIndex={0}
              aria-label="経歴の惑星。ドラッグ、スワイプ、または左右キーで選択できます"
              aria-valuemin={1}
              aria-valuemax={careerPlanets.length}
              aria-valuenow={activeCareer + 1}
              aria-valuetext={`${activeCareerData.year} ${activeCareerData.title}`}
              aria-orientation="horizontal"
              onPointerDown={handleOrbitPointerDown}
              onPointerMove={handleOrbitPointerMove}
              onPointerUp={finishOrbitDrag}
              onPointerCancel={finishOrbitDrag}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") selectCareer(activeCareer + 1);
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") selectCareer(activeCareer - 1);
              }}
            >
              <div className="orbit-lines" aria-hidden="true"><i /><i /><i /></div>
              <div className="orbit-target" aria-hidden="true"><i /><span>ALIGN</span></div>
              <div className="orbit-sun" aria-hidden="true"><i />N</div>
              {careerPlanets.map((planet, index) => {
                const angle = (index - activeCareer) * 72 + dragOffset;
                const radians = (angle * Math.PI) / 180;
                const x = 50 + Math.cos(radians) * 37;
                const y = 50 + Math.sin(radians) * 37;
                const depth = (Math.cos(radians) + 1) / 2;
                const isActive = index === activeCareer && Math.abs(dragOffset) < 18;
                return (
                  <button
                    className={`career-planet ${isActive ? "is-active" : ""}`}
                    type="button"
                    key={planet.name}
                    aria-label={`${careerEvents[index].year} ${careerEvents[index].title}を表示`}
                    aria-pressed={isActive}
                    onClick={() => selectCareer(index)}
                    style={{
                      "--planet-x": `${x}%`, "--planet-y": `${y}%`, "--planet-scale": 0.58 + depth * 0.48,
                      "--planet-opacity": 0.36 + depth * 0.64, "--planet-color": planet.color,
                      "--planet-glow": planet.glow, "--planet-z": Math.round(depth * 20 + 2),
                    } as CSSProperties}
                  ><i aria-hidden="true" /><span>{String(index + 1).padStart(2, "0")}</span><b>{planet.name}</b></button>
                );
              })}
            </div>
            <article className="career-transmission" key={activeCareer} aria-live="polite">
              <div className="transmission-meta"><span>{activeCareerData.year}</span><span>{activeCareerData.type}</span></div>
              <p className="transmission-signal"><i /> SIGNAL LOCKED / {String(activeCareer + 1).padStart(2, "0")}</p>
              <h3>{activeCareerData.title}</h3><p>{activeCareerData.description}</p>
              <div className="transmission-unlock"><span>CAPABILITY ACQUIRED</span><strong>{activeCareerData.unlocked}</strong></div>
              <div className="orbit-controls"><button type="button" onClick={() => selectCareer(activeCareer - 1)} aria-label="前の経歴">←</button><span>{String(activeCareer + 1).padStart(2, "0")} / 05</span><button type="button" onClick={() => selectCareer(activeCareer + 1)} aria-label="次の経歴">→</button></div>
            </article>
          </div>
          <div className="approach-constellation" data-reveal>
            <div><span>01 / DISCOVER</span><strong>目的を見つける</strong><p>解くべき問いを定め、プロジェクトの北極星をつくる。</p></div>
            <div><span>02 / ALIGN</span><strong>専門性をつなぐ</strong><p>異なる判断基準を翻訳し、チームを同じ軌道へ導く。</p></div>
            <div><span>03 / DELIVER</span><strong>届くまで進める</strong><p>試作と検証を重ね、アイデアを触れられる体験へ。</p></div>
          </div>
        </section>

        <section className="creation-section page-section" id="creation" aria-labelledby="creation-title" style={{ "--category-accent": activeCategoryData.accent } as CSSProperties}>
          <header className="section-header section-header-light" data-reveal><p><span>03</span> / CREATION</p><p>SELECT A CONSTELLATION</p></header>
          <div className="creation-heading" data-reveal><h2 id="creation-title">領域を越えて、<br /><span>世界を実装する。</span></h2><p>{activeCategoryData.description}</p></div>
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
