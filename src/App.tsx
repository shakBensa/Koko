import React, { useRef, useState, useEffect, useLayoutEffect } from "react";

interface Project {
  id: number;
  title: string;
  secondaryTitle: string;
  videoUrl: string;
  type: string[];
  format?: "standard" | "reel";
  category?: string;
  thumbnail?: string;
}

// Import your actual projects data
import projects from "./projects.json";
import colorGallery from "./color-gallery.json";

type ColorGroup = {
  title: string;
  cover: string;
  images: string[];
};

// ====== Role maps (labels & CSS classes) ======
const ROLE_LABEL: Record<string, string> = {
  videoEditing: "Video Editing",
  colorGrading: "Color Grading",
  directing: "Directing",
  production: "Production",
};

const ROLE_CLASS: Record<string, string> = {
  videoEditing: "video-editing",
  colorGrading: "color-grading",
  directing: "directing",
  production: "production",
};

// Component to animate section titles (unchanged)
const AnimatedTitle = ({ children }: { children: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Detect mobile (same as isMobile in App)
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 900;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current);
    };
  }, [isVisible]);

  if (isMobile) {
    // Break each word to a new line
    return (
      <h2 ref={titleRef} className={`section-title ${isVisible ? "animate" : ""}`}>
        {children.split(" ").map((word, wIdx) => (
          <span key={wIdx} style={{ display: "block" }}>
            {word.split("").map((letter, lIdx) => (
              <span key={lIdx} style={{ animationDelay: `${(wIdx * 10 + lIdx) * 0.03}s` }}>
                {letter}
              </span>
            ))}
          </span>
        ))}
      </h2>
    );
  }

  // Desktop: animate each letter, no line breaks
  return (
    <h2 ref={titleRef} className={`section-title ${isVisible ? "animate" : ""}`}>
      {children.split("").map((letter, index) => (
        <span key={index} style={{ animationDelay: `${index * 0.03}s` }}>
          {letter === " " ? "\u00A0" : letter}
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
  const i = list.findIndex((t) => t === title);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

/** המרה אוטומטית לקישורי embed של YouTube/Shorts */
const toEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1].split("/")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
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
  const [resetKey, setResetKey] = useState(0);

  const bump = () => setResetKey((k) => k + 1);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setSnapReady(false);
    requestAnimationFrame(() => {
      el.scrollLeft = 0;
      requestAnimationFrame(() => setSnapReady(true));
    });
  }, [items.length, resetKey]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf1 = 0,
      raf2 = 0;

    const hardReset = () => {
      setSnapReady(false);
      raf1 = requestAnimationFrame(() => {
        el.scrollLeft = 0;
        raf2 = requestAnimationFrame(() => {
          el.scrollLeft = 0;
          setSnapReady(true);
          bump();
        });
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) hardReset();
    }, { threshold: 0.1 });
    io.observe(el);

    const ro = new ResizeObserver(hardReset);
    ro.observe(el);

    const onLoad = () => hardReset();
    window.addEventListener("load", onLoad);

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("load", onLoad);
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
      <button className="reel-arrow left" aria-label="previous reels" onClick={() => scrollBy(-1)}>
        ‹
      </button>

      <div key={resetKey} className={`reels-track ${snapReady ? "" : "no-snap"}`} ref={trackRef} dir="ltr">
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

      <button className="reel-arrow right" aria-label="next reels" onClick={() => scrollBy(1)}>
        ›
      </button>
    </div>
  );
};

// Color Grading carousel (images)
const ColorCarousel = ({
  groups,
  onOpen,
}: {
  groups: ColorGroup[];
  onOpen: (g: ColorGroup) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const bump = () => setResetKey((k) => k + 1);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setSnapReady(false);
    requestAnimationFrame(() => {
      el.scrollLeft = 0;
      requestAnimationFrame(() => setSnapReady(true));
    });
  }, [groups.length, resetKey]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf1 = 0,
      raf2 = 0;

    const hardReset = () => {
      setSnapReady(false);
      raf1 = requestAnimationFrame(() => {
        el.scrollLeft = 0;
        raf2 = requestAnimationFrame(() => {
          el.scrollLeft = 0;
          setSnapReady(true);
          bump();
        });
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) hardReset();
    }, { threshold: 0.1 });
    io.observe(el);

    const ro = new ResizeObserver(hardReset);
    ro.observe(el);

    const onLoad = () => hardReset();
    window.addEventListener("load", onLoad);

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("load", onLoad);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".color-card");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="reels-container color-container">
      <button className="reel-arrow left" aria-label="previous color items" onClick={() => scrollBy(-1)}>
        ‹
      </button>
      <div key={resetKey} className={`reels-track ${snapReady ? "" : "no-snap"}`} ref={trackRef} dir="ltr">
        {groups.map((g) => (
          <div key={g.title} className="color-card" onClick={() => onOpen(g)}>
            <div className="color-image">
              <img src={g.cover} alt={g.title} loading="lazy" decoding="async" />
            </div>
            <div className="reel-meta" dir="rtl">
              <h4>{g.title}</h4>
              <p>{g.images.length > 1 ? `${g.images.length} תמונות` : "תמונה אחת"}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="reel-arrow right" aria-label="next color items" onClick={() => scrollBy(1)}>
        ›
      </button>
    </div>
  );
};

type RoleFilter = "all" | "colorGrading" | "videoEditing" | "production" | "directing";

interface MobilePaginatedProjectsProps {
  projects: Project[];
  openModal: (project: Project) => void;
}

const MobilePaginatedProjects: React.FC<MobilePaginatedProjectsProps> = ({ projects, openModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Calculate the projects to display on current page
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

  // Reset to page 1 when projects change (e.g., filter changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [projects]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of projects section after state update
    setTimeout(() => {
      const projectsSection = document.querySelector('.projects-section');
      if (projectsSection) {
        const navbarHeight = 80;
        const yOffset = -navbarHeight;
        const y = projectsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 0);
  };

  // Type-safe role mappings
  const ROLE_LABEL: Record<string, string> = {
    videoEditing: "Video Editing",
    colorGrading: "Color Grading",
    directing: "Directing",
    production: "Production",
  };

  const ROLE_CLASS: Record<string, string> = {
    videoEditing: "video-editing",
    colorGrading: "color-grading",
    directing: "directing",
    production: "production",
  };

  // ProjectThumb component
  const ProjectThumb: React.FC<{ title: string }> = ({ title }) => {
    if (title === "אדון מאייר, זה אתה?") {
      return (
        <img
          src="/Thumbnails/אדון מאייר, זה אתה.jpg"
          alt={title}
          className="project-thumbnail"
          loading="lazy"
          decoding="async"
        />
      );
    }
    const enc = encodeURIComponent(title);
    const [src, setSrc] = React.useState(`/Thumbnails/${enc}.png`);

    React.useEffect(() => {
      setSrc(`/Thumbnails/${enc}.png`);
    }, [enc]);

    return (
      <img
        src={src}
        alt={title}
        className="project-thumbnail"
        loading="lazy"
        decoding="async"
        onError={() => {
          if (src.endsWith(".png")) setSrc(`/Thumbnails/${enc}.jpg`);
        }}
      />
    );
  };

  return (
    <>
      <div className="projects-grid mobile-paginated">
        {currentProjects.map((project, index) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => openModal(project)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="project-image">
              {project.title && <ProjectThumb title={project.title} />}
            </div>
            <div className="project-content">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-subtitle">{project.secondaryTitle}</p>
              <div className="project-tags">
                {(project.type ?? []).map((role) => (
                  <span key={role} className={`tag ${ROLE_CLASS[role] ?? ""}`}>
                    {ROLE_LABEL[role] ?? role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn prev"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>

          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show first page, last page, current page, and pages around current
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-num ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => paginate(pageNumber)}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <span key={pageNumber} className="pagination-dots">...</span>;
              }
              return null;
            })}
          </div>

          <button
            className="pagination-btn next"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      )}
    </>
  );
};

const App = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [activeColorGroup, setActiveColorGroup] = useState<ColorGroup | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [rotateColorView, setRotateColorView] = useState(false);
  const colorModalRef = useRef<HTMLDivElement>(null);
  const photoStageRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoleFilter>("all");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth <= 900;

  // HERO: showreel + controls
  const SHOWREEL_ID = "FMtpnUR3MgM";
  const SHOWREEL_EMBED =
    `https://www.youtube.com/embed/${SHOWREEL_ID}` +
    `?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${SHOWREEL_ID}&enablejsapi=1`;
  // const [showHeroText, setShowHeroText] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
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
        { ref: contactRef, id: "contact" }
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const element = section.ref.current;
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  // === Drop-in: Hebrew-safe thumbnail loader (no network loops) ===
  const ProjectThumb = ({
    title,
  }: {
    title: string;
  }) => {
    if (title === "אדון מאייר, זה אתה?") {
      // special case for the Hebrew title that has a different thumbnail
      return (
        <img
          src="/Thumbnails/אדון מאייר, זה אתה.jpg"
          alt={title}
          className="project-thumbnail"
          loading="lazy"
          decoding="async"
        />
      );
    }
    const enc = encodeURIComponent(title);
    const [src, setSrc] = React.useState(`/Thumbnails/${enc}.png`);

    // only update when title actually changes
    React.useEffect(() => {
      setSrc(`/Thumbnails/${enc}.png`);
    }, [enc]);

    return (
      <img
        src={src}
        alt={title}
        className="project-thumbnail"
        loading="lazy"
        decoding="async"
        // try .jpg once; never loop
        onError={() => {
          if (src.endsWith(".png")) setSrc(`/Thumbnails/${enc}.jpg`);
        }}
      />
    );
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) closeModal();
        if (isColorOpen) setIsColorOpen(false);
        if (isMenuOpen) setIsMenuOpen(false);
      }
      if (isColorOpen && activeColorGroup) {
        if (e.key === "ArrowLeft") {
          setColorIndex((i) => (i - 1 + activeColorGroup.images.length) % activeColorGroup.images.length);
        } else if (e.key === "ArrowRight") {
          setColorIndex((i) => (i + 1) % activeColorGroup.images.length);
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, isColorOpen, isMenuOpen, activeColorGroup]);

  // Fullscreen removed per request — rotate mode maximizes the view
  // Keep rotated viewer sized precisely to the viewport via CSS vars (more reliable on mobile)
  useEffect(() => {
    const setVars = () => {
      const el = colorModalRef.current;
      if (!el) return;
      el.style.setProperty('--rvw', `${window.innerWidth}px`);
      el.style.setProperty('--rvh', `${window.innerHeight}px`);
    };
    if (isColorOpen) {
      setVars();
      window.addEventListener('resize', setVars);
      window.addEventListener('orientationchange', setVars);
    }
    return () => {
      window.removeEventListener('resize', setVars);
      window.removeEventListener('orientationchange', setVars);
    };
  }, [isColorOpen, rotateColorView]);

  useEffect(() => {
    document.body.style.overflow = (isModalOpen || isColorOpen || isMenuOpen) ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, isColorOpen, isMenuOpen]);

  const handleFormSubmit = () => {
    const subject = encodeURIComponent("New Project Inquiry");
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:koraldayancohen@gmail.com?subject=${subject}&body=${body}`;
    setFormData({ name: "", email: "", message: "" });
  };

  /** --------------------- סינון והפרדה --------------------- */
  const all: Project[] = projects.data as Project[];

  // Helper to determine if a project matches the active role filter
  const matchesRoleFilter = (p: Project, filter: RoleFilter) =>
    filter === "all" ? true : Array.isArray(p.type) && p.type.includes(filter);

  const standardProjects = all
    .filter((p) => matchesRoleFilter(p, activeFilter))
    .filter((p) => (p.format ?? "standard") !== "reel")
    .sort((a, b) => orderIndex(a.title, ORDER) - orderIndex(b.title, ORDER));

  const reelProjects = all
    .filter((p) => (p.format ?? "standard") === "reel")
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
      <nav className="navbar" role="navigation" aria-label="Primary">
        <div className="nav-content">
          <div className="logo-container">
            <div className="logo">
              <img
                style={{ position: "absolute", bottom: 15 }}
                src="/Koral/WHITE.png"
                alt="Koral Dayan"
                className="logo"
                width={125}
              />
            </div>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
          >
            <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
            <span className="sr-only">{isMenuOpen ? "Close" : "Open"} navigation</span>
          </button>

          <div id="primary-navigation" className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
            <button onClick={() => scrollToSection(homeRef, "home")} className={activeSection === "home" ? "active" : ""}>
              Home
            </button>
            <button
              onClick={() => scrollToSection(projectsRef, "projects")}
              className={activeSection === "projects" ? "active" : ""}
            >
              Projects
            </button>
            <button onClick={() => scrollToSection(aboutRef, "about")} className={activeSection === "about" ? "active" : ""}>
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

      {/* Scrim for mobile menu */}
      {isMenuOpen && <div className="mobile-scrim" aria-hidden onClick={() => setIsMenuOpen(false)} />}

      <main>
        {/* ===================== HERO (sideways video, centered, no-crop, full-height on mobile portrait) ===================== */}
        <section ref={homeRef} className="section hero-section">
          <div className="hero-background" aria-hidden></div>

          <div className="hero-video-wrapper" aria-hidden>
            <div className="hero-hover-scrim" aria-hidden></div>
            <iframe
              id="showreel-iframe"
              className="showreel-frame"
              src={SHOWREEL_EMBED}
              title="Koral Dayan Cohen — Showreel"
              frameBorder={0}
              allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              tabIndex={-1}
            />
          </div>

          <div className={`hero-visibility `}>
            <div className="section-content hero-content hero-align-left">
              <div className="hero-text hero-left-text">
                {isMobile ?
                  <>
                    <AnimatedTitle>Video-Editor Producer</AnimatedTitle>
                  </>
                  :
                  <>
                    <AnimatedTitle>Video Editor & Producer</AnimatedTitle>
                    <p className="hero-subtitle">Transforming visions into cinematic reality</p>

                  </>

                }
                <button className="cta-button" onClick={() => scrollToSection(projectsRef, "projects")}>
                  View My Work
                </button>
              </div>
            </div>
          </div>

          {/* <button
    className="hero-info-toggle"
    onClick={() => setShowHeroText((v) => !v)}
    aria-pressed={showHeroText}
    aria-label={showHeroText ? "Hide hero text" : "Show hero text"}
    title={showHeroText ? "Hide" : "Show"}
  >
    {showHeroText ? "×" : "i"}
  </button> */}

          <button
            className="hero-audio-toggle"
            onClick={() => {
              const iframe = document.getElementById("showreel-iframe") as HTMLIFrameElement | null;
              const win = iframe?.contentWindow;
              if (!win) return;
              win.postMessage(JSON.stringify({ event: "command", func: isMuted ? "unMute" : "mute", args: [] }), "*");
              if (isMuted) {
                win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [100] }), "*");
                win.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*");
              }
              setIsMuted((m) => !m);
            }}
            aria-pressed={!isMuted}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* scroll hint – auto hides after 4s */}
          <div className="scroll-indicator timed-hide-4s">
            <div className="mouse"></div>
          </div>

          {/* rotate hint – centered & auto hides after 4s */}
          <div className="rotate-hint timed-hide-4s" aria-hidden>
            <div className="badge"><div className="phone-icon" /></div>
            <span>Rotate your phone for a better view</span>
          </div>

          <style>{`
    /* ===== FIX: remove hero padding/margin on mobile portrait so the video can truly center ===== */
    @media (orientation: portrait) and (max-width: 900px) {
      .hero-section {
        min-height: 100svh !important;
        height: 100svh !important;
        padding: 0 !important;      /* overrides the 80px padding-top from desktop */
        margin-top: 0 !important;    /* overrides the 80px margin-top from desktop */
        overflow: hidden !important;
      }
      .hero-video-wrapper { position: absolute; inset: 0; }
    }

    /* ===== SIDEWAYS + NO-CROP (CONTAIN) + PERFECT CENTER =====
       Largest size that fits both dimension constraints. Centers via translate(-50%, -50%). */
    @media (orientation: portrait) and (max-width: 900px) {
      .hero-video-wrapper .showreel-frame {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform-origin: center center !important;

        /* Choose the biggest rotated box that still fits — NO CROPPING */
        /* After 90° rotation, CSS width becomes displayed height. */
        --Wcss: min(100svh, calc(100svw * 16 / 9));   /* displayed height */
        width: var(--Wcss) !important;                 /* before rotation */
        height: calc(var(--Wcss) * 9 / 16) !important; /* displayed width */

        transform: translate(-50%, -50%) rotate(90deg) !important;
        background: #000;
      }

      .hero-hover-scrim { opacity: 0.3; }

      /* Bottom-right mute button on mobile */
      .hero-audio-toggle {
        top: auto;
        bottom: max(16px, env(safe-area-inset-bottom));
        right: max(16px, env(safe-area-inset-right));
        width: 46px; height: 46px;
      }
    }

    /* ===== Timed auto-hide (first 4s visible) ===== */
    .hero-section .timed-hide-4s {
      animation: hideAfter4s 0.5s ease forwards;
      animation-delay: 4s;
      will-change: opacity, visibility;
    }
    @keyframes hideAfter4s { to { opacity: 0; visibility: hidden; } }
    .hero-section .scroll-indicator.timed-hide-4s * { animation-play-state: paused !important; }

    /* ===== Rotate hint styling ===== */
    .rotate-hint {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      display: none; align-items: center; gap: 14px;
      padding: 12px 16px; background: rgba(0,0,0,0.55);
      border: 1px solid rgba(255,255,255,0.15); color: #fff;
      border-radius: 999px; z-index: 1200; pointer-events: none;
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      white-space: nowrap;
      animation: hintIn .45s ease-out both, hideAfter4s 0.5s ease forwards;
      animation-delay: .2s, 4s;
    }
    @keyframes hintIn { from { opacity: 0; transform: translate(-50%, -46%);} to { opacity: 1; transform: translate(-50%, -50%);} }
    .rotate-hint .badge { width: 30px; height: 30px; border-radius: 999px; background: rgba(255,255,255,0.12); display: grid; place-items: center; }
    .phone-icon { width: 18px; height: 26px; border-radius: 4px; border: 2px solid rgba(255,255,255,0.9); position: relative; transform-origin: 60% 50%; animation: rotatePhone 2.5s ease-in-out infinite; }
    .phone-icon::after { content:''; position:absolute; bottom:2px; left:50%; transform:translateX(-50%); width:6px; height:2px; border-radius:1px; background:rgba(255,255,255,0.9); }
    @keyframes rotatePhone { 0%,20%{transform:rotate(0)} 45%,60%{transform:rotate(90deg)} 85%,100%{transform:rotate(0)} }

    @media (orientation: portrait) and (max-width: 900px) { .rotate-hint { display: inline-flex; } }
    @media (orientation: landscape) { .rotate-hint { display: none !important; } }
  `}</style>
        </section>






{/* ===================== PROJECTS ===================== */}
<section ref={projectsRef} className="section projects-section">
  <div className="section-header">
    <AnimatedTitle>Featured Projects</AnimatedTitle>
    <div className="filter-buttons">
      {([
        { key: "all", label: "All" },
        { key: "colorGrading", label: "Color Grading" },
        { key: "videoEditing", label: "Video Editing" },
        { key: "production", label: "Production" },
        { key: "directing", label: "Directing" },
      ] as { key: RoleFilter; label: string }[]).map((f) => (
        <button
          key={f.key}
          className={`filter-btn ${activeFilter === f.key ? "active" : ""}`}
          onClick={() => setActiveFilter(f.key)}
          aria-pressed={activeFilter === f.key}
        >
          {f.label}
        </button>
      ))}
    </div>
  </div>

  <div className="projects-scroll-container">
    {/* Conditionally render based on mobile/desktop */}
    {isMobile ? (
      <MobilePaginatedProjects 
        projects={standardProjects} 
        openModal={openModal} 
      />
    ) : (
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
                <ProjectThumb title={project.title} />
              )}
            </div>
            <div className="project-content">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-subtitle">{project.secondaryTitle}</p>
              <div className="project-tags">
                {(project.type ?? []).map((role) => (
                  <span key={role} className={`tag ${ROLE_CLASS[role] ?? ""}`}>
                    {ROLE_LABEL[role] ?? role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</section>
        {/* ===================== REELS ===================== */}
        <section className="section reels-section">
          <div className="section-header">
            <AnimatedTitle>Reels & Social</AnimatedTitle>
          </div>
          <div className="section-content">
            <ReelsCarousel items={reelProjects} onOpen={openModal} />
          </div>
        </section>

        {/* ===================== COLOR GRADING ===================== */}
        <section className="section color-section">
          <div className="section-header">
            <AnimatedTitle>Color Grading</AnimatedTitle>
          </div>
          <div className="section-content">
            <ColorCarousel
              groups={(colorGallery as { groups: ColorGroup[] }).groups}
              onOpen={(g) => {
                setActiveColorGroup(g);
                setColorIndex(0);
                setIsColorOpen(true);
              }}
            />
          </div>
        </section>

        {/* ===================== ABOUT ===================== */}
        <section ref={aboutRef} className="section about-section">
          <div className="section-content about-content">
            <div className="about-container">
              <AnimatedTitle>About Me</AnimatedTitle>
              <div className="about-grid">
                <div className="about-text">
                  <p className="lead-text">
                    I'm Koral Dayan Cohen, a passionate video editor, director, colorist, and producer.
                  </p>
                  <p>
                    I specialize in crafting compelling stories from concept to completion, balancing both creative
                    vision and technical excellence. With meticulous attention to detail and a deep commitment to
                    narrative, I bring each frame to life, turning raw footage into powerful, engaging content.
                  </p>
                  <p>
                    My experience spans diverse projects—including documentaries, narrative films, and beyond. I firmly
                    believe in the emotional power of video storytelling, and I'm dedicated to creating content that
                    resonates deeply with audiences.
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

        {/* ===================== CONTACT ===================== */}
        <section ref={contactRef} className="section contact-section">
          <div className="section-content">
            <div className="contact-container">
              <AnimatedTitle>Let's Work Together</AnimatedTitle>
              <p className="contact-subtitle">Have a project in mind? I'd love to hear about it.</p>

              <div className="contact-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Tell me about your project"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                  ></textarea>
                </div>
                <button
                  onClick={handleFormSubmit}
                  className="submit-button"
                  disabled={!formData.name || !formData.email || !formData.message}
                >
                  Send Message
                </button>
              </div>

              <div className="contact-alternatives">
                <p>Or reach out directly:</p>
                <a href="mailto:koraldayancohen@gmail.com" className="email-link">
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
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

      {/* Color lightbox */}
      {isColorOpen && activeColorGroup && (
        <div className="modal-overlay" onClick={() => setIsColorOpen(false)}>
          <div ref={colorModalRef} className={`modal color-modal ${rotateColorView ? 'rotate' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-tools" role="toolbar" aria-label="Viewer controls">
              <button className="ctrl-btn rotate-btn" onClick={() => setRotateColorView((v) => !v)} aria-label="Rotate view">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M21 12a9 9 0 1 1-3.3-6.9"/>
                  <path d="M21 5v6h-6"/>
                </svg>
              </button>
              <button className="ctrl-btn close-btn" onClick={() => setIsColorOpen(false)} aria-label="Close">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="modal-title">{activeColorGroup.title}</h3>
            <div className="photo-viewer">
              <button
                className="photo-nav prev"
                onClick={() => setColorIndex((i) => (i - 1 + activeColorGroup.images.length) % activeColorGroup.images.length)}
                aria-label="Previous image"
              >
                ‹
              </button>
              <div ref={photoStageRef} className={`photo-stage`}>
                <img
                  src={activeColorGroup.images[colorIndex]}
                  alt={`${activeColorGroup.title} ${colorIndex + 1}/${activeColorGroup.images.length}`}
                />
              </div>
              <button
                className="photo-nav next"
                onClick={() => setColorIndex((i) => (i + 1) % activeColorGroup.images.length)}
                aria-label="Next image"
              >
                ›
              </button>
            </div>
            {activeColorGroup.images.length > 1 && (
              <div className="photo-thumbs" dir="ltr">
                {activeColorGroup.images.map((src, idx) => (
                  <button
                    key={src}
                    className={`thumb ${idx === colorIndex ? "active" : ""}`}
                    onClick={() => setColorIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img src={src} alt={`${activeColorGroup.title} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

        body {
          margin: 0;
          background-color: var(--dark-bg);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          width: 100%;
          overflow-x: hidden;
          line-height: 1.6;
        }

        main { width: 100vw; overflow-x: hidden; }

        /* Loading Screen */
        .loading-screen {
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
          background: var(--dark-bg); display: flex; justify-content: center; align-items: center; z-index: 9999;
        }
        .loader {
          width: 50px; height: 50px; border: 3px solid var(--border-color);
          border-top-color: var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Navbar */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          z-index: 1002; height: 80px; transition: var(--transition);
        }
        .nav-content {
          max-width: 1400px; margin: 0 auto; padding: 0 40px; height: 100%;
          display: flex; justify-content: space-between; align-items: center;
        }
        .logo-container { display: flex; align-items: center; }

        .nav-links { display: flex; gap: 40px; align-items: center; }
        .nav-links button {
          background: none; border: none; color: var(--text-secondary);
          cursor: pointer; font-size: 16px; font-weight: 500; transition: var(--transition); position: relative; padding: 8px 0;
        }
        .nav-links button::after {
          content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--accent-color); transition: width 0.3s ease;
        }
        .nav-links button:hover { color: var(--text-primary); }
        .nav-links button.active { color: var(--text-primary); }
        .nav-links button.active::after { width: 100%; }

        .mobile-menu-toggle { display: none; background: none; border: none; cursor: pointer; padding: 10px; position: relative; z-index: 1002; }
        .hamburger { display: block; width: 25px; height: 2px; background: var(--text-primary); position: relative; transition: var(--transition); }
        .hamburger::before, .hamburger::after { content: ''; position: absolute; width: 100%; height: 100%; background: var(--text-primary); transition: var(--transition); }
        .hamburger::before { top: -8px; }
        .hamburger::after { bottom: -8px; }
        .hamburger.open { background: transparent; }
        .hamburger.open::before { top: 0; transform: rotate(45deg); }
        .hamburger.open::after { bottom: 0; transform: rotate(-45deg); }

        /* ===== HERO (no dark overlay) ===== */
        .hero-section {
          position: relative; min-height: 100vh;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        /* Remove the old animated radial background entirely */
        .hero-background { display: none; }

        /* Full-bleed video */
        .hero-video-wrapper { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
        .hero-video-wrapper iframe {
          position: absolute; top: 50%; left: 50%;
          width: 120vw; height: 120vh; transform: translate(-50%, -50%);
          pointer-events: none; background: #000;
        }

        /* Text visibility (no scrim) */
        .hero-visibility { position: relative; z-index: 2; opacity: 0; transition: opacity .3s ease; }
        @media (hover: hover) and (pointer: fine) {
          .hero-section:hover .hero-visibility { opacity: 1; }
        }
        @media (hover: none) {
          .hero-visibility { opacity: 0; }
          .hero-visibility.open { opacity: 1; }
        }

        /* Left alignment so we don't cover the middle of the frame */
        .hero-content.hero-align-left {
          display: flex; justify-content: flex-start; align-items: center; text-align: left;
        }
        .hero-left-text { max-width: 720px; }
        /* Hover-only scrim for desktop: invisible by default */
.hero-hover-scrim {
  position: absolute;
  inset: 0;
  /* gentle top-to-bottom gradient; tweak strength as you like */
  background: linear-gradient(
    to bottom,
    rgba(10,10,10,0.30) 60%,
    rgba(10,10,10,0.40) 80%,
    rgba(10,10,10,0.60) 100%
  );
  opacity: 0;
  transition: opacity .25s ease;
  pointer-events: none; /* never blocks clicks */
  z-index: 1; /* sits above the video, below text */
}

/* Only on devices with hover (desktop/laptop) */
@media (hover: hover) and (pointer: fine) {
  .hero-section:hover .hero-hover-scrim { opacity: 1; } /* try 0.7 if you want stronger */
}
 /* Push hero content down below the toolbar */
.hero-section {
  margin-top: 80px; /* same as toolbar height */
}

/* Or use padding if you want background/video to fill under it but text to start lower */
.hero-section {
  padding-top: 80px; /* same as toolbar height */
  box-sizing: border-box;
}

        /* Reuse your hero title/subtitle styles */
        .hero-content { text-align: center; z-index: 2; max-width: 1000px; padding: 0 20px; }
        .hero-title { font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; line-height: 1; margin-bottom: 30px; animation: fadeInUp 1s ease-out; }
        .title-line { display: block; margin: 10px 0; }
        .title-line.accent { color: var(--accent-color); font-size: 0.8em; }
        .hero-subtitle { font-size: clamp(1.2rem, 3vw, 1.8rem); color: white; margin-bottom: 40px; animation: fadeInUp 1s ease-out 0.2s both; }
        .cta-button {
          display: inline-block; padding: 16px 40px; background: var(--accent-color); color: white; text-decoration: none;
          font-weight: 600; font-size: 18px; border-radius: 50px; transition: var(--transition); animation: fadeInUp 1s ease-out 0.4s both;
          border: none; cursor: pointer; transform: translateZ(0);
        }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* Buttons (audio/info) */
        .hero-info-toggle, .hero-audio-toggle {
          position: absolute; z-index: 1200;
          width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
          border-radius: 999px; border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.06); color: var(--text-primary);
          font-size: 18px; transition: var(--transition);
        }
        .hero-info-toggle:hover, .hero-audio-toggle:hover { background: rgba(255,255,255,0.12); }
        .hero-audio-toggle { top: calc(80px + 16px); right: 16px; } /* below navbar, above it in stacking */
        .hero-info-toggle  { bottom: 16px; right: 16px; display: none; }
        @media (hover: none) { .hero-info-toggle { display: inline-flex; } .hero-left-text { max-width: 90vw; } }

        .scroll-indicator {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); animation: bounce 2s infinite;
        }
        .mouse { width: 30px; height: 50px; border: 2px solid var(--text-secondary); border-radius: 25px; position: relative; }
        .mouse::after {
          content: ''; position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 10px; background: var(--text-secondary); border-radius: 2px; animation: scroll 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }
        @keyframes scroll { 0% { opacity: 1; transform: translateX(-50%) translateY(0); } 100% { opacity: 0; transform: translateX(-50%) translateY(20px); } }

        /* Sections */
        .section { min-height: 100vh; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .section-content { width: 100%; padding: 100px 80px 60px; }

        .section-header {
          max-width: 1400px; margin: 0 auto; padding: 100px 40px 40px;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
        }
        .section-title {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; margin-bottom: 20px; position: relative;
          display: inline-block; text-align: left; cursor: default;
        }
        .section-title::after {
          content: ''; position: absolute; bottom: -10px; left: 0; width: 60px; height: 4px; background: var(--accent-color);
          transition: width 0.8s ease 0.5s;
        }
        .section-title.animate::after { width: 100%; }
        .section-title span { display: inline-block; position: relative; transform-origin: bottom; opacity: 0; transform: translateY(20px); }
        .section-title.animate span { animation: letterDrop 0.6s ease forwards; }
        @keyframes letterDrop {
          0% { opacity: 0; transform: translateY(20px) rotateZ(-5deg); color: var(--text-primary); }
          50% { opacity: 1; transform: translateY(-5px) rotateZ(2deg); color: var(--accent-color); }
          100% { opacity: 1; transform: translateY(0) rotateZ(0); color: var(--text-primary); }
        }

        /* Filter Buttons */
        .filter-buttons { display: flex; gap: 10px; }
        .filter-btn {
          padding: 8px 20px; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);
          border-radius: 25px; cursor: pointer; transition: var(--transition); font-size: 14px; font-weight: 500;
        }
        .filter-btn:hover, .filter-btn.active { background: var(--accent-color); border-color: var(--accent-color); color: white; }

        /* Projects Section */
        .projects-section { background: var(--gray-bg); height: 100vh; width: 100vw; display: flex; flex-direction: column; overflow: hidden; }
        .section-header { width: 100%; padding: 80px 80px 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; flex-shrink: 0; }
        .projects-scroll-container { flex: 1; overflow-y: auto; padding: 0 80px 40px; width: 100%; scrollbar-width: thin; scrollbar-color: #444 #222; }
        .projects-scroll-container::-webkit-scrollbar { width: 8px; }
        .projects-scroll-container::-webkit-scrollbar-track { background: #222; border-radius: 4px; }
        .projects-scroll-container::-webkit-scrollbar-thumb { background-color: #444; border-radius: 4px; }
        .projects-scroll-container::-webkit-scrollbar-thumb:hover { background-color: #555; }

        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 30px; padding-bottom: 20px; width: 100%; }
        .project-card {
          background: rgba(255, 255, 255, 0.03); border-radius: 16px; overflow: hidden; cursor: pointer; transition: var(--transition);
          border: 1px solid var(--border-color); animation: fadeInUp 0.6s ease-out both;
        }
        .project-card:hover { transform: translateY(-10px); border-color: rgba(255, 255, 255, 0.2); box-shadow: var(--shadow); }
        .project-image { width: 100%; height: 250px; overflow: hidden; position: relative; }
        .project-thumbnail { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
        .project-card:hover .project-thumbnail { transform: scale(1.05); }
        .placeholder-image {
          width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--text-secondary);
        }
        .project-content { padding: 30px; }
        .project-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .project-subtitle { color: var(--text-secondary); margin-bottom: 20px; }
        .project-tags { display: flex; gap: 10px; flex-wrap: wrap; }
        .tag { padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .tag.color-grading { background: rgba(216, 157, 157, 0.2); color: #d89d9d; }
        .tag.video-editing { background: rgba(127, 154, 235, 0.2); color: #7f9aeb; }
        .tag.directing { background: rgba(255, 215, 130, 0.2); color: #ffd782; }
        .tag.production { background: rgba(116, 209, 164, 0.2); color: #74d1a4; }

        /* About Section */
        .about-section { background: var(--dark-bg); display: flex; align-items: center; justify-content: center; }
        .about-content { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .about-container { max-width: 1200px; margin: 0 auto; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; margin-top: 60px; }
        .about-text { font-size: 18px; line-height: 1.8; }
        .lead-text { font-size: 24px; font-weight: 600; margin-bottom: 30px; color: var(--text-primary); }
        .about-text p { margin-bottom: 20px; color: var(--text-secondary); }
        .skills-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 40px; }
        .skill-item {
          display: flex; align-items: center; gap: 15px; padding: 20px; background: rgba(255, 255, 255, 0.03);
          border-radius: 12px; border: 1px solid var(--border-color); transition: var(--transition);
        }
        .skill-item:hover { border-color: var(--accent-color); transform: translateX(5px); }
        .skill-icon { font-size: 28px; }
        .about-stats { display: grid; gap: 30px; grid-template-columns: 1fr; }
        .stat-card {
          padding: 40px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; border: 1px solid var(--border-color);
          text-align: center; transition: var(--transition);
        }
        .stat-card:hover { border-color: var(--accent-color); transform: translateY(-5px); }
        .stat-card h3 { font-size: 48px; font-weight: 800; color: var(--accent-color); margin-bottom: 10px; }
        .stat-card p { color: var(--text-secondary); font-size: 18px; }
/* About Section - Mobile Responsive Updates */
@media (max-width: 900px) {
  .about-section {
    padding: 60px 0;
    min-height: auto;
  }
  
  .about-content {
    min-height: auto;
    padding: 0 20px;
  }
  
  .about-container {
    max-width: 100%;
  }
  
  .about-grid {
    grid-template-columns: 1fr;
    gap: 40px;
    margin-top: 40px;
  }
  
  .about-text {
    font-size: 16px;
    line-height: 1.7;
    order: 1;
  }
  
  .lead-text {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .about-text p {
    margin-bottom: 16px;
  }
  
  .skills-list {
    margin-top: 30px;
    gap: 15px;
  }
  
  .skill-item {
    padding: 16px;
  }
  
  .skill-icon {
    font-size: 24px;
  }
  
  .about-stats {
    order: 2;
    gap: 20px;
    margin-top: 20px;
  }
  
  .stat-card {
    padding: 30px 20px;
  }
  
  .stat-card h3 {
    font-size: 36px;
    margin-bottom: 8px;
  }
  
  .stat-card p {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .about-section {
    padding: 40px 0;
  }
  
  .about-content {
    padding: 0 16px;
  }
  
  .about-grid {
    gap: 30px;
    margin-top: 30px;
  }
  
  .lead-text {
    font-size: 18px;
  }
  
  .about-text {
    font-size: 15px;
  }
  
  .skills-list {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 24px;
  }
  
  .skill-item {
    padding: 14px;
    gap: 12px;
  }
  
  .skill-icon {
    font-size: 20px;
  }
  
  .about-stats {
    gap: 15px;
  }
  
  .stat-card {
    padding: 24px 16px;
    border-radius: 12px;
  }
  
  .stat-card h3 {
    font-size: 32px;
  }
  
  .stat-card p {
    font-size: 14px;
  }
  
  /* Ensure the section title is properly sized on mobile */
  .about-section .section-title {
    font-size: clamp(2rem, 6vw, 2.5rem);
    margin-bottom: 0;
  }
}

/* Additional touch-friendly adjustments */
@media (hover: none) and (pointer: coarse) {
  .skill-item:hover {
    transform: none;
  }
  
  .stat-card:hover {
    transform: none;
  }
  
  /* Add subtle tap feedback instead */
  .skill-item:active,
  .stat-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* Landscape mobile optimization */
@media (max-width: 900px) and (orientation: landscape) {
  .about-section {
    padding: 40px 0;
  }
  
  .about-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  
  .about-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 0;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-card h3 {
    font-size: 28px;
  }
  
  .stat-card p {
    font-size: 14px;
  }
}

/* Ensure proper spacing with navbar on mobile */
@media (max-width: 900px) {
  .about-section {
    scroll-margin-top: 80px;
  }
}
        /* Contact */
        .contact-container { width: 100%; text-align: center; }
        .contact-container .section-title { text-align: center; margin-left: auto; margin-right: auto; display: inline-block; }
        .contact-container .section-title::after { left: 50%; transform: translateX(-50%); }
        .contact-subtitle { text-align: center; margin-bottom: 40px; }
        .contact-form {
          display: flex; flex-direction: column; gap: 20px; max-width: 700px; margin: 0 auto;
        }
        .form-input {
          width: 100%; padding: 20px; background: rgba(255, 255, 255, 0.03); border: 2px solid var(--border-color);
          border-radius: 12px; color: var(--text-primary); font-size: 16px; transition: var(--transition); font-family: inherit;
        }
        .form-input:focus { outline: none; border-color: var(--accent-color); background: rgba(255, 255, 255, 0.05); }
        .form-input::placeholder { color: var(--text-secondary); }
        textarea.form-input { resize: vertical; min-height: 150px; }
        .submit-button {
          padding: 18px 40px; background: var(--accent-color); color: white; border: none; border-radius: 12px;
          font-size: 18px; font-weight: 600; cursor: pointer; transition: var(--transition); margin-top: 20px;
        }
        .submit-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
        .submit-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .contact-alternatives { margin-top: 60px; text-align: center; }

        /* Modal */
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0, 0, 0, 0.95); display: flex; justify-content: center; align-items: center;
          z-index: 2000; padding: 20px; animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background-color: var(--gray-bg); padding: 40px; border-radius: 20px; max-width: 90vw; width: 1000px; max-height: 90vh;
          display: flex; flex-direction: column; position: relative; animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-close {
          position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text-secondary);
          cursor: pointer; padding: 10px; transition: var(--transition); border-radius: 8px;
        }
        .modal-close:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.1); }
        .modal-title { font-size: 32px; margin-bottom: 10px; }
        .modal-subtitle { color: var(--text-secondary); margin-bottom: 30px; }
        .video-container { width: 100%; padding-bottom: 56.25%; position: relative; background: #000; border-radius: 12px; overflow: hidden; }
        .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

        /* Reels */
        .reels-section { background: var(--dark-bg); display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; overflow: visible; }
        .reels-section .section-content { padding-top: 0; }
        .reels-container { position: relative; width: 100%; max-width: none; margin: 0; padding: 0; }
        .reels-track { display: flex; gap: 16px; overflow-x: auto; padding: 6px 0 12px; scroll-snap-type: x proximity; scrollbar-width: thin; scrollbar-color: #444 #222; direction: ltr; overscroll-behavior-inline: contain; scroll-padding-left: 0; }
        .reels-track.no-snap { scroll-snap-type: none !important; }
        .reels-track::-webkit-scrollbar { height: 8px; }
        .reels-track::-webkit-scrollbar-track { background: #222; border-radius: 4px; }
        .reels-track::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        .reels-track::-webkit-scrollbar-thumb:hover { background: #555; }
        .reel-card { width: 280px; min-width: 280px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 16px; scroll-snap-align: start; cursor: pointer; transition: var(--transition); overflow: hidden; }
        .reel-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.2); box-shadow: var(--shadow); }
        .reel-video { position: relative; width: 100%; padding-bottom: 177.78%; background: #000; }
        .reel-video iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
        .reel-meta { padding: 12px 14px 16px; }
        .reel-meta h4 { font-size: 16px; margin-bottom: 6px; }
        .reel-meta p { color: var(--text-secondary); font-size: 14px; }
        .reel-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.28); background: rgba(0,0,0,0.6); color: #fff; display: grid; place-items: center; cursor: pointer; transition: var(--transition); z-index: 5; box-shadow: 0 4px 18px rgba(0,0,0,0.35); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .reel-arrow:hover { background: rgba(0,0,0,0.75); border-color: rgba(255,255,255,0.4); }
        .reel-arrow.left { left: 6px; }
        .reel-arrow.right { right: 6px; }
        .reels-track { scrollbar-gutter: stable both-edges; }

        /* Color carousel */
        .color-section { background: var(--dark-bg); width: 100vw; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; overflow: visible; }
        .color-section .section-content { padding-top: 0; }
        .color-card { width: 360px; min-width: 360px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 16px; scroll-snap-align: start; cursor: pointer; transition: var(--transition); overflow: hidden; }
        .color-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.2); box-shadow: var(--shadow); }
        .color-image { position: relative; width: 100%; padding-bottom: 56.25%; background: #000; overflow: hidden; }
        .color-image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

        /* Color modal */
        .color-modal { max-width: min(1100px, 96vw); position: relative; }
        /* Unified controls sizing */
        .color-modal { --ctrl-size: 40px; --ctrl-icon: 18px; }
        .modal-tools { position: absolute; top: 16px; right: 16px; display: flex; gap: 10px; z-index: 4; align-items: center; }
        .ctrl-btn {
          width: var(--ctrl-size); height: var(--ctrl-size);
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.7);
          background: rgba(0,0,0,0.55);
          color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: var(--transition);
          box-shadow: 0 2px 10px rgba(0,0,0,0.45);
          -webkit-tap-highlight-color: transparent;
          line-height: 0; padding: 0; box-sizing: border-box;
        }
        .ctrl-btn:hover { background: rgba(0,0,0,0.7); border-color: #fff; }
        .ctrl-btn svg {
          width: var(--ctrl-icon); height: var(--ctrl-icon);
          stroke: currentColor; fill: none; stroke-width: 2;
          stroke-linecap: round; stroke-linejoin: round;
          display: block; shape-rendering: geometricPrecision;
        }
        .color-modal .close-btn svg { width: var(--ctrl-icon); height: var(--ctrl-icon); }
        .photo-viewer { position: relative; width: 100%; display: grid; grid-template-columns: 56px 1fr 56px; align-items: center; gap: 8px; }
        .photo-stage { width: 100%; background: #000; border-radius: 12px; overflow: hidden; display: grid; place-items: center; }
        .photo-stage img { width: 100%; height: auto; display: block; max-height: 70vh; object-fit: contain; background: #000; transition: transform .25s ease; }
        
        /* Rotate entire viewer to leverage full viewport */
        .color-modal.rotate { position: fixed; inset: 0; width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; background: rgba(0,0,0,0.97); padding: 0; border-radius: 0; }
        .color-modal.rotate .modal-title, .color-modal.rotate .photo-thumbs { display: none; }
        .color-modal.rotate .photo-viewer { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); width: var(--rvh, 100svh); height: var(--rvw, 100svw); transform-origin: center; display: block; }
        /* Place rotate at visual top-right and close at bottom-right when rotated */
        .color-modal.rotate .modal-tools { position: static; }
        .color-modal.rotate .rotate-btn {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 3001;
        }
        .color-modal.rotate .close-btn {
          position: fixed;
          bottom: 12px;
          right: 12px;
          z-index: 3001;
        }
        .color-modal.rotate .photo-viewer { z-index: 1; }
        /* Ensure toolbar container itself doesn't rotate or reposition in rotate mode */
        .color-modal.rotate .modal-tools { position: static; transform: none !important; top: auto; right: auto; left: auto; }
        .color-modal.rotate .photo-stage { position: absolute; inset: 0; }
        .color-modal.rotate .photo-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transform: none; }
        .color-modal.rotate .photo-nav { background: rgba(0,0,0,0.6); }
        /* Rotated mode: arrows at far left/right, vertically centered */
        .color-modal.rotate .photo-nav { position: fixed; top: 50%; transform: translateY(-50%); z-index: 3000; }
        .color-modal.rotate .photo-nav.prev { left: 12px; right: auto; }
        .color-modal.rotate .photo-nav.next { right: 12px; left: auto; }
        .photo-nav { width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.28); background: rgba(0,0,0,0.6); color: #fff; display: grid; place-items: center; cursor: pointer; transition: var(--transition); box-shadow: 0 4px 18px rgba(0,0,0,0.35); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .photo-nav:hover { background: rgba(0,0,0,0.75); border-color: rgba(255,255,255,0.4); }
        .photo-nav.prev { justify-self: start; }
        .photo-nav.next { justify-self: end; }
        .photo-thumbs { margin-top: 12px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
        .photo-thumbs::-webkit-scrollbar { height: 6px; }
        .photo-thumbs::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        .thumb { border: 1px solid var(--border-color); background: transparent; padding: 0; border-radius: 8px; overflow: hidden; cursor: pointer; }
        .thumb img { display: block; height: 64px; width: auto; }
        .thumb.active { outline: 2px solid #fff; }

        /* Mobile-optimized photo viewer */
        @media (max-width: 900px) {
          .color-modal { width: 100vw; max-width: 100vw; padding: 12px; background: transparent; box-shadow: none; }
          .color-modal .modal-title { font-size: 20px; margin-bottom: 10px; text-align: center; }
          .color-modal { --ctrl-size: 36px; --ctrl-icon: 16px; }
          .modal-tools { left: calc(+var(--ctrl-size)); top: 14px; }
          .color-modal .modal-close { top: 14px; right: 14px; }
          .photo-viewer { grid-template-columns: 1fr; position: relative; }
          .photo-stage { background: #000; border-radius: 10px; }
          .photo-stage img { max-height: 82vh; width: 100%; height: auto; object-fit: contain; }
          .photo-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; background: rgba(0,0,0,0.6); }
          .photo-nav.prev { left: 8px; }
          .photo-nav.next { right: 8px; }
          .photo-thumbs { margin-top: 10px; }
          .thumb img { height: 52px; }

          /* Mobile rotate view: keep full-viewport rotated viewer */
          .color-modal.rotate { padding: 0; }
          .color-modal.rotate .photo-viewer { width: var(--rvh, 100svh); height: var(--rvw, 100svw); }
          .color-modal.rotate .photo-stage { position: absolute; inset: 0; }
          .color-modal.rotate .photo-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
          /* Override for rotated on mobile: fixed arrows left/right at 10px */
          .color-modal.rotate .photo-nav { position: fixed; top: 50%; transform: translateY(-50%); z-index: 3000; }
          .color-modal.rotate .photo-nav.prev { left: 10px; right: auto; }
          .color-modal.rotate .photo-nav.next { right: 10px; left: auto; }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .reels-container { padding: 0 20px; }
          .reel-card { width: 260px; min-width: 260px; }
          .color-card { width: 300px; min-width: 300px; }
        }
        @media (max-width: 768px) {
          .mobile-menu-toggle { display: block; }
          .nav-links {
            position: fixed; top: 80px; right: -100%; width: 100%; height: calc(100vh - 80px);
            background: var(--dark-bg); flex-direction: column; padding: 40px; gap: 30px; transition: right 0.3s ease;
            border-top: 1px solid var(--border-color); z-index: 1001;
          }
          .nav-links.mobile-open { right: 0; }
          .nav-links button { font-size: 20px; width: 100%; text-align: left; }
          .mobile-scrim { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
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
        /* Desktop: pin individual buttons so close is flush-right, rotate to its left */
        @media (min-width: 901px) {
          .color-modal:not(.rotate) .modal-tools { position: static; }
          .color-modal:not(.rotate) .close-btn { position: fixed; top: 24px; right: 24px; z-index: 3001; }
          .color-modal:not(.rotate) .rotate-btn { position: fixed; top: 24px; right: calc(24px + var(--ctrl-size) + 10px); z-index: 3001; }
        }
        /* Mobile toolbar sizing and rotated placement */
        @media (max-width: 900px) {
          .color-modal { --ctrl-size: 36px; --ctrl-icon: 16px; }
          .color-modal.rotate .rotate-btn { top: 10px; right: 10px; }
          .color-modal.rotate .close-btn { bottom: 10px; right: 10px; }
        }
          /* Add these pagination styles to your existing CSS */

/* Pagination Styles - Mobile Only */
@media (max-width: 900px) {
  .projects-grid.mobile-paginated {
    min-height: auto;
    padding-bottom: 0;
  }

  /* Ensure consistent height for projects section */
  .projects-section {
    height: auto;
    min-height: 100vh; /* Maintain minimum height */
  }

  .projects-scroll-container {
    overflow-y: visible;
    max-height: none;
    min-height: 400px; /* Prevent container from collapsing */
  }

  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 40px;
    padding: 20px 0 40px; /* Add bottom padding */
  }

  .pagination-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.25);
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .pagination-btn:hover:not(:disabled) {
    background: rgba(0,0,0,0.75);
    border-color: rgba(255,255,255,0.35);
  }

  .pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .pagination-numbers {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pagination-num {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
  }

  .pagination-num:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .pagination-num.active {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .pagination-dots {
    color: var(--text-secondary);
    font-size: 14px;
    padding: 0 4px;
  }

  /* Remove scrollbar styles on mobile paginated view */
  .projects-section {
    height: auto;
    min-height: auto;
  }

  .projects-scroll-container {
    overflow-y: visible;
    max-height: none;
  }
}

/* Hide pagination on desktop */
@media (min-width: 901px) {
  .pagination-controls {
    display: none;
  }
}

/* Small mobile adjustments */
@media (max-width: 480px) {
  .pagination-controls {
    gap: 4px;
    margin-top: 30px;
  }

  .pagination-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .pagination-num {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
    padding: 0 8px;
  }

  .pagination-numbers {
    gap: 2px;
  }
}
      `}</style>
    </>
  );
};

export default App;
