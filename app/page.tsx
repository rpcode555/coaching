"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnrollmentModal from "@/components/EnrollmentModal";
import {
  getTeachers,
  getReviews,
  getGalleryImages,
  Teacher,
  Review,
  GalleryImage,
} from "@/lib/db";

/* ═══════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/* ═══════════════════════════════════════════
   Animated Counter
   ═══════════════════════════════════════════ */

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useInView(0.3);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    let current = 0;
    const step = Math.max(1, target / 70);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Section with Reveal Animation
   ═══════════════════════════════════════════ */

function Section({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  const { ref, isVisible } = useInView(0.08);
  return (
    <section id={id} ref={ref} className={`section-reveal ${isVisible ? "visible" : ""} ${className}`}>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════
   Helper: deterministic gradient from name
   ═══════════════════════════════════════════ */

const GRADIENTS = [
  "from-pink-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ═══════════════════════════════════════════
   Static Data
   ═══════════════════════════════════════════ */

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: "Expert Faculty",
    description: "Experienced teachers from top institutions who don\u2019t just teach \u2014 they inspire and transform potential into achievement.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Proven Results",
    description: "95%+ students achieve distinction in board examinations \u2014 a testament to our structured teaching methodology and care.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Smart Learning",
    description: "Interactive digital classrooms with modern teaching aids make complex concepts simple, engaging, and easy to remember.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Personal Attention",
    description: "Small batch sizes ensure every student gets individualized focus, doubt-clearing sessions, and personalized study plans.",
  },
];

const defaultTeachers = [
  {
    name: "Prasenjit Pal",
    subject: "English",
    qualification: "B.Ed.",
    experience: "20+ Years of Teaching Experience",
    photoURL: "",
  },
  {
    name: "Lalan Mandal",
    subject: "Science",
    qualification: "",
    experience: "15+ Years of Teaching Experience",
    photoURL: "",
  },
  {
    name: "Makhan Maji",
    subject: "Bengali, Geography & History",
    qualification: "",
    experience: "18+ Years of Teaching Experience",
    photoURL: "",
  },
];

const coursesData = [
  { title: "Foundation", classes: "Class 5 \u2013 7", description: "Build strong fundamentals and develop a love for learning from an early age.", subjects: ["Mathematics", "Science", "English", "Bengali"], color: "from-emerald-500/20 to-teal-500/10", accent: "text-emerald-400", border: "border-emerald-500/20", icon: "\uD83C\uDF31" },
  { title: "Madhyamik Prep", classes: "Class 8 \u2013 10", description: "Comprehensive preparation for board exams with focus on concept clarity.", subjects: ["Mathematics", "Physical Science", "Life Science", "English", "Bengali"], color: "from-blue-500/20 to-indigo-500/10", accent: "text-blue-400", border: "border-blue-500/20", icon: "\uD83D\uDCDA" },
  { title: "Higher Secondary", classes: "Class 11 \u2013 12", description: "Master advanced concepts and excel in your HS examinations.", subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"], color: "from-purple-500/20 to-violet-500/10", accent: "text-purple-400", border: "border-purple-500/20", icon: "\uD83C\uDF93" },
  { title: "Competitive Exams", classes: "JEE \u2022 NEET \u2022 WBJEE", description: "Crack India\u2019s toughest entrance exams with expert guidance and strategies.", subjects: ["JEE Main & Advanced", "NEET UG", "WBJEE", "Olympiads"], color: "from-gold-500/20 to-amber-500/10", accent: "text-gold-400", border: "border-gold-500/20", icon: "\uD83C\uDFC6" },
];

const stats = [
  { value: 5000, suffix: "+", label: "Students Mentored" },
  { value: 95, suffix: "%", label: "Success Rate" },
  { value: 50, suffix: "+", label: "Expert Faculty" },
  { value: 15, suffix: "+", label: "Years of Excellence" },
];

const defaultTestimonials = [
  { name: "Ananya Banerjee", achievement: "Madhyamik 2025 Topper", quote: "\u09B8\u09BE\u09AB\u09B2\u09CD\u09AF Coaching Center completely transformed my approach to studies. The teachers here don\u2019t just teach \u2014 they inspire. I scored 98% thanks to their guidance!" },
  { name: "Rahul Mondal", achievement: "JEE Main 2025 \u2014 AIR 342", quote: "The personal attention and structured study plans helped me crack JEE Main with an excellent rank. The doubt-clearing sessions were invaluable." },
  { name: "Riya Das", achievement: "HS 2025 Science \u2014 98 in Math", quote: "From struggling in Mathematics to scoring 98, the journey at \u09B8\u09BE\u09AB\u09B2\u09CD\u09AF has been incredible. The faculty made every concept crystal clear." },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [extraTeachers, setExtraTeachers] = useState<Teacher[]>([]);
  const [extraReviews, setExtraReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    setMounted(true);
    loadDynamicData();
  }, []);

  async function loadDynamicData() {
    try {
      const [teachers, reviews, images] = await Promise.all([
        getTeachers().catch(() => []),
        getReviews().catch(() => []),
        getGalleryImages().catch(() => []),
      ]);
      setExtraTeachers(teachers);
      setExtraReviews(reviews);
      setGalleryImages(images);
    } catch {
      // Firestore may not be set up yet
    }
  }

  /* Merge hardcoded + Firestore teachers */
  const allTeachers = [
    ...defaultTeachers,
    ...extraTeachers.map((t) => ({
      name: t.name,
      subject: t.subject,
      qualification: t.qualification,
      experience: t.experience,
      photoURL: t.photoURL,
    })),
  ];

  /* Merge hardcoded + Firestore reviews */
  const allTestimonials = [
    ...defaultTestimonials,
    ...extraReviews.map((r) => ({
      name: r.name,
      achievement: r.achievement,
      quote: r.quote,
    })),
  ];

  const openEnroll = () => setShowEnrollModal(true);

  return (
    <div className="min-h-screen bg-navy-950 text-navy-100">
      <Navbar />
      <EnrollmentModal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} />

      {/* ═══ HERO ═══ */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
        <div className="orb w-[500px] h-[500px] bg-gold-500 -top-[10%] -right-[5%] animate-float" />
        <div className="orb w-[400px] h-[400px] bg-navy-500 -bottom-[15%] -left-[10%] animate-float" style={{ animationDelay: "3s" }} />
        <div className="orb w-[300px] h-[300px] bg-gold-600 top-[40%] left-[60%] animate-float" style={{ animationDelay: "5s" }} />
        <div className="absolute inset-0 grid-pattern" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className={`mb-8 transition-all duration-1000 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full overflow-hidden ring-4 ring-gold-500/30 shadow-2xl shadow-gold-500/20 animate-pulse-glow">
              <Image src="/logo.png" alt="সাফল্য Coaching Center" fill className="object-cover" priority sizes="(max-width: 640px) 144px, 176px" />
            </div>
          </div>

          <h1 className={`text-5xl sm:text-6xl lg:text-8xl font-extrabold mb-4 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <span className="gradient-text">সাফল্য</span>
          </h1>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-medium text-navy-200 mb-3 tracking-wide transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            Coaching Center
          </p>

          <div className={`flex items-center justify-center gap-3 sm:gap-4 text-gold-400 text-lg sm:text-xl mb-10 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <span className="font-medium">শিক্ষা</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="font-medium">দীক্ষা</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="font-medium">সাফল্য</span>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <button onClick={openEnroll} className="btn-primary text-lg">
              <span>Enroll Now</span>
            </button>
            <a href="#courses" className="btn-secondary text-lg">Explore Courses</a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
          <svg className="w-6 h-6 text-gold-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══ FEATURES / ABOUT ═══ */}
      <Section id="about" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/50 to-navy-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Why Choose <span className="gradient-text">সাফল্য</span>?</h2>
            <p className="text-navy-300 max-w-2xl mx-auto text-lg">We don&apos;t just prepare students for exams — we prepare them for success in life.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="gradient-border card-hover p-6 rounded-2xl" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 mb-5">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-navy-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FACULTY ═══ */}
      <Section id="faculty" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">Meet Our Team</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Our Expert <span className="gradient-text">Faculty</span></h2>
            <p className="text-navy-300 max-w-2xl mx-auto text-lg">Learn from the best — our dedicated teachers bring years of expertise and passion to every class.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTeachers.map((teacher, i) => (
              <div key={`${teacher.name}-${i}`} className="gradient-border card-hover p-8 rounded-2xl text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Avatar */}
                {teacher.photoURL ? (
                  <img src={teacher.photoURL} alt={teacher.name} className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-gold-500/20 mb-5" />
                ) : (
                  <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${gradientFor(teacher.name)} flex items-center justify-center text-white font-bold text-2xl ring-4 ring-gold-500/20 mb-5`}>
                    {initialsOf(teacher.name)}
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-1">{teacher.name}</h3>

                {/* Subject tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {teacher.subject.split(",").map((s) => (
                    <span key={s.trim()} className="text-xs px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                      {s.trim()}
                    </span>
                  ))}
                </div>

                {teacher.qualification && (
                  <p className="text-navy-300 text-sm mb-1">
                    <span className="text-navy-500">Qualification:</span> {teacher.qualification}
                  </p>
                )}
                <p className="text-navy-400 text-sm">{teacher.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ COURSES ═══ */}
      <Section id="courses" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">Our Programs</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Courses We Offer</h2>
            <p className="text-navy-300 max-w-2xl mx-auto text-lg">Tailored programs for every stage of your academic journey, from foundation to competitive exam mastery.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coursesData.map((course, i) => (
              <div key={course.title} className={`relative group rounded-2xl bg-gradient-to-br ${course.color} border ${course.border} p-8 card-hover overflow-hidden`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 text-7xl flex items-center justify-center pointer-events-none select-none">{course.icon}</div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl mb-2 block">{course.icon}</span>
                      <h3 className="text-xl font-bold text-white">{course.title}</h3>
                      <span className={`text-sm font-medium ${course.accent}`}>{course.classes}</span>
                    </div>
                  </div>
                  <p className="text-navy-300 text-sm leading-relaxed mb-5">{course.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {course.subjects.map((s) => (
                      <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-navy-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ STATS ═══ */}
      <Section id="stats" className="py-24 lg:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold gradient-text mb-2">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-navy-300 text-sm sm:text-base font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ TESTIMONIALS ═══ */}
      <Section id="testimonials" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">Student Stories</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Our <span className="gradient-text">Success</span> Stories</h2>
            <p className="text-navy-300 max-w-2xl mx-auto text-lg">Hear from students whose lives were transformed at সাফল্য Coaching Center.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTestimonials.map((t, i) => (
              <div key={`${t.name}-${i}`} className="gradient-border card-hover p-8 rounded-2xl relative" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="text-gold-500/20 text-6xl font-serif leading-none mb-4 select-none">&ldquo;</div>
                <p className="text-navy-300 text-sm leading-relaxed mb-6 italic">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradientFor(t.name)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {initialsOf(t.name)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-gold-400/80 text-xs">{t.achievement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CLASSROOM GALLERY ═══ */}
      {galleryImages.length > 0 && (
        <Section id="gallery" className="py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/50 to-navy-950" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-gold-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">Inside Our Campus</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Our <span className="gradient-text">Classrooms</span></h2>
              <p className="text-navy-300 max-w-2xl mx-auto text-lg">Take a look at our modern learning environment designed for student success.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.map((img, i) => (
                <div key={img.id} className="group relative rounded-2xl overflow-hidden card-hover" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="aspect-[4/3] relative">
                    <img src={img.url} alt={img.caption || "Classroom"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ═══ CTA ═══ */}
      <Section id="cta" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="orb w-[350px] h-[350px] bg-gold-500 -top-[20%] left-[10%]" />
        <div className="orb w-[250px] h-[250px] bg-navy-400 -bottom-[15%] right-[5%]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Start Your Journey<br />
            <span className="gradient-text">to Success?</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto mb-10">
            Join thousands of successful students who found their path at সাফল্য Coaching Center. Enroll today and take the first step towards academic excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={openEnroll} className="btn-primary text-lg">
              <span>Enroll Now</span>
              <span className="relative z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <a href="tel:+919046828036" className="btn-secondary text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
          </div>
        </div>
      </Section>

      {/* ═══ CONTACT ═══ */}
      <Section id="contact" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Contact <span className="gradient-text">Us</span></h2>
            <p className="text-navy-300 max-w-2xl mx-auto text-lg">Have questions? Reach out to us and we&apos;ll help you get started on your journey to success.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="gradient-border card-hover p-8 rounded-2xl text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 mb-5">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Visit Us</h3>
              <p className="text-navy-400 text-sm">Bhabanipur Busstand,<br />Birbhum, West Bengal 731126</p>
            </div>
            <div className="gradient-border card-hover p-8 rounded-2xl text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 mb-5">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Call Us</h3>
              <p className="text-navy-400 text-sm">+91 9046828036</p>
              <p className="text-navy-500 text-xs mt-1">Mon – Sat, 7 AM – 9 PM</p>
            </div>
            <div className="gradient-border card-hover p-8 rounded-2xl text-center sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 mb-5">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Email Us</h3>
              <p className="text-navy-400 text-sm">info@safalya.edu.in</p>
              <p className="text-navy-500 text-xs mt-1">We reply within 24 hours</p>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
