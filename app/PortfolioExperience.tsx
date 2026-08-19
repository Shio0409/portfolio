"use client";

import {
  type CSSProperties,
  type MouseEvent,
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

type LoaderState = "visible" | "leaving" | "hidden";

function ProjectVisual({ project }: { project: Project }) {
  return (
    <div className={`project-visual visual-${project.visual}`} aria-hidden="true">
      <span className="visual-index">{project.number}</span>
      <div className="visual-stage">
        {Array.from({ length: 8 }, (_, index) => (
          <i
            key={index}
            style={{
              "--i": index,
              "--ring-size": `${58 + index * 43}px`,
              "--terrain-inset": `${index * 5}%`,
              "--terrain-x": `${index * 4}px`,
              "--terrain-y": `${index * -8}px`,
              "--bar-left": `${11 + index * 11}%`,
              "--bar-height": `${40 + index * 18}px`,
              "--block-rotation": `${(index - 3) * 4}deg`,
              "--grid-top": `${10 + index * 9}%`,
              "--grid-left": `${8 + index * 10}%`,
              "--grid-size": `${12 + index * 2}px`,
              "--signal-top": `${12 + index * 9}%`,
              "--signal-width": `${18 + index * 8}%`,
              "--orbit-size": `${30 + index * 38}px`,
            } as CSSProperties}
          />
        ))}
      </div>
      <span className="visual-caption">MEDIA PLACEHOLDER / 16:10</span>
    </div>
  );
}

export default function PortfolioExperience() {
  const [loaderState, setLoaderState] = useState<LoaderState>("visible");
  const [activeSection, setActiveSection] = useState("top");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("world");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [careerProgress, setCareerProgress] = useState(0);
  const careerRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

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
      window.setTimeout(() => setLoaderState("hidden"), 460);
      return "leaving";
    });
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(dismissIntro, reducedMotion ? 650 : 1900);
    return () => window.clearTimeout(timer);
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
      { threshold: 0.15 },
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -52%", threshold: [0, 0.2, 0.5, 0.8] },
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
      const section = careerRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight * 0.45, 1);
      const next = Math.min(1, Math.max(0, (window.innerHeight * 0.58 - rect.top) / travel));
      setCareerProgress(Number(next.toFixed(3)));
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

  useEffect(() => {
    if (!selectedProject) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.documentElement.classList.add("dialog-open");
    return () => document.documentElement.classList.remove("dialog-open");
  }, [selectedProject]);

  const scrollToSection = (id: string) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
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

  const creationStyle = {
    "--creation-surface": activeCategoryData.surface,
    "--creation-foreground": activeCategoryData.foreground,
    "--creation-accent": activeCategoryData.accent,
  } as CSSProperties;

  const navProgress = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSection) / (sections.length - 1),
  );

  return (
    <>
      {loaderState !== "hidden" && (
        <div
          className={`intro-loader ${loaderState === "leaving" ? "is-leaving" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="ポートフォリオを準備しています"
        >
          <button
            className="loader-skip-surface"
            type="button"
            onClick={dismissIntro}
            aria-label="ローディング演出をスキップ"
          />
          <div className="loader-topline">
            <span>[NAME] / PORTFOLIO</span>
            <span>EST. 2026</span>
          </div>
          <div className="loader-center">
            <p>INITIALIZING EXPERIENCE</p>
            <div className="loader-word" aria-hidden="true">
              <span>W</span><span>O</span><span>R</span><span>L</span><span>D</span>
            </div>
            <div className="loader-modules" aria-hidden="true">
              <span>PLAN</span><i /><span>DESIGN</span><i /><span>BUILD</span><i /><span>CONNECT</span>
            </div>
          </div>
          <div className="loader-bottom">
            <div className="loader-progress"><i /></div>
            <span>CLICK / TAP / ENTER TO SKIP</span>
          </div>
        </div>
      )}

      <a className="skip-link" href="#main-content">本文へスキップ</a>

      <main id="main-content" aria-hidden={loaderState !== "hidden"}>
        <section className="top-section page-section" id="top" aria-labelledby="hero-title">
          <div className="hero">
            <header className="masthead">
              <button className="wordmark" type="button" onClick={() => scrollToSection("top")}>
                <span className="wordmark-mark">N</span>
                <span>[NAME] / PORTFOLIO 2026</span>
              </button>
              <p className="role">PROJECT MANAGER / DIRECTOR</p>
              <p className="masthead-index">TOKYO / JP</p>
            </header>

            <div className="hero-copy">
              <p className="eyebrow"><span>01</span> IDEAS INTO EXPERIENCES</p>
              <h1 id="hero-title">
                体験を、
                <br />
                <span>つくる。</span>
              </h1>
              <div className="hero-summary">
                <p>
                  企画、デザイン、テクノロジー、コミュニティ。
                  <br />
                  異なる領域をつなぎ、アイデアを人が触れられる体験へ。
                </p>
                <button className="primary-link" type="button" onClick={() => scrollToSection("creation")}>
                  <span>VIEW CREATIONS</span>
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>

            <div className="hero-orbit" aria-hidden="true">
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
              <span className="orbit-cross orbit-cross-x" />
              <span className="orbit-cross orbit-cross-y" />
              <span className="orbit-core">IDEA</span>
              <span className="orbit-label label-one">PLAN</span>
              <span className="orbit-label label-two">BUILD</span>
              <span className="orbit-label label-three">CONNECT</span>
            </div>

            <div className="hero-footer">
              <p><i /> SCROLL TO EXPLORE</p>
              <p>PM / DIRECTION / EXPERIENCE DESIGN</p>
            </div>
          </div>

          <div className="about-bridge">
            <div className="section-kicker" data-reveal>
              <span>ABOUT / APPROACH</span>
              <span>CONNECTING THE DOTS</span>
            </div>
            <p className="about-statement" data-reveal>
              つくる人、使う人、集まる人。
              <br />
              <span>視点をつなぎ、プロジェクトを前へ。</span>
            </p>
            <div className="approach-grid" data-reveal>
              <article>
                <span>01 / DISCOVER</span>
                <h2>目的を見つける</h2>
                <p>誰に、どんな変化を届けたいか。最初に解くべき問いを揃える。</p>
              </article>
              <article>
                <span>02 / ALIGN</span>
                <h2>専門性をつなぐ</h2>
                <p>企画と制作、技術と表現。それぞれの判断基準をひとつの体験へ束ねる。</p>
              </article>
              <article>
                <span>03 / DELIVER</span>
                <h2>届くまで導く</h2>
                <p>試作、検証、改善を重ね、アイデアを実際に触れられる状態へ進める。</p>
              </article>
            </div>
          </div>
        </section>

        <section className="creation-section page-section" id="creation" style={creationStyle} aria-labelledby="creation-title">
          <div className="creation-backdrop" aria-hidden="true">
            <span>{activeCategoryData.label}</span>
          </div>
          <div className="section-kicker section-kicker-light" data-reveal>
            <span>02 / CREATION</span>
            <span>SELECT A POINT OF VIEW</span>
          </div>

          <div className="creation-heading" data-reveal>
            <div>
              <p>{activeCategoryData.number} / {activeCategoryData.label}</p>
              <h2 id="creation-title">{activeCategoryData.japanese}</h2>
            </div>
            <div className="creation-intro">
              <strong>{activeCategoryData.statement}</strong>
              <p>{activeCategoryData.description}</p>
            </div>
          </div>

          <div className="category-tabs" role="tablist" aria-label="制作カテゴリー" data-reveal>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                aria-controls="project-panel"
                onClick={() => setActiveCategory(category.id)}
              >
                <span>{category.number}</span>
                <strong>{category.label}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="project-grid" id="project-panel" role="tabpanel" aria-label={`${activeCategoryData.label} projects`}>
            {visibleProjects.map((project, index) => (
              <article className="project-card" key={project.id} data-reveal>
                <ProjectVisual project={project} />
                <div className="project-card-head">
                  <span>{activeCategoryData.label} / {project.number}</span>
                  <span>0{index + 1} OF 02</span>
                </div>
                <h3>{project.title}</h3>
                <p className="project-subtitle">{project.subtitle}</p>
                <p className="project-description">{project.description}</p>
                <ul className="skill-list" aria-label="使用スキル">
                  {project.skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
                <button className="project-open" type="button" onClick={(event) => openProject(project, event)}>
                  <span>VIEW PROJECT</span><span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="career-section page-section" id="career" ref={careerRef} aria-labelledby="career-title">
          <div className="career-header">
            <div className="section-kicker" data-reveal>
              <span>03 / CAREER</span>
              <span>EXPERIENCE LOG</span>
            </div>
            <h2 id="career-title" data-reveal>
              経験は、次の判断を
              <br />
              <span>つくっていく。</span>
            </h2>
            <p data-reveal>
              点在していた経験がつながり、現在のProject Manager / Directorへ。
              スクロールとともに、獲得した視点をたどります。
            </p>
          </div>

          <div
            className="career-map"
            style={{
              "--career-progress": careerProgress,
              "--career-position": `${careerProgress * 100}%`,
            } as CSSProperties}
          >
            <div className="career-track" aria-hidden="true">
              <i />
              <div className="career-character">
                <span /><span />
                <b>YOU</b>
              </div>
            </div>
            <ol className="career-events">
              {careerEvents.map((event, index) => (
                <li key={`${event.title}-${index}`} data-reveal>
                  <article>
                    <div className="career-event-meta">
                      <span>{event.year}</span>
                      <span>{event.type}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="unlock"><i /> SKILL UNLOCKED — {event.unlocked}</div>
                  </article>
                  <span className="career-node" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="career-next" data-reveal>
            <span>ALL EXPERIENCE CONNECTED</span>
            <p>これまで身につけたものを、<br />次の世界へ。</p>
            <button type="button" onClick={() => scrollToSection("future")}>CONTINUE TO FUTURE ↓</button>
          </div>
        </section>

        <section className="future-section page-section" id="future" aria-labelledby="future-title">
          <div className="section-kicker section-kicker-light" data-reveal>
            <span>04 / FUTURE</span>
            <span>NOW / NEXT / VISION</span>
          </div>
          <div className="future-heading" data-reveal>
            <p>THE STORY IS STILL IN PROGRESS</p>
            <h2 id="future-title">完成の先を、<br /><span>つくり続ける。</span></h2>
          </div>

          <div className="future-grid">
            <article className="future-card now-card" data-reveal>
              <div className="future-card-top"><span>01</span><span>NOW CREATING</span></div>
              <p className="future-status"><i /> STATUS / IN PROGRESS</p>
              <h3>[CURRENT PROJECT]</h3>
              <p>[現在制作しているプロジェクトの概要を追加します。]</p>
              <div className="future-placeholder" aria-hidden="true">
                <span>PROGRESS</span><i /><i /><i /><i /><i />
              </div>
            </article>
            <article className="future-card next-card" data-reveal>
              <div className="future-card-top"><span>02</span><span>NEXT PROJECT</span></div>
              <p className="future-status"><i /> STATUS / PROTOTYPING</p>
              <h3>PROJECT // ???</h3>
              <p>まだ見せられない構想。輪郭だけが、少しずつ見え始めています。</p>
              <div className="classified" aria-hidden="true">CONFIDENTIAL / CONCEPT IN DEVELOPMENT</div>
            </article>
          </div>

          <div className="vision-block" data-reveal>
            <div className="vision-copy">
              <span>03 / LONG-TERM VISION</span>
              <h3>学びが、次の創作を<br />生み出す場所。</h3>
              <p>
                Tutorial Worldを入口に、学び、出会い、制作、発表、支援が循環する。
                初心者がいつか、次の初心者を支える側へ。
              </p>
            </div>
            <ol className="vision-cycle" aria-label="コミュニティ構想の循環">
              {[
                ["01", "TUTORIAL WORLD"],
                ["02", "STUDY EVENT"],
                ["03", "COMMUNITY"],
                ["04", "CREATION"],
                ["05", "EXHIBITION"],
                ["06", "SUPPORT"],
              ].map(([number, label]) => (
                <li key={number}><span>{number}</span><strong>{label}</strong><i aria-hidden="true">↓</i></li>
              ))}
            </ol>
          </div>

          <div className="contact-block" data-reveal>
            <div>
              <span>CONTACT / LINKS</span>
              <h3>一緒に、次の体験を。</h3>
            </div>
            <p>
              Contact details and portfolio links will be added here.
              <br />
              現在、連絡先を準備中です。
            </p>
            <div className="contact-placeholder">
              {['EMAIL', 'X', 'DISCORD', 'YOUTUBE', 'BOOTH', 'VRCHAT'].map((label) => (
                <span key={label}>{label}<i>[ADD LINK]</i></span>
              ))}
            </div>
          </div>

          <footer className="site-footer">
            <span>[NAME] / PORTFOLIO 2026</span>
            <button type="button" onClick={() => scrollToSection("top")}>BACK TO TOP ↑</button>
            <span>PROJECT MANAGER / DIRECTOR</span>
          </footer>
        </section>
      </main>

      <aside
        className="side-navigation"
        aria-label="セクションナビゲーション"
        style={{ "--nav-progress": navProgress } as CSSProperties}
      >
        <span className="nav-rail" aria-hidden="true"><i /></span>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeSection === section.id ? "is-active" : ""}
            aria-current={activeSection === section.id ? "true" : undefined}
            aria-label={`${section.number} ${section.label}へ移動`}
            onClick={() => scrollToSection(section.id)}
          >
            <span>{section.number} {section.label}</span><i />
          </button>
        ))}
      </aside>

      {selectedProject && (
        <dialog
          className="project-dialog"
          ref={dialogRef}
          onClose={handleDialogClosed}
          onCancel={(event) => {
            event.preventDefault();
            closeProject();
          }}
          aria-labelledby="dialog-title"
        >
          <div className="dialog-shell">
            <header className="dialog-header">
              <span>PROJECT FILE / {selectedProject.number}</span>
              <button type="button" onClick={closeProject} aria-label="作品詳細を閉じる">CLOSE <i>×</i></button>
            </header>
            <div className="dialog-hero">
              <div>
                <p>{selectedProject.subtitle}</p>
                <h2 id="dialog-title">{selectedProject.title}</h2>
                <p>{selectedProject.description}</p>
              </div>
              <ProjectVisual project={selectedProject} />
            </div>
            <dl className="project-facts">
              <div><dt>ROLE</dt><dd>{selectedProject.role}</dd></div>
              <div><dt>PERIOD</dt><dd>{selectedProject.period}</dd></div>
              <div><dt>TEAM</dt><dd>{selectedProject.team}</dd></div>
              <div><dt>RESULT</dt><dd>{selectedProject.result}</dd></div>
            </dl>
            <div className="process-intro">
              <span>PROCESS / DECISIONS</span>
              <h3>完成品だけではなく、<br />そこに至る判断を。</h3>
            </div>
            <ol className="process-list">
              {processSteps.map(([number, title, description]) => (
                <li key={number}>
                  <span>{number}</span><h4>{title}</h4><p>{description}</p>
                </li>
              ))}
            </ol>
            <footer className="dialog-footer">
              <span>END OF PROJECT FILE</span>
              <button type="button" onClick={closeProject}>BACK TO CREATIONS ↑</button>
            </footer>
          </div>
        </dialog>
      )}
    </>
  );
}
