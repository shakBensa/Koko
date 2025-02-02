import React, { useRef, useState } from 'react';
// import Logo from '/Koral/BLACK.png';
const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<{
    id: number;
    title: string;
    secondaryTitle: string;
    videoUrl: string;
    type: string;
    thumbnail?: string;
  } | null>(null);
  // Object mapping project id to thumbnail image URL

  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      id: 1,
      title: "Project 1",
      secondaryTitle: "PSYCHO PATH",
      videoUrl:
        "https://drive.google.com/file/d/1wrIPFZCeCS64R647xf2tPEC4eHF83xjB/preview",
      type: "colorGrading",
      // Uncomment or add a thumbnail property here if available.
      // thumbnail: 'https://example.com/path-to-thumbnail.jpg'
    },
    {
      id: 2,
      title: "Project 2",
      secondaryTitle: "On My Dead Body",
      videoUrl:
        "https://drive.google.com/file/d/1NcEoYFfhHTpNUUUO7anT6zi84fXGShfc/preview",
      type: "colorGrading",
    },
    {
      id: 3,
      title: "Project 3",
      secondaryTitle: "BZAAT",
      videoUrl: "https://drive.google.com/file/d/1ksWIn-aj2DYZNO59FwEGSgPv12VDv7uu/preview",
      type: "both",
    },
    {
      id: 4,
      title: "Project 4",
      secondaryTitle: "Dj Nati",
      videoUrl: "https://drive.google.com/file/d/1kGtaVMiIGgWIhqvZ_c7t9JfT2jdxXhQw/preview",
      type: "both",
    },
    {
      id: 5,
      title: "Project 5",
      secondaryTitle: "Shava Beshava",
      videoUrl: "https://drive.google.com/file/d/1eykoue_888_KYpgovIGnZXq3faUH2GKK/preview",
      type: "videoEditing",
    },
    {
      id: 6,
      title: "Project 6",
      secondaryTitle: "MA MERE",
      videoUrl: "https://drive.google.com/file/d/17xch-nYc7jcwhkODy8Kxan4JFgdEpqsU/view?usp=sharing",
      type: "videoEditing",
    },
    {
      id: 7,
      title: "Project 7",
      secondaryTitle: "Techonoso Tel Heshomer",
      videoUrl: "https://drive.google.com/file/d/1HBKAYfLh6KWaHNmqPVGS4yJdE_ykduuQ/preview",
      type: "both",
    },
    {
      id: 8,
      title: "Project 8",
      secondaryTitle: "Or Koplis MasterClass",
      videoUrl: "https://drive.google.com/file/d/1gD5-AKKwM9X6rRnlQ_DYwi2U9kwIx5Kh/preview",
      type: "videoEditing",
      thumbnail: "https://via.placeholder.com/300x200?text=No+Thumbnail",
    },
    {
      id:9,
      title: "Project 9",
      secondaryTitle: "Tempto",
      videoUrl: "https://drive.google.com/file/d/1lYaqLrncerMDMoIT2-O-cAWFjMKA4xGn/view?usp=sharing",
      type: "videoEditing",

    }
  ];

  const scrollToSection = (
    ref: React.MutableRefObject<HTMLDivElement | null>,
    section: React.SetStateAction<string>
  ) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(section);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const sections = [
        { ref: homeRef, id: 'home' },
        { ref: projectsRef, id: 'projects' },
        { ref: aboutRef, id: 'about' },
        { ref: contactRef, id: 'contact' },
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generates a thumbnail image from a video URL by capturing a frame.
  // Note: The video source must support CORS; otherwise, this will fail.

  // On mount, generate thumbnails for projects that don't have a thumbnail property.


  const openModal = (project: {
    id: number;
    title: string;
    secondaryTitle: string;
    videoUrl: string;
    type: string;
    thumbnail?: string;
  }) => {
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
            style={{zIndex:9999, position: "absolute",top:15}}
            src="/Koral/WHITE.png"
            alt="Koral Dayan"
            className="logo"
            width={100}
            // height={50}
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
            <h1>Video Editor & Color Grader</h1>
            <img
            // style={{ position: "absolute", top: "25px" }}
            src="/Koral/BLACK.png"
            alt="Koral Dayan"
            // className="logo"
            width={100}
            height={100}
          />

            <p className="subtitle">
              Transforming visions into cinematic reality
            </p>
          </div>
        </section>

        <section ref={projectsRef} className="section gray-bg projects-section">
          <div className="section-content">
            <h2>Projects</h2>
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-item"
                  onClick={() => openModal(project)}
                >
                  {/* Render the thumbnail image */}
                  {project.thumbnail && (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        marginBottom: "8px",
                      }}
                    />
                  )}
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
              ))}
            </div>
          </div>
        </section>

        <section ref={aboutRef} className="section">
          <div className="section-content">
            <h2>About</h2>
            <div className="about-text">
              <p>
                Professional video editor and color grader with expertise in
                creating compelling visual narratives.
              </p>
              <p>
                Specializing in feature films, commercials, and music videos.
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
            {/* <button className="close-modal" onClick={closeModal}>
          X
        </button> */}
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
          align-items: center;
          justify-content: center;
        }
        .section-content {
          max-width: 1400px;
          width: 90%;
          margin: 0 auto;
          padding: 20px;
        }
        .projects-section {
          min-height: unset;
          height: 100vh;
          padding: 64px 0;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
        }
        .section-content {
          width: 100%;
          margin: 0;
          padding: 0 32px;
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        h2 {
          padding: 0 32px;
        }
        .project-item {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 16px;
          cursor: pointer;
          transition: transform 0.3s ease, background-color 0.3s ease;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          position: relative;
          height: 170px;
          width: 100%;
        }
        .project-item:hover {
          transform: scale(1.02);
          background-color: rgba(255, 255, 255, 0.15);
        }
        .project-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .secondary-title {
          font-size: 14px;
          color: #cccccc;
          margin-bottom: 8px;
        }
        .project-type {
          font-size: 12px;
          color: #cccccc;
          display: flex;
          align-items: center;
          gap: 6px;
          position: absolute;
          bottom: 8px;
          left: 8px;
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
            height: 140px;
          }
        }
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: repeat(1, 1fr);
          }
          .project-item {
            height: 120px;
          }
          .projects-section {
            height: auto;
            padding: 80px 0;
          }
          .section-content {
            padding: 0 16px;
          }
          h2 {
            padding: 0 16px;
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
          max-width: 900px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: center;
        }
        .close-modal {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
        }
        video {
          width: 100%;
          height: auto;
          border-radius: 8px;
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
      `}</style>
    </>
  );
};

export default App;
