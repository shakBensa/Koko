import React, { useRef, useState, useEffect, useLayoutEffect } from "react";

interface Project {
  id: number;
  title: string;
  secondaryTitle: string;
  videoUrl: string;
  type: "colorGrading" | "videoEditing" | "both";
  format?: "standard" | "reel";
  category?: string;
  thumbnail?: string;
}

// Import your actual projects data
import projects from "./projects.json";

// Component to animate section titles
const AnimatedTitle = ({ children }: { children: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, [isVisible]);

  return (
    <h2 ref={titleRef} className={`section-title ${isVisible ? 'animate' : ''}`}>
      {children.split('').map((letter, index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </h2>
  );
};

/** ----------------------------------------------------------
 * ORDER: סדר תצוגה מדויק לפי שביקשת
 * ---------------------------------------------------------- */
const ORDER = [
  "כנס גוגל", "עבודותיו של יונתן", "לא נעים",
  "סטודיו NMC", "take a morning nap", "מאסטר קלאס אור קופליס",
  "שווה בשווה", "אדון מאייר, זה אתה?", "טכנוסו באים לתל השומר",
  "דיג׳יי נתי תמם", "בזעת", "מורעאק",
  "טמפטו 1", "טמפטו 2", "בורות"
];

const SOCIAL_ORDER = [
  "קולקטיב פרק 1", "קולקטיב פרק 2", "מרכז שלטון אזורי ישראל", "סיכום חתונה"
];

const orderIndex = (title: string, list: string[]) => {
  const i = list.findIndex(t => t === title);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

/** המרה אוטומטית לקישורי embed של YouTube/Shorts */
const toEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    // shorts
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1].split("/")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // youtu.be
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    // watch?v=
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    return url;
  } catch {
    return url;
  }
};

const ReelsCarousel = ({
  items,
  onOpen
}: {
  items: Project[];
  onOpen: (p: Project) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [resetKey, setResetKey] = useState(0); // <— NEW

  const bump = () => setResetKey((k) => k + 1); // <— NEW

  // Always start at the first card (fixes initial right-shift)
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setSnapReady(false);
    requestAnimationFrame(() => {
      el.scrollLeft = 0;
      requestAnimationFrame(() => setSnapReady(true));
    });
  }, [items.length, resetKey]); // <— depend on resetKey too

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf1 = 0, raf2 = 0;

    const hardReset = () => {
      setSnapReady(false);
      // 1) zero twice
      raf1 = requestAnimationFrame(() => {
        el.scrollLeft = 0;
        raf2 = requestAnimationFrame(() => {
          el.scrollLeft = 0;
          setSnapReady(true);
          // 2) and remount the track to defeat any persisted position
          bump(); // <— NEW: force a remount of the scroller node
        });
      });
    };

    // when visible
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) hardReset();
    }, { threshold: 0.1 });
    io.observe(el);

    // on resize
    const ro = new ResizeObserver(hardReset);
    ro.observe(el);

    // page load / bfcache
    const onLoad = () => hardReset();
    window.addEventListener('load', onLoad);

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('load', onLoad);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".reel-card");
    const step = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="reels-container">
      <button className="reel-arrow left" aria-label="previous reels" onClick={() => scrollBy(-1)}>‹</button>

      <div
        key={resetKey}                               // <— NEW: remount on reset
        className={`reels-track ${snapReady ? "" : "no-snap"}`}
        ref={trackRef}
        dir="ltr"
      >
        {items.map((p) => (
          <div key={p.id} className="reel-card" onClick={() => onOpen(p)}>
            <div className="reel-video">
              <iframe
                src={toEmbedUrl(p.videoUrl)}
                title={p.title}
                frameBorder={0}
                allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="reel-meta" dir="rtl">
              <h4>{p.title}</h4>
              <p>{p.secondaryTitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="reel-arrow right" aria-label="next reels" onClick={() => scrollBy(1)}>›</button>
    </div>
  );
};



const App = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "colorGrading" | "videoEditing">("all");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const scrollToSection = (
    ref: React.MutableRefObject<HTMLDivElement | null>,
    section: string
  ) => {
    if (ref.current) {
      const navbarHeight = 80;
      const yOffset = -navbarHeight;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(section);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = [
        { ref: homeRef, id: "home" },
        { ref: projectsRef, id: "projects" },
        { ref: aboutRef, id: "about" },
        { ref: contactRef, id: "contact" },
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const element = section.ref.current;
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + height
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (project: Project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const handleFormSubmit = () => {
    const subject = encodeURIComponent('New Project Inquiry');
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:koraldayancohen@gmail.com?subject=${subject}&body=${body}`;

    setFormData({ name: '', email: '', message: '' });
  };

  /** --------------------- סינון והפרדה --------------------- */
  const all: Project[] = projects.data as Project[];

  const standardProjects = all
    .filter(p =>
      activeFilter === "all"
        ? true
        : activeFilter === "colorGrading"
          ? p.type === "colorGrading" || p.type === "both"
          : p.type === "videoEditing" || p.type === "both"
    )
    .filter(p => (p.format ?? "standard") !== "reel")
    .sort((a, b) => orderIndex(a.title, ORDER) - orderIndex(b.title, ORDER));

  const reelProjects = all
    .filter(p => (p.format ?? "standard") === "reel")
    .sort((a, b) => orderIndex(a.title, SOCIAL_ORDER) - orderIndex(b.title, SOCIAL_ORDER));

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-container">
            <div className="logo">
              <img
                style={{ zIndex: 9999, position: "absolute", bottom: 15 }}
                src="/Koral/WHITE.png"
                alt="Koral Dayan"
                className="logo"
                width={125}
              />
            </div>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
          </button>

          <div className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
            <button
              onClick={() => scrollToSection(homeRef, "home")}
              className={activeSection === "home" ? "active" : ""}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection(projectsRef, "projects")}
              className={activeSection === "projects" ? "active" : ""}
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection(aboutRef, "about")}
              className={activeSection === "about" ? "active" : ""}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection(contactRef, "contact")}
              className={activeSection === "contact" ? "active" : ""}
            >
              Contact
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section ref={homeRef} className="section hero-section">
          <div className="hero-background"></div>
          <div className="section-content hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="title-line">Video Editor</span>
                <span className="title-line accent">&</span>
                <span className="title-line">Color Grader</span>
              </h1>
              <p className="hero-subtitle">
                Transforming visions into cinematic reality
              </p>
              <button
                className="cta-button"
                onClick={() => scrollToSection(projectsRef, "projects")}
              >
                View My Work
              </button>
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="mouse"></div>
          </div>
        </section>

        {/* Featured Projects (Standard) */}
        <section ref={projectsRef} className="section projects-section">
          <div className="section-header">
            <AnimatedTitle>Featured Projects</AnimatedTitle>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${activeFilter === "colorGrading" ? "active" : ""}`}
                onClick={() => setActiveFilter("colorGrading")}
              >
                Color Grading
              </button>
              <button
                className={`filter-btn ${activeFilter === "videoEditing" ? "active" : ""}`}
                onClick={() => setActiveFilter("videoEditing")}
              >
                Video Editing
              </button>
            </div>
          </div>

          <div className="projects-scroll-container">
            <div className="projects-grid">
              {standardProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => openModal(project)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="project-image">
                    {project.title && (
                      <img
                        src={`/Thumbnails/${project.title}.png`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `/Thumbnails/${project.title}.jpg`;
                        }}
                        alt={project.title}
                        className="project-thumbnail"
                      />
                    )}
                  </div>
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-subtitle">{project.secondaryTitle}</p>
                    <div className="project-tags">
                      {project.type === "both" ? (
                        <>
                          <span className="tag color-grading">Color Grading</span>
                          <span className="tag video-editing">Video Editing</span>
                        </>
                      ) : project.type === "colorGrading" ? (
                        <span className="tag color-grading">Color Grading</span>
                      ) : (
                        <span className="tag video-editing">Video Editing</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reels & Social Carousel */}
        <section className="section reels-section">
          <div className="section-header">
            <AnimatedTitle>Reels & Social</AnimatedTitle>
          </div>
          <div className="section-content">
            <ReelsCarousel items={reelProjects} onOpen={openModal} />
          </div>
        </section>

        {/* About */}
        <section ref={aboutRef} className="section about-section">
          <div className="section-content about-content">
            <div className="about-container">
              <AnimatedTitle>About Me</AnimatedTitle>
              <div className="about-grid">
                <div className="about-text">
                  <p className="lead-text">
                    I'm Koral Dayan Cohen, a passionate video editor, director,
                    colorist, and producer.
                  </p>
                  <p>
                    I specialize in crafting compelling stories from concept to
                    completion, balancing both creative vision and technical
                    excellence. With meticulous attention to detail and a deep
                    commitment to narrative, I bring each frame to life, turning
                    raw footage into powerful, engaging content.
                  </p>
                  <p>
                    My experience spans diverse projects—including
                    documentaries, narrative films, and beyond. I firmly believe
                    in the emotional power of video storytelling, and I'm
                    dedicated to creating content that resonates deeply with
                    audiences.
                  </p>
                  <div className="skills-list">
                    <div className="skill-item">
                      <div className="skill-icon">🎬</div>
                      <span>Video Editing</span>
                    </div>
                    <div className="skill-item">
                      <div className="skill-icon">🎨</div>
                      <span>Color Grading</span>
                    </div>
                    <div className="skill-item">
                      <div className="skill-icon">📽️</div>
                      <span>Directing</span>
                    </div>
                    <div className="skill-item">
                      <div className="skill-icon">🎞️</div>
                      <span>Production</span>
                    </div>
                  </div>
                </div>
                <div className="about-stats">
                  <div className="stat-card">
                    <h3>250+</h3>
                    <p>Projects Completed</p>
                  </div>
                  <div className="stat-card">
                    <h3>10+</h3>
                    <p>Years Experience</p>
                  </div>
                  <div className="stat-card">
                    <h3>100%</h3>
                    <p>Client Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section ref={contactRef} className="section contact-section">
          <div className="section-content">
            <div className="contact-container">
              <AnimatedTitle>Let's Work Together</AnimatedTitle>
              <p className="contact-subtitle">
                Have a project in mind? I'd love to hear about it.
              </p>

              <div className="contact-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Tell me about your project"
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="form-input"
                  ></textarea>
                </div>
                <button
                  onClick={handleFormSubmit}
                  className="submit-button"
                  disabled={
                    !formData.name || !formData.email || !formData.message
                  }
                >
                  Send Message
                </button>
              </div>

              <div className="contact-alternatives">
                <p>Or reach out directly:</p>
                <a
                  href="mailto:koraldayancohen@gmail.com"
                  className="email-link"
                >
                  koraldayancohen@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isModalOpen && currentProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h3 className="modal-title">{currentProject.title}</h3>
            <p className="modal-subtitle">{currentProject.secondaryTitle}</p>
            <div className="video-container">
              <iframe
                src={toEmbedUrl(currentProject.videoUrl)}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                title={currentProject.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary-color: #ffffff;
          --secondary-color: #f0f0f0;
          --accent-color: #ff6b6b;
          --dark-bg: #0a0a0a;
          --gray-bg: #111111;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --border-color: rgba(255, 255, 255, 0.1);
          --shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body {
          margin: 0;
          background-color: var(--dark-bg);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          width: 100%;
          overflow-x: hidden;
          line-height: 1.6;
        }

        main {
          width: 100vw;
          overflow-x: hidden;
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: var(--dark-bg);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .loader {
          width: 50px;
          height: 50px;
          border: 3px solid var(--border-color);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          z-index: 1000;
          height: 80px;
          transition: var(--transition);
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
        }

        .nav-links {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .nav-links button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: var(--transition);
          position: relative;
          padding: 8px 0;
        }

        .nav-links button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent-color);
          transition: width 0.3s ease;
        }

        .nav-links button:hover {
          color: var(--text-primary);
        }

        .nav-links button.active {
          color: var(--text-primary);
        }

        .nav-links button.active::after {
          width: 100%;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
          position: relative;
          z-index: 1001;
        }

        .hamburger {
          display: block;
          width: 25px;
          height: 2px;
          background: var(--text-primary);
          position: relative;
          transition: var(--transition);
        }

        .hamburger::before,
        .hamburger::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--text-primary);
          transition: var(--transition);
        }

        .hamburger::before { top: -8px; }
        .hamburger::after { bottom: -8px; }

        .hamburger.open { background: transparent; }
        .hamburger.open::before { top: 0; transform: rotate(45deg); }
        .hamburger.open::after { bottom: 0; transform: rotate(-45deg); }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .hero-content {
          text-align: center;
          z-index: 1;
          max-width: 1000px;
          padding: 0 20px;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          line-height: 1;
          margin-bottom: 30px;
          animation: fadeInUp 1s ease-out;
        }

        .title-line { display: block; margin: 10px 0; }
        .title-line.accent { color: var(--accent-color); font-size: 0.8em; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          color: var(--text-secondary);
          margin-bottom: 40px;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .cta-button {
          display: inline-block;
          padding: 16px 40px;
          background: var(--accent-color);
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 18px;
          border-radius: 50px;
          transition: var(--transition);
          animation: fadeInUp 1s ease-out 0.4s both;
          border: none;
          cursor: pointer;
          transform: translateZ(0);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          animation: bounce 2s infinite;
        }

        .mouse {
          width: 30px;
          height: 50px;
          border: 2px solid var(--text-secondary);
          border-radius: 25px;
          position: relative;
        }

        .mouse::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 10px;
          background: var(--text-secondary);
          border-radius: 2px;
          animation: scroll 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }

        @keyframes scroll {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }

        /* Section Styles */
        .section {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-content {
          width: 100%;
          padding: 100px 80px 60px;
        }

        .section-header {
          max-width: 1400px;
          margin: 0 auto;
          padding: 100px 40px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin-bottom: 20px;
          position: relative;
          display: inline-block;
          text-align: left;
          cursor: default;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 60px;
          height: 4px;
          background: var(--accent-color);
          transition: width 0.8s ease 0.5s;
        }

        .section-title.animate::after { width: 100%; }

        .section-title span {
          display: inline-block;
          position: relative;
          transform-origin: bottom;
          opacity: 0;
          transform: translateY(20px);
        }

        .section-title.animate span { animation: letterDrop 0.6s ease forwards; }

        @keyframes letterDrop {
          0% { opacity: 0; transform: translateY(20px) rotateZ(-5deg); color: var(--text-primary); }
          50% { opacity: 1; transform: translateY(-5px) rotateZ(2deg); color: var(--accent-color); }
          100% { opacity: 1; transform: translateY(0) rotateZ(0); color: var(--text-primary); }
        }

        /* Filter Buttons */
        .filter-buttons { display: flex; gap: 10px; }

        .filter-btn {
          padding: 8px 20px;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: 25px;
          cursor: pointer;
          transition: var(--transition);
          font-size: 14px;
          font-weight: 500;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }

        /* Projects Section */
        .projects-section {
          background: var(--gray-bg);
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .section-header {
          width: 100%;
          padding: 80px 80px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          flex-shrink: 0;
        }

        .projects-scroll-container {
          flex: 1;
          overflow-y: auto;
          padding: 0 80px 40px;
          width: 100%;
          scrollbar-width: thin;
          scrollbar-color: #444 #222;
        }

        .projects-scroll-container::-webkit-scrollbar { width: 8px; }
        .projects-scroll-container::-webkit-scrollbar-track { background: #222; border-radius: 4px; }
        .projects-scroll-container::-webkit-scrollbar-thumb { background-color: #444; border-radius: 4px; }
        .projects-scroll-container::-webkit-scrollbar-thumb:hover { background-color: #555; }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 30px;
          padding-bottom: 20px;
          width: 100%;
        }

        .project-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          border: 1px solid var(--border-color);
          animation: fadeInUp 0.6s ease-out both;
        }

        .project-card:hover {
          transform: translateY(-10px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: var(--shadow);
        }

        .project-image {
          width: 100%;
          height: 250px;
          overflow: hidden;
          position: relative;
        }

        .project-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .project-card:hover .project-thumbnail { transform: scale(1.05); }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: var(--text-secondary);
        }

        .project-content { padding: 30px; }

        .project-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }

        .project-subtitle { color: var(--text-secondary); margin-bottom: 20px; }

        .project-tags { display: flex; gap: 10px; flex-wrap: wrap; }

        .tag {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tag.color-grading { background: rgba(216, 157, 157, 0.2); color: #d89d9d; }
        .tag.video-editing { background: rgba(127, 154, 235, 0.2); color: #7f9aeb; }

        /* About Section */
        .about-section { background: var(--dark-bg); display: flex; align-items: center; justify-content: center; }

        .about-content { display: flex; align-items: center; justify-content: center; min-height: 100vh; }

        .about-container { max-width: 1200px; margin: 0 auto; }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          margin-top: 60px;
        }

        .about-text { font-size: 18px; line-height: 1.8; }

        .lead-text { font-size: 24px; font-weight: 600; margin-bottom: 30px; color: var(--text-primary); }

        .about-text p { margin-bottom: 20px; color: var(--text-secondary); }

        .skills-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 40px;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: var(--transition);
        }

        .skill-item:hover { border-color: var(--accent-color); transform: translateX(5px); }

        .skill-icon { font-size: 28px; }

        .about-stats { display: grid; gap: 30px; }

        .stat-card {
          padding: 40px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          text-align: center;
          transition: var(--transition);
        }

        .stat-card:hover { border-color: var(--accent-color); transform: translateY(-5px); }

        .stat-card h3 { font-size: 48px; font-weight: 800; color: var(--accent-color); margin-bottom: 10px; }

        .stat-card p { color: var(--text-secondary); font-size: 18px; }

        /* Contact Section */
        .contact-section { background: var(--gray-bg); display: flex; align-items: center; justify-content: center; }

        .contact-container { width: 100%; text-align: left; }

        .contact-container .section-title { text-align: left; margin-bottom: 20px; }

        .contact-subtitle { font-size: 20px; color: var(--text-secondary); margin-bottom: 50px; text-align: left; }

        .contact-form { display: flex; flex-direction: column; gap: 20px; max-width: 700px; }

        .form-group { position: relative; }

        .form-input {
          width: 100%;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 16px;
          transition: var(--transition);
          font-family: inherit;
        }

        .form-input:focus { outline: none; border-color: var(--accent-color); background: rgba(255, 255, 255, 0.05); }

        .form-input::placeholder { color: var(--text-secondary); }

        textarea.form-input { resize: vertical; min-height: 150px; }

        .submit-button {
          padding: 18px 40px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          margin-top: 20px;
        }

        .submit-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }

        .submit-button:disabled { opacity: 0.5; cursor: not-allowed; }

        .contact-alternatives { margin-top: 60px; text-align: left; }

        .contact-alternatives p { color: var(--text-secondary); margin-bottom: 15px; }

        .email-link { color: var(--accent-color); text-decoration: none; font-size: 20px; font-weight: 600; transition: var(--transition); }

        .email-link:hover { text-decoration: underline; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background-color: var(--gray-bg);
          padding: 40px;
          border-radius: 20px;
          max-width: 90vw;
          width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 10px;
          transition: var(--transition);
          border-radius: 8px;
        }

        .modal-close:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.1); }

        .modal-title { font-size: 32px; margin-bottom: 10px; }

        .modal-subtitle { color: var(--text-secondary); margin-bottom: 30px; }

        .video-container {
          width: 100%;
          padding-bottom: 56.25%;
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .video-container iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }

/* ---------- Reels (clean, FLEX) ---------- */
.reels-section { background: var(--dark-bg); }

/* outer container matches page width and centers nicely */
.reels-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

/* FLEX track; force LTR so first card starts at the left */
.reels-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 6px 0 12px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: #444 #222;
  direction: ltr;
  overscroll-behavior-inline: contain;
  scroll-padding-left: 0;
}

.reels-track.no-snap { scroll-snap-type: none !important; }

.reels-track::-webkit-scrollbar { height: 8px; }
.reels-track::-webkit-scrollbar-track { background: #222; border-radius: 4px; }
.reels-track::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
.reels-track::-webkit-scrollbar-thumb:hover { background: #555; }

.reel-card {
  width: 280px;
  min-width: 280px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: var(--transition);
  overflow: hidden;
}
.reel-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255,255,255,0.2);
  box-shadow: var(--shadow);
}

/* 9:16 video */
.reel-video {
  position: relative;
  width: 100%;
  padding-bottom: 177.78%;
  background: #000;
}
.reel-video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.reels-track { scrollbar-gutter: stable both-edges; }

.reel-meta { padding: 12px 14px 16px; }
.reel-meta h4 { font-size: 16px; margin-bottom: 6px; }
.reel-meta p  { color: var(--text-secondary); font-size: 14px; }

.reel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
  display: grid; place-items: center;
  cursor: pointer;
  transition: var(--transition);
  z-index: 2;
}
.reel-arrow:hover { background: rgba(255,255,255,0.1); }
.reel-arrow.left  { left: 6px; }
.reel-arrow.right { right: 6px; }

  .reels-track { scrollbar-gutter: stable both-edges; }

/* ---------- Responsive ---------- */
@media (max-width: 1024px) {
  .reels-container { padding: 0 20px; }
  .reel-card { width: 260px; min-width: 260px; }
}

@media (max-width: 768px) {
  .reel-card { width: 70vw; min-width: 70vw; }

  /* (this is your mobile nav block that accidentally lost its wrapper) */
  .nav-links {
    position: fixed;
    top: 80px;
    right: -100%;
    width: 100%;
    height: calc(100vh - 80px);
    background: var(--dark-bg);
    flex-direction: column;
    padding: 40px;
    gap: 30px;
    transition: right 0.3s ease;
    border-top: 1px solid var(--border-color);
  }
  .nav-links.mobile-open { right: 0; }
  .nav-links button { font-size: 20px; width: 100%; text-align: left; }

  .section-header { flex-direction: column; align-items: flex-start; }
  .filter-buttons { width: 100%; overflow-x: auto; padding-bottom: 10px; }
  .section-content { padding: 80px 20px 40px; }
  .projects-section { height: auto; min-height: 100vh; }
  .section-header { padding: 80px 20px 20px; }
  .projects-scroll-container { padding: 0 20px 20px; max-height: none; overflow-y: visible; }
  .projects-grid { grid-template-columns: 1fr; gap: 20px; }
  .hero-title { font-size: clamp(2.5rem, 6vw, 4rem); }
  .skills-list { grid-template-columns: 1fr; }
  .modal { padding: 30px 20px; }
  .about-stats { grid-template-columns: 1fr; }
}

        @media (max-width: 480px) {
          .nav-content { padding: 0 20px; }
          .project-card { border-radius: 12px; }
          .project-content { padding: 20px; }
          .hero-subtitle { font-size: 1.1rem; }
          .cta-button { padding: 14px 32px; font-size: 16px; }
        }
      `}</style>
    </>
  );
};

export default App;
