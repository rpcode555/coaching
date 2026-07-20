"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "./LoginModal";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Courses", href: "#courses" },
  { label: "Our Classroom", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = () => setIsProfileMenuOpen(false);
    if (isProfileMenuOpen) {
      setTimeout(() => document.addEventListener("click", handleClick), 0);
    }
    return () => document.removeEventListener("click", handleClick);
  }, [isProfileMenuOpen]);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-dark py-3 shadow-lg shadow-black/20"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* ── Logo ── */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-gold-500/30 group-hover:ring-gold-500/60 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="সাফল্য"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold gradient-text leading-tight">
                  সাফল্য
                </span>
                <span className="hidden sm:block text-[10px] text-gold-400/70 tracking-[0.2em] uppercase leading-tight">
                  Coaching Center
                </span>
              </div>
            </a>

            {/* ── Desktop Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  className="px-4 py-2 text-sm font-medium text-navy-200 hover:text-gold-400 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* ── Auth + Mobile Toggle ── */}
            <div className="flex items-center gap-3">
              {!loading && user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-all duration-300"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-navy-950 font-bold text-sm">
                        {(
                          user.displayName?.[0] ||
                          user.email?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm text-navy-100 max-w-[100px] truncate">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <svg
                      className={`w-4 h-4 text-navy-300 transition-transform duration-300 ${
                        isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Profile dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl glass-dark shadow-xl shadow-black/30 animate-slide-down">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-navy-100 truncate">
                          {user.displayName || "Student"}
                        </p>
                        <p className="text-xs text-navy-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 mt-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : !loading ? (
                <button
                  id="login-button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="btn-primary text-sm !py-2.5 !px-6 !rounded-full"
                >
                  <span>Login</span>
                </button>
              ) : null}

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                  <span
                    className={`block h-0.5 w-full bg-navy-200 transition-all duration-300 origin-center ${
                      isMobileMenuOpen
                        ? "rotate-45 translate-y-[4px]"
                        : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-full bg-navy-200 transition-all duration-300 ${
                      isMobileMenuOpen ? "opacity-0 scale-0" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-full bg-navy-200 transition-all duration-300 origin-center ${
                      isMobileMenuOpen
                        ? "-rotate-45 -translate-y-[4px]"
                        : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen
              ? "max-h-80 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 mt-2 mx-4 rounded-2xl glass-dark">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href);
                }}
                className="block px-4 py-3 text-sm font-medium text-navy-200 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
