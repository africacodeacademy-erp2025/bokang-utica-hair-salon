import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>
            Beautiful <span>Hairstyles</span> <br />
            Crafted with Care
          </h1>

          <p>
            Bokang Utica Hair Salon offers professional braiding, natural hair
            care, and modern protective styles designed to enhance your beauty
            and confidence.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/customer")}>
              View Hairstyles
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/admin/login")}
            >
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* ================= INFO SECTION ================= */}
      <section className="info-section">
        <h2>Why Choose Bokang Utica?</h2>

        <div className="info-grid">
          <div className="info-card">
            <h3>Professional Styling</h3>
            <p>
              We specialize in neat, long-lasting styles created with precision
              and care.
            </p>
          </div>

          <div className="info-card">
            <h3>Client Comfort</h3>
            <p>
              Your comfort matters. We create styles that are both beautiful and
              gentle on your scalp.
            </p>
          </div>

          <div className="info-card">
            <h3>Trusted & Reliable</h3>
            <p>
              Our clients trust us for quality, consistency, and excellent
              service.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="contact-section">
        <h2>Contact Us</h2>

        <div className="contact-items">
          <div className="contact-item">
            <MdEmail className="contact-icon email" />
            <a href="mailto:bokang262@gmail.com">bokang262@gmail.com</a>
          </div>

          <div className="contact-item">
            <FaWhatsapp className="contact-icon whatsapp" />
            <a href="https://wa.me/26663250668" target="_blank">
              +266 6325 0668
            </a>
          </div>

          <div className="contact-item">
            <FaWhatsapp className="contact-icon whatsapp" />
            <a href="https://wa.me/26657642622" target="_blank">
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
