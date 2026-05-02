/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider, TweakColor, TweakToggle */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- PLACEHOLDER (cinematic striped frame) ---------------- */
function Plate({ label, ratio = "16 / 9", tone = "warm", className = "", style = {}, children }) {
  // tone: warm / cool / neutral / dark
  const grads = {
    warm: "linear-gradient(135deg, #2a1a14 0%, #432418 40%, #1a0e08 100%)",
    cool: "linear-gradient(135deg, #0c1424 0%, #1a2740 50%, #07101e 100%)",
    neutral: "linear-gradient(135deg, #1a1a22 0%, #2a2a36 50%, #0e0e16 100%)",
    dark: "linear-gradient(135deg, #08081a 0%, #14142a 50%, #03030d 100%)",
    amber: "linear-gradient(135deg, #2b1408 0%, #5a2812 50%, #1a0a04 100%)"
  };
  return (
    <div
      className={`op-plate ${className}`}
      style={{
        aspectRatio: ratio,
        background: grads[tone] || grads.neutral,
        ...style
      }}>
      
      <div className="op-plate__stripes" />
      <div className="op-plate__grain" />
      <div className="op-plate__label">{label}</div>
      {children}
    </div>);

}

/* ---------------- LOGO ---------------- */
function Logo({ size = 18, accent = "#F15A24" }) {
  // OLY orange / MPE white  ;  PRODU white / CTION orange  (echoing the reference)
  return (
    <div className="op-logo" style={{ fontSize: size }}>
      <span className="op-logo__row">
        <span style={{ color: accent }}>OLY</span><span>MPE</span>
      </span>
      <span className="op-logo__row">
        <span>PRODU</span><span style={{ color: accent }}>CTION</span>
      </span>
    </div>);

}

/* ---------------- HEADER ---------------- */
function Header({ active, onNav, onQuote, onAudit, accent }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
  ["accueil", "Accueil"],
  ["prestations", "Prestations"],
  ["portfolio", "Portfolio"],
  ["apropos", "À propos"],
  ["contact", "Contact"]];


  return (
    <header className={`op-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="op-header__inner">
        <button className="op-header__brand" onClick={() => onNav("accueil")}>
          <Logo size={13} accent={accent} />
        </button>

        <nav className="op-nav">
          {items.map(([id, label]) =>
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`op-nav__item ${active === id ? "is-active" : ""}`}>
            
              {label}
            </button>
          )}
        </nav>

        <button className="op-btn op-btn--primary op-header__cta" onClick={onQuote}>
          <span>Demander un devis</span>
          <Arrow />
        </button>
      </div>
    </header>);

}

function Arrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
      <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>);

}

/* ---------------- AUDIT BUTTON ---------------- */
function AuditButton({ onClick, microcopy, align, size = "lg" }) {
  return (
    <div className={`op-audit ${align === "center" ? "op-audit--center" : ""}`}>
      <button className={`op-btn op-btn--audit op-btn--${size}`} onClick={onClick}>
        <span className="op-audit__spark" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 .8l1.6 4.6L13.2 7l-4.6 1.6L7 13.2l-1.6-4.6L.8 7l4.6-1.6z" fill="currentColor" />
          </svg>
        </span>
        <span>Audit gratuit</span>
        <span className="op-audit__min">15 min</span>
      </button>
      {microcopy && <p className="op-audit__micro">{microcopy}</p>}
    </div>);

}

/* ---------------- HERO ---------------- */
function Hero({ onQuote, onAudit, heroVariant }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="accueil" className="op-hero" data-screen-label="01 Hero">
      <div className="op-hero__bg">
        <Plate
          label="HERO REEL · 16:9 · loop"
          ratio="auto"
          tone="cool"
          style={{ position: "absolute", inset: 0, aspectRatio: "auto", borderRadius: 0 }}>
          
          {/* faux camera glide motion bars */}
          <div
            className="op-hero__sweep"
            style={{ transform: `translateX(${Math.sin(t * 0.4) * 12}%)` }} />
          
        </Plate>
        <div className="op-hero__vignette" />
        <div className="op-hero__scanlines" />
      </div>

      <div className="op-hero__chrome">
        <div className="op-hero__corners" aria-hidden>
          <span /><span /><span /><span />
        </div>

        <div className="op-hero__meta">
          <span className="op-tag">● REC</span>
          <span className="op-tag">01 / 04</span>
          <span className="op-tag">ƒ 1.4 · 24fps</span>
        </div>

        <div className="op-hero__content">
          <p className="op-eyebrow">AGENCE DE PRODUCTION AUDIOVISUELLE — LA RÉUNION </p>
          <h1 className="op-hero__title">
            Des vidéos qui génèrent
            <br />
            <em>des clients</em> en <span style={{ color: "rgb(241, 90, 36)" }}>30 jours.</span><br />
          </h1>
          <p className="op-hero__sub">Olympe Production accompagne les entreprises à créer des contenus vidéo professionnels, mémorables et qui attirent des clients.


          </p>
          <div className="op-hero__actions">
            <button className="op-btn op-btn--audit op-btn--lg" onClick={onAudit}>
              <span className="op-audit__spark" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 .8l1.6 4.6L13.2 7l-4.6 1.6L7 13.2l-1.6-4.6L.8 7l4.6-1.6z" fill="currentColor" />
                </svg>
              </span>
              <span>Audit gratuit</span>
              <span className="op-audit__min">15 min</span>
            </button>
            <button className="op-btn op-btn--ghost op-btn--lg" onClick={onQuote}>
              <span>Demander un devis</span>
              <Arrow />
            </button>
            <button className="op-btn op-btn--ghost op-btn--lg op-hero__reel" onClick={() => {const el = document.getElementById("portfolio");if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });}}>
              <PlayDot />
              <span>Voir le showreel</span>
            </button>
          </div>
          <p className="op-hero__micro">Sans engagement · conseils personnalisés · repartez avec des axes concrets.</p>
        </div>

        <div className="op-hero__footline">
          <div className="op-hero__marquee">
            <Marquee items={[
            "VIDÉO CORPORATE", "DIRECTION ARTISTIQUE", "ÉVÉNEMENTIEL",
            "PUBLICITÉ", "RÉSEAUX SOCIAUX", "POST-PRODUCTION"]
            } />
          </div>
          <div className="op-hero__scroll">
            <span>Scroll</span>
            <i />
          </div>
        </div>
      </div>
    </section>);

}

function PlayDot() {
  return (
    <span className="op-playdot" aria-hidden>
      <svg width="8" height="9" viewBox="0 0 8 9"><path d="M0 0v9l8-4.5z" fill="currentColor" /></svg>
    </span>);

}

function Marquee({ items }) {
  const seq = [...items, ...items];
  return (
    <div className="op-marquee">
      <div className="op-marquee__track">
        {seq.map((s, i) =>
        <span key={i} className="op-marquee__item">
            <span>{s}</span>
            <i className="op-marquee__dot" />
          </span>
        )}
      </div>
    </div>);

}

/* ---------------- INTRO / À PROPOS ---------------- */
function Intro() {
  const pillars = [
  ["01", "Accompagnement", "De la conception à la livraison, un seul interlocuteur."],
  ["02", "Stratégie de contenus", "Un plan vidéo aligné sur vos objectifs business."],
  ["03", "Direction artistique", "Une signature visuelle forte, cohérente, sur-mesure."],
  ["04", "Storytelling", "Des récits qui captent et qui restent en mémoire."],
  ["05", "Qualité d'image", "Cinéma numérique, optiques premium, étalonnage soigné."]];

  return (
    <section id="apropos" className="op-section op-intro" data-screen-label="02 Intro">
      <div className="op-section__head">
        <span className="op-section__num">— À propos</span>
        <h2 className="op-h2">
          Une agence à l’écoute,<br />
          une exécution <em>cinématographique</em> au service de votre stratégie.
        </h2>
      </div>

      <div className="op-intro__body">
        <div className="op-intro__lede">
          <p>Olympe Production est une agence de création audiovisuelle indépendante. Nous réalisons des films de marque, des publicités et des contenus digitaux pensés pour convertir votre audience en clients — chaque cadre, chaque lumière, chaque seconde au service du message.




          </p>
          <p className="op-muted">Basés à La Réunion, nous intervenons sur l’ensemble du territoire.

          </p>
        </div>

        <ul className="op-pillars">
          {pillars.map(([n, t, d]) =>
          <li key={n} className="op-pillar">
              <span className="op-pillar__n">{n}</span>
              <div>
                <h4 className="op-pillar__t">{t}</h4>
                <p className="op-pillar__d">{d}</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </section>);

}

/* ---------------- PRESTATIONS ---------------- */
const SERVICES = [
{ id: "corporate", n: "01", t: "Vidéo corporate", d: "Films d'entreprise, recrutement, présentation produit. Une image solide, claire et premium.", tone: "cool", icon: "building" },
{ id: "social", n: "02", t: "Vidéo réseaux sociaux", d: "Formats verticaux, capsules, reels. Pensés pour la performance et le scroll.", tone: "warm", icon: "phone" },
{ id: "event", n: "03", t: "Vidéo événementielle", d: "Aftermovies, captation multi-cam, conférences, lancements de produit.", tone: "neutral", icon: "spark" },
{ id: "ads", n: "04", t: "Publicité vidéo", d: "Films publicitaires diffusables TV, web et social. Story-board, casting, livraison.", tone: "cool", icon: "target" },
{ id: "live", n: "05", t: "Captation pro", d: "Concerts, spectacles, talks. Régie multi-caméras et ingénierie son.", tone: "warm", icon: "live" },
{ id: "photo", n: "06", t: "Photographie", d: "Reportage, portrait, packshot. En complément ou en autonomie.", tone: "neutral", icon: "camera" }];


function Icon({ name }) {
  const s = { width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "building":
      return <svg viewBox="0 0 24 24" {...s}><rect x="4" y="3" width="16" height="18" /><path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2M4 21h16" /></svg>;
    case "phone":
      return <svg viewBox="0 0 24 24" {...s}><rect x="7" y="2" width="10" height="20" rx="1.5" /><path d="M11 18h2" /></svg>;
    case "music":
      return <svg viewBox="0 0 24 24" {...s}><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>;
    case "spark":
      return <svg viewBox="0 0 24 24" {...s}><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" /></svg>;
    case "target":
      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>;
    case "live":
      return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="7" width="14" height="10" rx="1" /><path d="M16 10l6-3v10l-6-3z" /><circle cx="6" cy="12" r="1.2" fill="currentColor" /></svg>;
    case "camera":
      return <svg viewBox="0 0 24 24" {...s}><path d="M3 8h4l2-3h6l2 3h4v12H3z" /><circle cx="12" cy="13" r="4" /></svg>;
    case "drone":
      return <svg viewBox="0 0 24 24" {...s}><circle cx="5" cy="5" r="3" /><circle cx="19" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><rect x="9" y="9" width="6" height="6" /><path d="M9 9L7 7M15 9l2-2M9 15l-2 2M15 15l2 2" /></svg>;
    default:return null;
  }
}

function Services({ onQuote, onAudit }) {
  return (
    <section id="prestations" className="op-section op-services" data-screen-label="03 Services">
      <div className="op-section__head">
        <span className="op-section__num">— Prestations</span>
        <h2 className="op-h2">
          Un éventail complet<br />
          de <em>savoir-faire</em>.
        </h2>
        <p className="op-section__lede">Un projet, une approche sur mesure. De l’idée à la vidéo finale.


        </p>
      </div>

      <ul className="op-services__grid">
        {SERVICES.map((s) =>
        <li key={s.id} className="op-svc">
            <div className="op-svc__media">
              <Plate label={s.t.toUpperCase()} ratio="4 / 3" tone={s.tone} />
              <span className="op-svc__icon"><Icon name={s.icon} /></span>
            </div>
            <div className="op-svc__body">
              <div className="op-svc__row">
                <span className="op-svc__n">{s.n}</span>
                <h3 className="op-svc__t">{s.t}</h3>
                <span className="op-svc__arrow"><Arrow /></span>
              </div>
              <p className="op-svc__d">{s.d}</p>
            </div>
          </li>
        )}
      </ul>

      <div className="op-services__foot">
        <p>Un besoin spécifique ? Nous construisons des dispositifs sur-mesure.</p>
        <div className="op-services__cta">
          <AuditButton onClick={onAudit} microcopy="15 minutes pour faire le point sur votre stratégie vidéo." />
          <button className="op-btn op-btn--ghost" onClick={onQuote}>
            <span>Demander un devis</span><Arrow />
          </button>
        </div>
      </div>
    </section>);

}

/* ---------------- PORTFOLIO ---------------- */
const PROJECTS = [
{ id: 1, t: "Maison Lazare", cat: "Entreprises", yr: "2026", dur: "2'14", tone: "cool", span: "tall" },
{ id: 2, t: "Festival Aurore", cat: "Événementiel", yr: "2025", dur: "3'42", tone: "warm", span: "wide" },
{ id: 4, t: "Atelier Volta", cat: "Entreprises", yr: "2025", dur: "1'30", tone: "neutral", span: "" },
{ id: 5, t: "Nuit Blanche · Live", cat: "Événementiel", yr: "2024", dur: "5'12", tone: "dark", span: "" },
{ id: 7, t: "Café Dorian", cat: "Réseaux sociaux", yr: "2026", dur: "0'30", tone: "warm", span: "" },
{ id: 8, t: "MOVA Sport", cat: "Réseaux sociaux", yr: "2025", dur: "0'45", tone: "cool", span: "tall" },
{ id: 9, t: "Galerie Iris", cat: "Entreprises", yr: "2024", dur: "1'58", tone: "neutral", span: "" }];


function Portfolio({ onAudit }) {
  const [hover, setHover] = useState(null);
  const list = PROJECTS;

  return (
    <section id="portfolio" className="op-section op-portfolio" data-screen-label="04 Portfolio">
      <div className="op-section__head op-section__head--row">
        <div>
          <span className="op-section__num">— Portfolio</span>
          <h2 className="op-h2">
            Quelques<br />
            <em>réalisations</em>.
          </h2>
        </div>
        <ul className="op-filters" style={{ display: "none" }}>
        </ul>
      </div>

      <ul className="op-grid">
        {list.map((p, i) =>
        <li
          key={p.id}
          className={`op-card op-card--${p.span || "std"}`}
          style={{ animationDelay: `${i * 40}ms` }}
          onMouseEnter={() => setHover(p.id)}
          onMouseLeave={() => setHover(null)}>
          
            <div className="op-card__media">
              <Plate
              label={`${p.cat.toUpperCase()} · ${p.t.toUpperCase()}`}
              ratio={p.span === "tall" ? "3 / 4" : p.span === "wide" ? "16 / 9" : "4 / 3"}
              tone={p.tone} />
            
              <div className={`op-card__hover ${hover === p.id ? "is-on" : ""}`}>
                <span className="op-card__play"><PlayDot /></span>
              </div>
            </div>
            <div className="op-card__meta">
              <div className="op-card__title">
                <h3>{p.t}</h3>
                <span className="op-card__arrow"><Arrow /></span>
              </div>
              <div className="op-card__sub">
                <span>{p.cat}</span>
                <span className="op-dot" />
                <span>{p.yr}</span>
                <span className="op-dot" />
                <span>{p.dur}</span>
              </div>
            </div>
          </li>
        )}
      </ul>

      <div className="op-portfolio__foot">
        <button className="op-btn op-btn--ghost">
          <span>Voir toutes les réalisations</span><Arrow />
        </button>
        <AuditButton
          onClick={onAudit}
          microcopy="Vous projetez un film similaire ? Parlons-en pendant 15 minutes — audit offert, sans engagement."
          align="center" />
        
      </div>
    </section>);

}

/* ---------------- MÉTHODE ---------------- */
function Method({ onAudit }) {
  const steps = [
  ["01", "Échange & brief", "Compréhension du besoin, des objectifs et des contraintes. Recommandations et chiffrage."],
  ["02", "Stratégie de contenu", "Clarification du positionnement, mise en place d'un calendrier éditorial et construction d'un tunnel de vente."],
  ["03", "Production", "Pré-production, tournage et post-production. Direction artistique, image, son, montage, étalonnage et livraison."],
  ["04", "Analyse & optimisation", "Analyse des performances des contenus et de la stratégie. Ajustements pour améliorer les résultats et maximiser le retour."]];

  return (
    <section className="op-section op-method" data-screen-label="05 Method">
      <div className="op-section__head">
        <span className="op-section__num">— Méthode</span>
        <h2 className="op-h2">
          Quatre étapes,<br />
          un <em>fil rouge</em>.
        </h2>
      </div>

      <ol className="op-steps">
        {steps.map(([n, t, d], i) =>
        <li key={n} className="op-step">
            <div className="op-step__top">
              <span className="op-step__n">{n}</span>
              <span className="op-step__line" />
            </div>
            <h4 className="op-step__t">{t}</h4>
            <p className="op-step__d">{d}</p>
          </li>
        )}
      </ol>

      <div className="op-method__foot">
        <AuditButton
          onClick={onAudit}
          microcopy="Vous voulez démarrer ? L'audit est la première étape — 15 minutes pour définir le bon dispositif."
          align="center" />
        
      </div>
    </section>);

}

/* ---------------- WHY ---------------- */
function Why() {
  const rows = [
  ["Image premium", "Optiques cinéma, lumière travaillée, étalonnage signature."],
  ["Créativité", "Une direction artistique forte, jamais générique."],
  ["Accompagnement complet", "Un seul interlocuteur, du brief à la livraison."],
  ["Regard stratégique", "On part de votre objectif, pas d'un format."],
  ["Qualité professionnelle", "Équipe, matériel et process pensés pour la diffusion."],
  ["Sur-mesure", "Chaque dispositif s'adapte au budget et au calendrier."]];

  return (
    <section className="op-section op-why" data-screen-label="06 Why">
      <div className="op-why__grid">
        <div className="op-why__head">
          <span className="op-section__num">— Pourquoi nous</span>
          <h2 className="op-h2">
            Une exigence<br />
            qui se voit à <em>l'image</em>.
          </h2>
          <div className="op-why__media">
            <Plate label="STILL · 01.A · 35mm" ratio="4 / 5" tone="amber" />
          </div>
        </div>

        <ul className="op-why__list">
          {rows.map(([t, d], i) =>
          <li key={t} className="op-why__row">
              <span className="op-why__n">·{String(i + 1).padStart(2, "0")}</span>
              <h4 className="op-why__t">{t}</h4>
              <p className="op-why__d">{d}</p>
            </li>
          )}
        </ul>
      </div>
    </section>);

}

/* ---------------- CTA STRIP ---------------- */
function CtaStrip({ onQuote, onAudit }) {
  return (
    <section className="op-cta" data-screen-label="07 CTA">
      <div className="op-cta__inner">
        <span className="op-section__num">— Démarrer</span>
        <h2 className="op-cta__title">
          Un projet vidéo<br /><em>en tête ?</em>
        </h2>
        <p className="op-cta__sub">
          Parlez-nous de votre besoin et recevez une proposition adaptée sous 48 h.
        </p>
        <div className="op-cta__buttons">
          <button className="op-btn op-btn--audit op-btn--xl" onClick={onAudit}>
            <span className="op-audit__spark" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M7 .8l1.6 4.6L13.2 7l-4.6 1.6L7 13.2l-1.6-4.6L.8 7l4.6-1.6z" fill="currentColor" />
              </svg>
            </span>
            <span>Audit gratuit · 15 min</span>
          </button>
          <button className="op-btn op-btn--ghost op-btn--xl" onClick={onQuote}>
            <span>Demander un devis</span><Arrow />
          </button>
        </div>
        <div className="op-cta__meta">
          <span>Sans engagement</span>
          <span className="op-dot" />
          <span>Conseils personnalisés</span>
          <span className="op-dot" />
          <span>Réponse sous 48 h</span>
        </div>
      </div>
    </section>);

}

/* ---------------- CONTACT FORM ---------------- */
function Contact({ formRef, openForm, onSubmit, sent }) {
  const [data, setData] = useState({
    nom: "", entreprise: "", email: "", tel: "",
    type: "Vidéo corporate", budget: "1 — 5 k€", message: ""
  });
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));

  const types = ["Vidéo corporate", "Réseaux sociaux", "Événementiel", "Publicité", "Autre"];
  const budgets = ["< 1 k€", "1 — 5 k€", "5 — 15 k€", "15 — 30 k€", "> 30 k€"];

  return (
    <section id="contact" ref={formRef} className="op-section op-contact" data-screen-label="08 Contact">
      <div className="op-contact__grid">
        <aside className="op-contact__aside">
          <span className="op-section__num">— Contact</span>
          <h2 className="op-h2">
            Demander<br />
            un <em>devis</em>.
          </h2>
          <p className="op-muted">
            Décrivez votre projet en quelques lignes. Nous revenons vers vous sous 48 h ouvrées
            avec une recommandation et un chiffrage.
          </p>

          <ul className="op-contact__info">
            <li><span>EMAIL</span><b>contact@olympeproduction.com</b></li>
            <li><span>TÉLÉPHONE</span><b>0692 10 95 43 - 0693 05 72 20</b></li>
          </ul>
        </aside>

        <form className={`op-form ${sent ? "is-sent" : ""}`}
        onSubmit={(e) => {e.preventDefault();onSubmit(data);}}>
          
          <div className="op-form__row">
            <Field label="Nom" v={data.nom} onChange={set("nom")} required />
            <Field label="Entreprise" v={data.entreprise} onChange={set("entreprise")} />
          </div>
          <div className="op-form__row">
            <Field label="Email" v={data.email} onChange={set("email")} type="email" required />
            <Field label="Téléphone" v={data.tel} onChange={set("tel")} />
          </div>

          <div className="op-form__row">
            <Pick label="Type de projet" v={data.type} options={types} onChange={set("type")} />
            <Pick label="Budget estimé" v={data.budget} options={budgets} onChange={set("budget")} />
          </div>

          <label className="op-field op-field--area">
            <span className="op-field__label">Message</span>
            <textarea rows="5" value={data.message} onChange={set("message")}
            placeholder="Parlez-nous du projet, du contexte, de l'échéance…" />
          </label>

          <div className="op-form__foot">
            <p className="op-muted op-tiny">
              En envoyant ce formulaire, vous acceptez d'être recontacté par Olympe Production.
            </p>
            <button type="submit" className="op-btn op-btn--primary op-btn--lg">
              <span>{sent ? "Demande envoyée ✓" : "Envoyer ma demande"}</span>
              {!sent && <Arrow />}
            </button>
          </div>
        </form>
      </div>
    </section>);

}

function Field({ label, v, onChange, type = "text", required }) {
  return (
    <label className="op-field">
      <span className="op-field__label">{label}{required && <i> *</i>}</span>
      <input type={type} value={v} onChange={onChange} required={required} />
    </label>);

}
function Pick({ label, v, onChange, options }) {
  return (
    <label className="op-field">
      <span className="op-field__label">{label}</span>
      <div className="op-select">
        <select value={v} onChange={onChange}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
      </div>
    </label>);

}

/* ---------------- FOOTER ---------------- */
function Footer({ accent }) {
  return (
    <footer className="op-footer">
      <div className="op-footer__top">
        <div className="op-footer__brand">
          <Logo size={44} accent={accent} />
          <p className="op-muted op-tiny" style={{ marginTop: 28, maxWidth: 320 }}>Agence de production audiovisuelle indépendante. Nous créons des films de marque, publicités et contenus événementiels conçus pour générer des clients.


          </p>
        </div>

        <div className="op-footer__cols">
          <FCol title="Contact" items={[
          "contact@olympeproduction.com",
          "0692 10 95 43",
          "0693 05 72 20",
          "La Réunion · France"]
          } />
          <FCol title="Navigation" items={[
          "Accueil", "Prestations", "Portfolio", "À propos", "Contact"]
          } />
          <FCol title="Suivez-nous" items={[
          "Instagram", "TikTok", "YouTube", "LinkedIn"]
          } />
        </div>
      </div>

      <div className="op-footer__bottom">
        <span>© 2026 Olympe Production — Tous droits réservés</span>
        <ul>
          <li>Mentions légales</li>
          <li>Politique de confidentialité</li>
          <li>CGV</li>
        </ul>
      </div>
    </footer>);

}
function FCol({ title, items }) {
  return (
    <div className="op-fcol">
      <h5>{title}</h5>
      <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>);

}

/* ---------------- AUDIT MODAL ---------------- */
function AuditModal({ open, onClose }) {
  const [step, setStep] = useState("calendar"); // calendar | confirm
  const [pickedDate, setPickedDate] = useState(null);
  const [pickedSlot, setPickedSlot] = useState(null);
  const [form, setForm] = useState({ nom: "", entreprise: "", email: "", contexte: "" });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Generate next 14 weekdays starting tomorrow
  const days = useMemo(() => {
    const out = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    let d = new Date(start);
    d.setDate(d.getDate() + 1);
    while (out.length < 14) {
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }, [open]);

  // 15-minute slots between 09:00 and 18:00, skip 12:30-14:00
  const slots = useMemo(() => {
    const out = [];
    for (let h = 9; h < 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 12 && m >= 30 || h === 13) continue;
        out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return out;
  }, []);

  const dayLabel = (d) => {
    const wd = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d.getDay()];
    const m = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"][d.getMonth()];
    return { wd, dn: d.getDate(), m };
  };

  const fullDateLabel = (d) => d && d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const canConfirm = pickedDate && pickedSlot;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep("sent");
  };

  const close = () => {
    onClose();
    // reset after fade
    setTimeout(() => {setStep("calendar");setPickedDate(null);setPickedSlot(null);}, 300);
  };

  if (!open) return null;

  return (
    <div className="op-modal" role="dialog" aria-modal="true" aria-labelledby="op-modal-title">
      <div className="op-modal__scrim" onClick={close} />
      <div className="op-modal__panel">
        <button className="op-modal__close" onClick={close} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" /></svg>
        </button>

        <div className="op-modal__head">
          <span className="op-section__num">— Audit gratuit</span>
          <h3 id="op-modal-title" className="op-modal__title">
            Réservez votre <em>audit gratuit</em>.
          </h3>
          <p className="op-modal__sub">
            En 15 minutes, nous analysons votre situation actuelle et identifions des
            opportunités concrètes pour améliorer vos résultats grâce à la vidéo.
          </p>
          <ul className="op-modal__chips">
            <li><Check /> Sans engagement</li>
            <li><Check /> Conseils personnalisés</li>
            <li><Check /> 15 minutes en visio</li>
            <li><Check /> Repartez avec des axes concrets</li>
          </ul>
        </div>

        {step === "calendar" &&
        <div className="op-modal__body">
            <div className="op-cal">
              <div className="op-cal__col">
                <h4 className="op-cal__h">1. Choisissez un jour</h4>
                <ul className="op-cal__days">
                  {days.map((d) => {
                  const { wd, dn, m } = dayLabel(d);
                  const active = pickedDate && d.toDateString() === pickedDate.toDateString();
                  return (
                    <li key={d.toISOString()}>
                        <button
                        type="button"
                        className={`op-cal__day ${active ? "is-active" : ""}`}
                        onClick={() => {setPickedDate(d);setPickedSlot(null);}}>
                        
                          <span className="op-cal__wd">{wd}</span>
                          <span className="op-cal__dn">{dn}</span>
                          <span className="op-cal__m">{m}</span>
                        </button>
                      </li>);

                })}
                </ul>
              </div>

              <div className="op-cal__col op-cal__col--slots">
                <h4 className="op-cal__h">
                  2. Choisissez un créneau
                  {pickedDate && <span className="op-cal__hint"> · {fullDateLabel(pickedDate)}</span>}
                </h4>
                {!pickedDate && <p className="op-cal__empty">Sélectionnez d'abord une date.</p>}
                {pickedDate &&
              <ul className="op-cal__slots">
                    {slots.map((s) =>
                <li key={s}>
                        <button
                    type="button"
                    className={`op-cal__slot ${pickedSlot === s ? "is-active" : ""}`}
                    onClick={() => setPickedSlot(s)}>
                    {s}</button>
                      </li>
                )}
                  </ul>
              }
                <p className="op-cal__tz op-tiny op-muted">Créneaux de 15 min · fuseau Indien (UTC+4) · visio Google Meet.</p>
              </div>
            </div>

            <div className="op-modal__foot">
              <button type="button" className="op-btn op-btn--ghost" onClick={close}>Annuler</button>
              <button
              type="button"
              disabled={!canConfirm}
              className="op-btn op-btn--audit op-btn--lg"
              onClick={() => setStep("form")}>
              
                <span>Continuer</span><Arrow />
              </button>
            </div>
          </div>
        }

        {step === "form" &&
        <form className="op-modal__body op-modal__form" onSubmit={handleSubmit}>
            <div className="op-modal__recap">
              <span className="op-modal__recap-label">Votre créneau</span>
              <strong>{fullDateLabel(pickedDate)} · {pickedSlot}</strong>
              <button type="button" className="op-modal__recap-edit" onClick={() => setStep("calendar")}>Modifier</button>
            </div>

            <div className="op-form__row">
              <Field label="Nom" v={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              <Field label="Entreprise" v={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })} />
            </div>
            <Field label="Email professionnel" v={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />

            <label className="op-field op-field--area">
              <span className="op-field__label">Contexte (optionnel)</span>
              <textarea
              rows="4"
              value={form.contexte}
              onChange={(e) => setForm({ ...form, contexte: e.target.value })}
              placeholder="Quelques mots sur votre activité, vos objectifs, votre échéance…" />
            
            </label>

            <div className="op-modal__foot">
              <button type="button" className="op-btn op-btn--ghost" onClick={() => setStep("calendar")}>Retour</button>
              <button type="submit" className="op-btn op-btn--audit op-btn--lg">
                <span className="op-audit__spark" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 .8l1.6 4.6L13.2 7l-4.6 1.6L7 13.2l-1.6-4.6L.8 7l4.6-1.6z" fill="currentColor" /></svg>
                </span>
                <span>Confirmer mon audit</span>
              </button>
            </div>
          </form>
        }

        {step === "sent" &&
        <div className="op-modal__body op-modal__sent">
            <div className="op-modal__sent-mark"><Check large /></div>
            <h4>Rendez-vous confirmé</h4>
            <p>
              Vous recevrez un email à <b>{form.email}</b> avec le lien Google Meet pour le
              <b> {fullDateLabel(pickedDate)} à {pickedSlot}</b>.
            </p>
            <p className="op-muted op-tiny">
              À bientôt — l'équipe Olympe Production.
            </p>
            <div className="op-modal__foot op-modal__foot--center">
              <button type="button" className="op-btn op-btn--audit" onClick={close}>Fermer</button>
            </div>
          </div>
        }
      </div>
    </div>);

}

function Check({ large }) {
  const sz = large ? 28 : 12;
  return (
    <svg width={sz} height={sz} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}

/* ---------------- APP ---------------- */
function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#F15A24",
    "bg": "#05051A",
    "serif": "Cormorant Garamond",
    "sans": "Inter Tight",
    "heroEmphasis": "italic",
    "showGrain": true
  } /*EDITMODE-END*/;

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState("accueil");
  const [sent, setSent] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const formRef = useRef(null);

  // sticky FAB after scrolling past the hero
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // active section tracking
  useEffect(() => {
    const ids = ["accueil", "prestations", "portfolio", "apropos", "contact"];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const onNav = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
  };
  const onQuote = () => {
    const el = document.getElementById("contact");
    if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: "smooth" });
  };
  const onAudit = () => setAuditOpen(true);
  const onSubmit = () => {
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  // expose tweak vars
  const styleVars = {
    "--op-accent": tweaks.accent,
    "--op-bg": tweaks.bg,
    "--op-serif": `"${tweaks.serif}", "Times New Roman", serif`,
    "--op-sans": `"${tweaks.sans}", system-ui, sans-serif`
  };

  return (
    <div className="op-root" style={styleVars} data-emphasis={tweaks.heroEmphasis} data-grain={tweaks.showGrain}>
      <Header active={active} onNav={onNav} onQuote={onQuote} onAudit={onAudit} accent={tweaks.accent} />
      <main>
        <Hero onQuote={onQuote} onAudit={onAudit} heroVariant="default" />
        <Intro />
        <Services onQuote={onQuote} onAudit={onAudit} />
        <Portfolio onAudit={onAudit} />
        <Method onAudit={onAudit} />
        <Why />
        <CtaStrip onQuote={onQuote} onAudit={onAudit} />
        <Contact formRef={formRef} onSubmit={onSubmit} sent={sent} />
      </main>
      <Footer accent={tweaks.accent} />

      <button
        type="button"
        className={`op-fab ${showFab ? "is-on" : ""}`}
        onClick={onAudit}
        aria-label="Réserver un audit gratuit">
        
        <span className="op-audit__spark" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 .8l1.6 4.6L13.2 7l-4.6 1.6L7 13.2l-1.6-4.6L.8 7l4.6-1.6z" fill="currentColor" /></svg>
        </span>
        <span className="op-fab__label">Audit gratuit · 15 min</span>
      </button>

      <AuditModal open={auditOpen} onClose={() => setAuditOpen(false)} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Couleurs">
          <TweakColor label="Accent" value={tweaks.accent} onChange={(v) => setTweak("accent", v)} />
          <TweakColor label="Fond nuit" value={tweaks.bg} onChange={(v) => setTweak("bg", v)} />
        </TweakSection>

        <TweakSection title="Typographie">
          <TweakRadio
            label="Serif (titres)"
            value={tweaks.serif}
            onChange={(v) => setTweak("serif", v)}
            options={[
            { value: "Cormorant Garamond", label: "Cormorant" },
            { value: "Playfair Display", label: "Cormorant" },
            { value: "DM Serif Display", label: "Cormorant" }]
            } />
          
          <TweakRadio
            label="Sans (texte)"
            value={tweaks.sans}
            onChange={(v) => setTweak("sans", v)}
            options={[
            { value: "Inter Tight", label: "Cormorant" },
            { value: "Manrope", label: "Cormorant" },
            { value: "Space Grotesk", label: "Grotesk" }]
            } />
          
        </TweakSection>

        <TweakSection title="Hero">
          <TweakRadio
            label="Emphase titre"
            value={tweaks.heroEmphasis}
            onChange={(v) => setTweak("heroEmphasis", v)}
            options={[
            { value: "italic", label: "Cormorant" },
            { value: "accent", label: "Cormorant" },
            { value: "underline", label: "Cormorant" }]
            } />
          
          <TweakToggle
            label="Grain & scanlines"
            value={tweaks.showGrain}
            onChange={(v) => setTweak("showGrain", v)} />
          
        </TweakSection>
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);