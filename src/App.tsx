import React, { useRef, useState, useEffect } from "react";
import projects from "./projects.json";

interface Project {
  id: number;
  title: string;
  secondaryTitle: string;
  videoUrl: string;
  type: string;
  thumbnail?: string;
}

interface ProjectsData {
  data: Project[];
}

const App = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (
    ref: React.MutableRefObject<HTMLDivElement | null>,
    section: React.SetStateAction<string>
  ) => {
    if (ref.current) {
      // Add offset to account for the navbar height
      const navbarHeight = 64;
      const yOffset = -navbarHeight;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(section);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 80; // Adjusted to account for navbar
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <img
              style={{ zIndex: 9999, position: "absolute", top: 15 }}
              src="/Koral/WHITE.png"
              alt="Koral Dayan"
              className="logo"
              width={100}
            />
          </div>

          <div className="nav-links">
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
        <section ref={homeRef} className="section">
          <div className="section-content">
            <h1 className="homeTitle">Video Editor & Color Grader</h1>
            <img
              src="/Koral/BLACK.png"
              alt="Koral Dayan"
              width={100}
              height={100}
            />

            <p className="subtitle">
              Transforming visions into cinematic reality
            </p>
          </div>
        </section>

        <section ref={projectsRef} className="section gray-bg projects-section">
          <div className="projects-header">
            <h2>Projects</h2>
          </div>
          <div className="projects-scroll-container" ref={projectsGridRef}>
            <div className="projects-grid">
              {projects.data.map((project) => (
                <div
                  key={project.id}
                  className="project-item"
                  onClick={() => openModal(project)}
                >
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
                  <div className="project-overlay">
                  <div className="project-info">
                    <div className="project-title">{project.title}</div>
                    <div className="secondary-title">
                    {project.secondaryTitle}
                    </div>
                    <div className="project-type">
                    {project.type === "both" ? (
                      <>
                      <div className="type-bar colorGrading" />
                      <span>Color Grading</span>
                      <div className="type-bar videoEditing" />
                      <span>Video Editing</span>
                      </>
                    ) : project.type === "colorGrading" ? (
                      <>
                      <div className="type-bar colorGrading" />
                      <span>Color Grading</span>
                      </>
                    ) : (
                      <>
                      <div className="type-bar videoEditing" />
                      <span>Video Editing</span>
                      </>
                    )}
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={aboutRef} className="section">
          <div className="section-content">
            <h2>About</h2>
            <div className="about-text">
              <p>
                I'm Koral Dayan Cohen, a passionate video editor, director,
                colorist, and producer. I specialize in crafting compelling
                stories from concept to completion, balancing both creative
                vision and technical excellence. With meticulous attention to
                detail and a deep commitment to narrative, I bring each frame to
                life, turning raw footage into powerful, engaging content. My
                experience spans diverse projects—including documentaries,
                narrative films, and beyond. I firmly believe in the emotional
                power of video storytelling, and I'm dedicated to creating
                content that resonates deeply with audiences. For me, every
                frame counts, and every project receives the full heart and
                passion it deserves.
              </p>
            </div>
          </div>
        </section>

        <section ref={contactRef} className="section gray-bg">
          <div className="section-content">
            <h2>Contact</h2>
            <form
              className="contact-form"
              action="https://formsubmit.co/koraldayancohen@gmail.com"
              method="POST"
            >
              <input type="text" name="name" placeholder="Name" required />
              <input type="email" name="email" placeholder="Email" required />
              <textarea
                name="message"
                placeholder="Message"
                rows={4}
                required
              ></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </section>
      </main>

      {isModalOpen && currentProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{currentProject.title}</h3>
            <iframe
              src={currentProject.videoUrl}
              width="100%"
              height="480"
              frameBorder="0"
              allow="autoplay"
              title="Project Video"
            ></iframe>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background-color: black;
          color: white;
          font-family: 'Jost', sans-serif;
          width: 100%;
          overflow-x: hidden;
        }
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          height: 64px;
        }
        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          height: 64px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
        }
        .nav-links {
          display: flex;
          gap: 32px;
        }
        .nav-links button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          position: relative;
          padding-bottom: 4px;
        }
        .nav-links button:hover {
          color: #cccccc;
        }
        .nav-links button.active {
          color: white;
          border-bottom: 2px solid white;
        }
        .section {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
          padding-top: 24px; /* Add padding to account for fixed navbar */
        }

        /* Home section keeps original padding */
        section:first-of-type .section-content {
          padding-top: 40px;
        }

        /* Other sections get less top padding */
        .section-content {
          width: 100%;
          max-width: 100%;
          padding: 20px 40px 40px 40px;
          overflow-y: auto;
          max-height: 100vh;
        }

        .projects-section {
          height: calc(100vh - 64px);
          width: 100vw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .projects-header {
          padding: 0px 40px 20px 40px; /* Reduced top padding */
          text-align: left;
          width: 100%;
        }
        
        .projects-scroll-container {
          flex: 1;
          overflow-y: auto;
          padding: 0 40px 40px 40px;
          width: 100%;
          max-height: calc(100vh - 160px); /* Account for navbar and header */
          scrollbar-width: thin;
        }
        
        .projects-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .projects-scroll-container::-webkit-scrollbar-track {
          background: #222;
        }
        
        .projects-scroll-container::-webkit-scrollbar-thumb {
          background-color: #444;
          border-radius: 6px;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }
        
        h2 {
          padding: 0;
          margin-bottom: 20px; /* Added margin below headings */
        }
        .homeTitle{
        padding-top:48px;
        }

        .project-item {
          cursor: pointer;
          position: relative;
          height: 220px;
          width: 100%;
          overflow: hidden;
          background-color: #000;
          border-radius: 4px;
          transition: transform 0.3s ease;
          margin-bottom: 0;
        }
        .project-item:hover {
          transform: scale(1.02);
        }
        .project-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .project-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          overflow: hidden;
          width: 100%;
          height: 0;
          transition: height 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .project-item:hover .project-overlay {
          height: 100%;
        }
        .project-info {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          position: relative;
          transform: translateY(50px);
          transition: transform 0.5s ease;
        }
        .project-item:hover .project-info {
          transform: translateY(0);
        }
        .project-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .secondary-title {
          font-size: 14px;
          color: #cccccc;
          margin-bottom: 16px;
        }
        .project-type {
          font-size: 12px;
          color: #cccccc;
          display: flex;
          align-items: center;
          gap: 6px;
          position: absolute;
          bottom: 10px;
          left: 10px;
        }
        .type-bar {
          width: 6px;
          height: 16px;
        }
        @media (max-width: 1200px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .project-item {
            height: 200px;
          }
        }
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: repeat(1, 1fr);
          }
          .project-item {
            height: 180px;
          }
          .projects-section {
            height: auto;
          }
          .projects-header,
          .projects-scroll-container {
            padding-left: 16px;
            padding-right: 16px;
          }
          .section-content {
            padding: 20px 16px;
          }
        }
        .colorGrading {
          background-color: #d89d9d;
        }
        .videoEditing {
          background-color: #7f9aeb;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .modal {
          background-color: black;
          padding: 40px;
          border-radius: 12px;
          max-width: 95%;
          width: 1200px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: center;
        }
        video {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }
        iframe {
          width: 100%;
          height: 600px;
        }
        .contact-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .contact-form input,
        .contact-form textarea {
          width: 100%;
          padding: 12px;
          background-color: black;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          outline: none;
        }
        .contact-form input:focus,
        .contact-form textarea:focus {
          border-color: white;
        }
        .contact-form button {
          width: 100%;
          padding: 12px;
          background-color: white;
          color: black;
          border: none;
          cursor: pointer;
        }
        .contact-form button:hover {
          background-color: #cccccc;
        }
        .gray-bg {
          background-color: #111;
        }
      `}</style>
    </>
  );
};

export default App;