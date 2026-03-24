import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll-triggered animations using IntersectionObserver
    const faders = document.querySelectorAll(
      ".fade-up, .slide-down, .fade-in"
    );

    const appearOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const appearOnScroll = new IntersectionObserver(
      function (entries, appearOnScroll) {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("appear");
          appearOnScroll.unobserve(entry.target);
        });
      },
      appearOptions
    );

    faders.forEach((fader) => {
      appearOnScroll.observe(fader);
    });
  }, []);

  return (
    <>
      {/* ================= WHITE HEADER ================= */}
      <header className="landing-header fade-in">
        <div className="header-logo" onClick={() => navigate("/")}>
          BOKANG UTICA HAIR SALON
        </div>

        <button
          className="header-auth-btn"
          onClick={() => navigate("/auth")}
        >
          Sign In / Sign Up
        </button>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1 className="fade-up delay-1">
            Beautiful <span>Hairstyles</span> <br />
            Crafted with Care
          </h1>

          <p className="fade-up delay-2">
            Professional braiding, natural hair care and protective styles
            designed to enhance your beauty and confidence.
          </p>

          <div className="hero-buttons fade-up delay-3">
            <button onClick={() => navigate("/hairstyles")}>
              Explore Hairstyles
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/auth")}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </section>

      {/* ================= INFO SECTION ================= */}
      <section className="info-section">
        <h2 className="fade-up delay-1">Why Choose Bokang Utica?</h2>

        <div className="info-grid">
          <div className="info-card fade-up delay-2">
            <h3>Professional Styling</h3>
            <p>
              Neat, long-lasting hairstyles created with precision and care.
            </p>
          </div>

          <div className="info-card fade-up delay-3">
            <h3>Client Comfort</h3>
            <p>
              We create styles that are beautiful, comfortable and gentle on
              your scalp.
            </p>
          </div>

          <div className="info-card fade-up delay-4">
            <h3>Trusted Service</h3>
            <p>
              Our clients trust us for quality work, reliability and excellent
              customer care.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="contact-section">
        <h2 className="fade-up delay-1">Contact Us</h2>

        <div className="contact-items fade-up delay-2">
          <div className="contact-item">
            <MdEmail className="contact-icon email" />
            <a href="mailto:bokang262@gmail.com">bokang262@gmail.com</a>
          </div>

          <div className="contact-item">
            <FaWhatsapp className="contact-icon whatsapp" />
            <a
              href="https://wa.me/26663250668"
              target="_blank"
              rel="noreferrer"
            >
              +266 6325 0668
            </a>
          </div>

          <div className="contact-item">
            <FaWhatsapp className="contact-icon whatsapp" />
            <a
              href="https://wa.me/26657642622"
              target="_blank"
              rel="noreferrer"
            >
              +266 5764 2622
            </a>
          </div>

          <div className="contact-item">
            <FaPhoneAlt className="contact-icon phone" />
            <a href="tel:+26651601010">+266 5160 1010</a>
          </div>
        </div>
      </section>
    </>
  );
}