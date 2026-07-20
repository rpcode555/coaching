"use client";

import { useState, useEffect } from "react";
import { addEnrollment } from "@/lib/db";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const courseOptions = [
  "Foundation (Class 5-7)",
  "Madhyamik Prep (Class 8-10)",
  "Higher Secondary (Class 11-12)",
  "JEE Preparation",
  "NEET Preparation",
  "WBJEE Preparation",
];

export default function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    guardianName: "",
    phone: "",
    email: "",
    course: "",
    className: "",
    address: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape & lock scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          name: "", guardianName: "", phone: "", email: "",
          course: "", className: "", address: "", message: "",
        });
        setSuccess(false);
        setError("");
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addEnrollment(formData);
      setSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to submit enrollment. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl glass-dark border border-white/10 shadow-2xl shadow-black/40 animate-scale-in custom-scrollbar">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-navy-300 hover:text-white z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {success ? (
            /* ── Success State ── */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-scale-in">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-3">
                Enrollment Submitted!
              </h2>
              <p className="text-navy-300 text-sm mb-6">
                Thank you for your interest in সাফল্য Coaching Center. We&apos;ll contact you shortly.
              </p>
              <button onClick={onClose} className="btn-primary">
                <span>Close</span>
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  Enroll Now
                </h2>
                <p className="text-navy-400 text-sm">
                  Fill in your details to join সাফল্য Coaching Center
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="name"
                    type="text"
                    placeholder="Student Name *"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    name="guardianName"
                    type="text"
                    placeholder="Guardian Name *"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Course *</option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    name="className"
                    type="text"
                    placeholder="Current Class"
                    value={formData.className}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <textarea
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  rows={2}
                />

                <textarea
                  name="message"
                  placeholder="Any message (optional)"
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field"
                  rows={2}
                />

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary !rounded-xl !py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Submitting..." : "Submit Enrollment"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
