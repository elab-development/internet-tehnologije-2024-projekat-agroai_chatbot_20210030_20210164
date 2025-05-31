import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-left">
          <div className="discount-badge">
            <span role="img" aria-label="tractor">🚜</span> 20% Off Your First Month of AgroAI
          </div>

          <h1 className="hero-title">
            The Future of <span className="highlight">Smart Farming</span>.
          </h1>

          <p className="hero-text">
            AgroAI leverages cutting-edge machine learning to deliver real-time insights on soil health,&nbsp;
            optimal planting schedules, and crop rotation strategies. Increase yields, reduce waste, and&nbsp;
            make data-driven decisions for a more sustainable harvest.
          </p>

          <button
            className="get-started-btn"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>

        <div className="hero-right">

          {/* The robot image (now larger and in front) */}
          <img
            src="/images/agroai-bot.png"
            alt="AI agriculture robot"
            className="cards"
          />
        </div>
      </section>
    </div>
  );
}
