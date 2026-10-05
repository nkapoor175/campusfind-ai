import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  HeartHandshake,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  BackpackIllustration,
  WaterBottleIllustration,
  HeadphonesIllustration,
  KeysIllustration,
  PhoneIllustration,
  CampusMascot,
  MatchSparkleIllustration,
} from '../assets/illustrations/IllustratedIcons';
import { CAMPUS_CATEGORIES } from '../services/seedData';

export default function LandingPage({ onNavigate }) {
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('lost-items');
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Report Your Item',
      desc: 'Snap a photo or describe the item details, colors, and where it was last seen on campus.',
      icon: PlusCircle,
      color: 'coral',
    },
    {
      step: '02',
      title: 'AI Matches Reports',
      desc: 'Our semantic & vision matcher compares lost reports against campus found turn-ins in real-time.',
      icon: Sparkles,
      color: 'peach',
    },
    {
      step: '03',
      title: 'Claim & Verify',
      desc: 'Receive an instant notification, review the match candidate, and submit an ownership claim.',
      icon: ShieldCheck,
      color: 'sage',
    },
    {
      step: '04',
      title: 'Reunited Safely!',
      desc: 'Show your campus ID to Security Admin, pick up your item, and mark the report resolved.',
      icon: HeartHandshake,
      color: 'blue',
    },
  ];

  return (
    <div className="landing-page-wrap fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="app-container hero-inner">
          <div className="hero-text-col">
            <div className="hero-badge-pill animate-soft-pulse">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Campus Lost &amp; Found Reimagined</span>
            </div>

            <h1 className="hero-headline">
              Lost something on campus? <br />
              <span className="headline-highlight">We’ll help you find it.</span>
            </h1>

            <p className="hero-subtext">
              From water bottles left in the library to earbuds dropped near the canteen —
              CampusFind AI connects lost items with honest finders using smart text &amp; visual matching.
            </p>

            {/* Quick Action CTAs */}
            <div className="hero-cta-group">
              <Button
                variant="primary"
                size="lg"
                icon={PlusCircle}
                onClick={() => onNavigate('report-lost')}
              >
                I Lost Something
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('report-found')}
              >
                I Found Something
              </Button>
            </div>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="hero-search-box">
              <Search size={18} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Search lost &amp; found items (e.g., Milton bottle, Casio calculator)..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-btn pressable">
                Search Items
              </button>
            </form>
          </div>

          {/* Hero Visual Mascot & Floating Doodles */}
          <div className="hero-visual-col">
            <div className="mascot-stage-card blob-card-1">
              <div className="mascot-center animate-float">
                <CampusMascot size={150} />
              </div>

              {/* Floating cute campus items */}
              <div className="floating-item float-item-1 animate-float">
                <BackpackIllustration size={62} />
              </div>
              <div className="floating-item float-item-2 animate-float-reverse">
                <HeadphonesIllustration size={58} />
              </div>
              <div className="floating-item float-item-3 animate-float">
                <WaterBottleIllustration size={54} />
              </div>
              <div className="floating-item float-item-4 animate-float-reverse">
                <KeysIllustration size={52} />
              </div>

              {/* Match Callout Bubble */}
              <div className="hero-match-callout animate-soft-pulse">
                <Sparkles size={16} className="callout-sparkle" />
                <div>
                  <span className="callout-title">AI Match Found!</span>
                  <span className="callout-desc">94% similarity score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Stats Banner */}
      <section className="stats-banner-section">
        <div className="app-container stats-grid">
          <div className="stat-pill-box">
            <span className="stat-big-num">240+</span>
            <span className="stat-text-desc">Items Reunited on Campus</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-big-num">&lt; 3 hrs</span>
            <span className="stat-text-desc">Average Match Notification</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-big-num">95%</span>
            <span className="stat-text-desc">AI Scoring Precision</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-big-num">100%</span>
            <span className="stat-text-desc">Verified Admin Handover</span>
          </div>
        </div>
      </section>

      {/* 4-Step Interactive Workflow */}
      <section className="workflow-section">
        <div className="app-container">
          <div className="section-header text-center">
            <span className="section-eyebrow">How It Works</span>
            <h2 className="section-title">From Lost to Found in 4 Gentle Steps</h2>
            <p className="section-subtitle">
              A transparent, safe workflow connecting students, finders, and campus security.
            </p>
          </div>

          <div className="workflow-grid">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className={`workflow-step-card step-color-${step.color} fade-in`}>
                  <div className="step-num-bubble">{step.step}</div>
                  <div className="step-icon-wrap">
                    <StepIcon size={24} />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Matching Feature Showcase */}
      <section className="ai-showcase-section">
        <div className="app-container ai-showcase-inner">
          <div className="ai-showcase-media">
            <div className="ai-mockup-card blob-card-2">
              <div className="ai-mockup-header">
                <Sparkles size={18} className="ai-sparkle-gold" />
                <span>Live Similarity Matrix</span>
                <span className="live-status-dot" />
              </div>

              <div className="ai-comparison-preview">
                <div className="ai-item-preview">
                  <span className="preview-label">Reported Lost</span>
                  <WaterBottleIllustration size={58} />
                  <p className="preview-name">Milton Steel Flask</p>
                  <span className="preview-tag">Blue · Library</span>
                </div>

                <div className="ai-match-meter">
                  <MatchSparkleIllustration size={64} />
                  <span className="meter-score">94%</span>
                  <span className="meter-label">Match Score</span>
                </div>

                <div className="ai-item-preview">
                  <span className="preview-label">Handed In</span>
                  <WaterBottleIllustration size={58} />
                  <p className="preview-name">Steel Water Bottle</p>
                  <span className="preview-tag">Blue · Reading Hall</span>
                </div>
              </div>

              <div className="ai-breakdown-tags">
                <span className="badge badge-sage">✓ Category: Accessories</span>
                <span className="badge badge-sage">✓ Color: Blue</span>
                <span className="badge badge-sage">✓ Location: Library 2nd Fl</span>
              </div>
            </div>
          </div>

          <div className="ai-showcase-text">
            <span className="section-eyebrow">Smart Campus Technology</span>
            <h2 className="section-title">AI Matching That Actually Understands Campus Life</h2>
            <p className="section-desc">
              When items get reported, our matching engine analyzes category semantics, colors, brands, and campus building proximity.
            </p>
            <ul className="ai-benefits-list">
              <li>
                <CheckCircle2 size={18} className="benefit-check" />
                <span><strong>No manual scrolling:</strong> Instant notifications as soon as a candidate item is logged.</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="benefit-check" />
                <span><strong>Fraud-resistant:</strong> Security Admin reviews claim proofs and verifies college ID cards.</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="benefit-check" />
                <span><strong>Privacy focused:</strong> Contact details are protected until claims are officially approved.</span>
              </li>
            </ul>

            <div className="ai-cta-row">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('dashboard')}
              >
                Go to Student Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Category Explorer */}
      <section className="categories-section">
        <div className="app-container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Browse by Item</span>
            <h2 className="section-title">Commonly Misplaced Campus Essentials</h2>
            <p className="section-subtitle">
              Click any category to view recent lost and found reports.
            </p>
          </div>

          <div className="categories-grid">
            <div className="cat-card pressable" onClick={() => onNavigate('lost-items')}>
              <BackpackIllustration size={54} />
              <h4>Bags &amp; Backpacks</h4>
              <p>Wildcraft, Skybags, Tote bags</p>
            </div>
            <div className="cat-card pressable" onClick={() => onNavigate('lost-items')}>
              <HeadphonesIllustration size={54} />
              <h4>Electronics &amp; Audio</h4>
              <p>Earphones, AirPods, Chargers</p>
            </div>
            <div className="cat-card pressable" onClick={() => onNavigate('lost-items')}>
              <WaterBottleIllustration size={54} />
              <h4>Flasks &amp; Bottles</h4>
              <p>Milton, Hydro Flask, Tupperware</p>
            </div>
            <div className="cat-card pressable" onClick={() => onNavigate('lost-items')}>
              <KeysIllustration size={54} />
              <h4>Keys &amp; IDs</h4>
              <p>Hostel room keys, RFID badges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-section">
        <div className="app-container">
          <div className="cta-banner-box blob-card-1">
            <h2 className="cta-title">Ready to find your favorite thing?</h2>
            <p className="cta-desc">
              Join students and campus security admins working together to return misplaced items.
            </p>
            <div className="cta-buttons-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('report-lost')}
              >
                Report Lost Item
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('login')}
              >
                Sign In to CampusFind
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page-wrap {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          padding-bottom: 2rem;
        }
        /* Hero */
        .hero-section {
          padding: 3rem 0 2rem 0;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          gap: 3.5rem;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--coral-100);
          color: var(--coral-600);
          border: 1px solid rgba(224, 109, 83, 0.25);
          padding: 0.35rem 0.95rem;
          border-radius: var(--radius-pill);
          font-size: 0.84rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }
        .sparkle-icon {
          color: var(--coral-500);
        }
        .hero-headline {
          font-size: clamp(2.4rem, 4.5vw, 3.4rem);
          font-weight: 800;
          color: var(--charcoal-900);
          line-height: 1.15;
          margin-bottom: 1.25rem;
          letter-spacing: -0.03em;
        }
        .headline-highlight {
          color: var(--coral-500);
          position: relative;
        }
        .hero-subtext {
          font-size: 1.1rem;
          color: var(--charcoal-600);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 520px;
        }
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .hero-search-box {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 2px solid var(--border-warm);
          border-radius: var(--radius-pill);
          padding: 0.4rem 0.5rem 0.4rem 1.25rem;
          width: 100%;
          max-width: 520px;
          box-shadow: var(--shadow-md);
        }
        .hero-search-icon {
          color: var(--coral-500);
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        .hero-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.92rem;
          color: var(--charcoal-900);
          font-family: inherit;
        }
        .hero-search-btn {
          background-color: var(--coral-500);
          color: #FFFFFF;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        /* Mascot Stage */
        .hero-visual-col {
          display: flex;
          justify-content: center;
        }
        .mascot-stage-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          height: 420px;
          background: linear-gradient(145deg, #FFFDF9, #FCE8DB);
          border: 2px solid var(--peach-200);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mascot-center {
          z-index: 2;
          filter: drop-shadow(0 12px 24px rgba(68, 38, 28, 0.12));
        }
        .floating-item {
          position: absolute;
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 0.5rem;
          box-shadow: var(--shadow-md);
          z-index: 3;
        }
        .float-item-1 { top: 25px; left: 20px; }
        .float-item-2 { top: 35px; right: 25px; }
        .float-item-3 { bottom: 35px; left: 25px; }
        .float-item-4 { bottom: 45px; right: 25px; }
        .hero-match-callout {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          border: 2px solid var(--peach-400);
          border-radius: var(--radius-pill);
          padding: 0.5rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          box-shadow: var(--shadow-lg);
          z-index: 4;
          white-space: nowrap;
        }
        .callout-sparkle { color: #E39D38; }
        .callout-title {
          font-weight: 800;
          font-size: 0.85rem;
          color: var(--charcoal-900);
          display: block;
        }
        .callout-desc {
          font-size: 0.75rem;
          color: var(--sage-600);
          font-weight: 700;
        }
        /* Stats */
        .stats-banner-section {
          background-color: #FFFFFF;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          padding: 1.75rem 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          text-align: center;
        }
        .stat-big-num {
          display: block;
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--coral-500);
          line-height: 1;
          margin-bottom: 0.35rem;
        }
        .stat-text-desc {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal-600);
        }
        /* Workflow */
        .section-header {
          margin-bottom: 2.5rem;
        }
        .section-eyebrow {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--coral-500);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.4rem;
        }
        .section-title {
          font-size: clamp(1.75rem, 3vw, 2.35rem);
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.5rem;
        }
        .section-subtitle {
          font-size: 1rem;
          color: var(--charcoal-600);
          max-width: 500px;
          margin: 0 auto;
        }
        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .workflow-step-card {
          position: relative;
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2rem 1.25rem 1.5rem 1.25rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }
        .step-num-bubble {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--charcoal-900);
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 10px;
          border-radius: var(--radius-pill);
        }
        .step-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin: 0 auto 1rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-color-coral .step-icon-wrap { background: var(--coral-100); color: var(--coral-500); }
        .step-color-peach .step-icon-wrap { background: var(--peach-200); color: #934612; }
        .step-color-sage .step-icon-wrap { background: var(--sage-100); color: var(--sage-600); }
        .step-color-blue .step-icon-wrap { background: var(--dusty-blue-100); color: var(--dusty-blue-600); }
        .step-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
          color: var(--charcoal-900);
        }
        .step-desc {
          font-size: 0.86rem;
          color: var(--charcoal-600);
          line-height: 1.45;
          margin: 0;
        }
        /* AI Showcase */
        .ai-showcase-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 3.5rem;
        }
        .ai-mockup-card {
          background: #FFFFFF;
          border: 2px solid var(--peach-200);
          box-shadow: var(--shadow-lg);
          padding: 1.75rem;
        }
        .ai-mockup-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--charcoal-900);
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.75rem;
        }
        .ai-sparkle-gold { color: #E39D38; }
        .live-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--sage-500);
          margin-left: auto;
        }
        .ai-comparison-preview {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 0.85rem;
          background: var(--cream-soft);
          border-radius: var(--radius-lg);
          padding: 1.25rem 0.85rem;
          margin-bottom: 1.25rem;
        }
        .ai-item-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .preview-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--charcoal-400);
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }
        .preview-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin: 0.35rem 0 0.15rem 0;
        }
        .preview-tag {
          font-size: 0.74rem;
          color: var(--charcoal-600);
        }
        .ai-match-meter {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .meter-score {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: #934612;
          line-height: 1;
        }
        .meter-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--charcoal-400);
          text-transform: uppercase;
        }
        .ai-breakdown-tags {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .ai-showcase-text {
          text-align: left;
        }
        .section-desc {
          font-size: 1.05rem;
          color: var(--charcoal-600);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .ai-benefits-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }
        .ai-benefits-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.95rem;
          color: var(--charcoal-800);
        }
        .benefit-check {
          color: var(--sage-500);
          flex-shrink: 0;
          margin-top: 2px;
        }
        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .cat-card {
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1.75rem 1.25rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }
        .cat-card h4 {
          font-size: 1.1rem;
          color: var(--charcoal-900);
          margin: 0.75rem 0 0.25rem 0;
        }
        .cat-card p {
          font-size: 0.82rem;
          color: var(--charcoal-400);
          margin: 0;
        }
        /* Bottom CTA */
        .cta-banner-box {
          background: linear-gradient(135deg, #E06D53, #C9563E);
          color: #FFFFFF;
          padding: 3.5rem 2rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
        }
        .cta-title {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          color: #FFFFFF;
          margin-bottom: 0.75rem;
        }
        .cta-desc {
          font-size: 1.05rem;
          color: #FFE6DF;
          max-width: 520px;
          margin: 0 auto 2rem auto;
        }
        .cta-buttons-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .cta-buttons-row .btn-primary {
          background: #FFFFFF;
          color: var(--coral-600);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .cta-buttons-row .btn-outline {
          background: transparent;
          color: #FFFFFF;
          border-color: #FFFFFF;
        }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; text-align: center; }
          .hero-text-col { align-items: center; text-align: center; }
          .hero-search-box { margin: 0 auto; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .workflow-grid { grid-template-columns: repeat(2, 1fr); }
          .ai-showcase-inner { grid-template-columns: 1fr; }
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .workflow-grid { grid-template-columns: 1fr; }
          .categories-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
