import { useState, useEffect, useRef } from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShoppingBag, BookOpen, Globe, ChevronDown } from "lucide-react";
import { getActiveLandingSections } from "../services/landing";
import type { LandingSection } from "../types/landing";


/* ── Intersection observer hook for scroll animations ───────────────  */
function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

/* ── Animated section wrapper ───────────────────────────────────────  */
function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const { ref, isVisible } = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(40px)",
                transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

/* ── Section renderers ──────────────────────────────────────────────  */
function HeroSection({ section }: { section: LandingSection }) {
    return (
        <section className="landing-hero">
            {/* Background image + overlay */}
            <div className="landing-hero__bg">
                {section.image_url && (
                    <img
                        src={section.image_url}
                        alt={section.title || "Ecosera"}
                        className="landing-hero__bg-img"
                    />
                )}
                <div className="landing-hero__overlay" />
            </div>

            <div className="landing-hero__content">
                <AnimatedSection>
                    <div className="landing-hero__badge">
                        <Leaf className="landing-hero__badge-icon" />
                        <span>Platform UMKM Pedesaan #1</span>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={0.15}>
                    <h1 className="landing-hero__title">
                        {section.title || "Dari Desa untuk Dunia"}
                    </h1>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                    <p className="landing-hero__subtitle">
                        {section.subtitle ||
                            "Memberdayakan UMKM pedesaan menuju masa depan digital"}
                    </p>
                </AnimatedSection>

                {section.cta_text && (
                    <AnimatedSection delay={0.45}>
                        <Link
                            to={section.cta_link || "/etalase"}
                            className="landing-hero__cta"
                        >
                            {section.cta_text}
                            <ArrowRight className="landing-hero__cta-icon" />
                        </Link>
                    </AnimatedSection>
                )}

                <AnimatedSection delay={0.6}>
                    <div className="landing-hero__scroll-hint">
                        <ChevronDown className="landing-hero__scroll-icon" />
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

function ChallengeSection({ section }: { section: LandingSection }) {
    return (
        <section className="landing-challenge">
            <div className="landing-section-container">
                <AnimatedSection className="landing-challenge__grid">
                    <div className="landing-challenge__text">
                        <span className="landing-section-tag">Masalah</span>
                        <h2 className="landing-section-title">
                            {section.title || "Potensi Besar, Jangkauan Terbatas"}
                        </h2>
                        <p className="landing-section-body">
                            {section.content ||
                                "Jutaan pelaku UMKM di pedesaan Indonesia memiliki produk berkualitas tinggi—mulai dari kerajinan tangan, makanan olahan, hingga hasil pertanian. Namun, keterbatasan akses digital dan pasar membuat potensi mereka tidak terjangkau."}
                        </p>
                        {section.subtitle && (
                            <p className="landing-challenge__highlight">
                                {section.subtitle}
                            </p>
                        )}
                    </div>
                    {section.image_url && (
                        <div className="landing-challenge__image-wrap">
                            <img
                                src={section.image_url}
                                alt={section.title || "Challenge"}
                                className="landing-challenge__image"
                            />
                        </div>
                    )}
                </AnimatedSection>
            </div>
        </section>
    );
}

function SolutionSection({ section }: { section: LandingSection }) {
    const features = [
        {
            icon: <ShoppingBag />,
            title: "Etalase Digital",
            desc: "Toko online yang dirancang khusus untuk UMKM pedesaan — mudah dikelola tanpa keahlian teknis.",
        },
        {
            icon: <BookOpen />,
            title: "E-Learning",
            desc: "Modul pelatihan bisnis digital yang memberdayakan penjual agar bisa berkembang secara mandiri.",
        },
        {
            icon: <Globe />,
            title: "Jangkauan Luas",
            desc: "Menghubungkan produk lokal dengan pembeli di seluruh Indonesia — dari desa ke kota.",
        },
    ];

    return (
        <section className="landing-solution">
            <div className="landing-section-container">
                <AnimatedSection className="landing-solution__header">
                    <span className="landing-section-tag landing-section-tag--light">
                        Solusi Kami
                    </span>
                    <h2 className="landing-section-title landing-section-title--light">
                        {section.title || "Ecosera Menjembatani Kesenjangan"}
                    </h2>
                    {section.subtitle && (
                        <p className="landing-solution__subtitle">
                            {section.subtitle}
                        </p>
                    )}
                </AnimatedSection>

                <div className="landing-solution__cards">
                    {features.map((f, i) => (
                        <AnimatedSection
                            key={i}
                            className="landing-solution__card"
                            delay={i * 0.15}
                        >
                            <div className="landing-solution__card-icon">
                                {f.icon}
                            </div>
                            <h3 className="landing-solution__card-title">
                                {f.title}
                            </h3>
                            <p className="landing-solution__card-desc">
                                {f.desc}
                            </p>
                        </AnimatedSection>
                    ))}
                </div>

                {section.image_url && (
                    <AnimatedSection className="landing-solution__image-wrap">
                        <img
                            src={section.image_url}
                            alt={section.title || "Solution"}
                            className="landing-solution__image"
                        />
                    </AnimatedSection>
                )}
            </div>
        </section>
    );
}

function ImpactSection({ section }: { section: LandingSection }) {
    const stats = [
        { value: "100+", label: "UMKM Terbantu" },
        { value: "50+", label: "Desa Terjangkau" },
        { value: "1000+", label: "Produk Lokal" },
    ];

    return (
        <section className="landing-impact">
            <div className="landing-section-container">
                <AnimatedSection className="landing-impact__header">
                    <span className="landing-section-tag">Dampak Nyata</span>
                    <h2 className="landing-section-title">
                        {section.title || "Bersama, Kita Membuat Perubahan"}
                    </h2>
                    {section.content && (
                        <p className="landing-section-body landing-impact__body">
                            {section.content}
                        </p>
                    )}
                </AnimatedSection>

                <div className="landing-impact__stats">
                    {stats.map((s, i) => (
                        <AnimatedSection
                            key={i}
                            className="landing-impact__stat"
                            delay={i * 0.15}
                        >
                            <span className="landing-impact__stat-value">
                                {s.value}
                            </span>
                            <span className="landing-impact__stat-label">
                                {s.label}
                            </span>
                        </AnimatedSection>
                    ))}
                </div>

                {section.image_url && (
                    <AnimatedSection className="landing-impact__image-wrap">
                        <img
                            src={section.image_url}
                            alt={section.title || "Impact"}
                            className="landing-impact__image"
                        />
                    </AnimatedSection>
                )}
            </div>
        </section>
    );
}

function CtaSection({ section }: { section: LandingSection }) {
    return (
        <section className="landing-cta">
            <div className="landing-cta__glow" />
            <div className="landing-section-container landing-cta__inner">
                <AnimatedSection>
                    <Leaf className="landing-cta__leaf" />
                    <h2 className="landing-cta__title">
                        {section.title ||
                            "Jadilah Bagian dari Perubahan"}
                    </h2>
                    <p className="landing-cta__subtitle">
                        {section.subtitle ||
                            "Dukung produk lokal dengan setiap transaksi. Bersama Ecosera, kemajuan dimulai dari desa."}
                    </p>
                    {section.cta_text && (
                        <Link
                            to={section.cta_link || "/etalase"}
                            className="landing-cta__button"
                        >
                            {section.cta_text}
                            <ArrowRight className="landing-cta__button-icon" />
                        </Link>
                    )}
                </AnimatedSection>
            </div>
        </section>
    );
}

function CustomSection({ section }: { section: LandingSection }) {
    return (
        <section className="landing-custom">
            <div className="landing-section-container">
                <AnimatedSection>
                    {section.title && (
                        <h2 className="landing-section-title">
                            {section.title}
                        </h2>
                    )}
                    {section.subtitle && (
                        <p className="landing-section-body" style={{ marginTop: "0.5rem" }}>
                            {section.subtitle}
                        </p>
                    )}
                    {section.content && (
                        <p className="landing-section-body" style={{ marginTop: "1rem" }}>
                            {section.content}
                        </p>
                    )}
                    {section.image_url && (
                        <div className="landing-custom__image-wrap">
                            <img
                                src={section.image_url}
                                alt={section.title || ""}
                                className="landing-custom__image"
                            />
                        </div>
                    )}
                    {section.cta_text && (
                        <div style={{ marginTop: "2rem", textAlign: "center" }}>
                            <Link
                                to={section.cta_link || "/"}
                                className="landing-hero__cta"
                            >
                                {section.cta_text}
                                <ArrowRight className="landing-hero__cta-icon" />
                            </Link>
                        </div>
                    )}
                </AnimatedSection>
            </div>
        </section>
    );
}

/* ── Renderer map ───────────────────────────────────────────────────  */
const RENDERERS: Record<
    string,
    (props: { section: LandingSection }) => JSX.Element
> = {
    hero: HeroSection,
    challenge: ChallengeSection,
    solution: SolutionSection,
    impact: ImpactSection,
    cta: CtaSection,
};

/* ── Main component ─────────────────────────────────────────────────  */
export default function Landing({ previewSections }: { previewSections?: LandingSection[] }) {
    const [sections, setSections] = useState<LandingSection[]>([]);
    const [loading, setLoading] = useState(!previewSections);

    useEffect(() => {
        if (previewSections) {
            setSections(previewSections);
            setLoading(false);
            return;
        }
        getActiveLandingSections()
            .then(setSections)
            .finally(() => setLoading(false));
    }, [previewSections]);

    if (loading) {
        return (
            <div className="landing-loading">
                <div className="landing-loading__spinner" />
                <p className="landing-loading__text">Memuat...</p>
            </div>
        );
    }

    if (sections.length === 0) {
        return (
            <div className="landing-empty">
                <Leaf className="landing-empty__icon" />
                <h2 className="landing-empty__title">Segera Hadir</h2>
                <p className="landing-empty__subtitle">
                    Halaman landing sedang dalam pengembangan.
                </p>
                <Link to="/" className="landing-hero__cta" style={{ marginTop: "1.5rem" }}>
                    Kembali ke Beranda
                    <ArrowRight className="landing-hero__cta-icon" />
                </Link>
            </div>
        );
    }

    return (
        <div className="landing-page">
            {sections.map((section) => {
                const Renderer = RENDERERS[section.section_key] || CustomSection;
                return <Renderer key={section.id} section={section} />;
            })}

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-section-container">
                    <div className="landing-footer__inner">
                        <div className="landing-footer__brand">
                            <Leaf className="landing-footer__leaf" />
                            <span className="landing-footer__name">
                                Ecosera
                            </span>
                        </div>
                        <p className="landing-footer__copy">
                            &copy; {new Date().getFullYear()} Ecosera.
                            Dari desa untuk dunia.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
