"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment,
  getTeachers,
  addTeacher,
  deleteTeacher,
  deleteFromStorage,
  getReviews,
  addReview,
  deleteReview,
  getGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  uploadImage,
  Enrollment,
  Teacher,
  Review,
  GalleryImage,
} from "@/lib/db";

type Tab = "enrollments" | "teachers" | "reviews" | "gallery";

const TABS: { key: Tab; label: string }[] = [
  { key: "enrollments", label: "📋 Enrollments" },
  { key: "teachers", label: "👨‍🏫 Teachers" },
  { key: "reviews", label: "⭐ Reviews" },
  { key: "gallery", label: "🖼️ Gallery" },
];

/* ═══════════════════════════════════════════
   Admin Page (root)
   ═══════════════════════════════════════════ */

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("enrollments");

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "palranjan144@gmail.com").trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();
  const isAdmin = !!userEmail && userEmail === adminEmail;

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gold-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginForm adminEmail={adminEmail} />;
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* ── Header ── */}
      <header className="glass-dark border-b border-white/5 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group" title="Go to Website">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gold-500/40 group-hover:ring-gold-500/80 transition-all shadow-lg shadow-gold-500/10">
                <Image src="/logo.png" alt="সাফল্য Logo" fill className="object-cover" sizes="48px" priority />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text leading-tight">সাফল্য</span>
                <span className="text-[10px] text-gold-400/80 tracking-[0.2em] uppercase font-semibold">Admin Panel</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-navy-400">{user?.email}</span>
            <Link
              href="/"
              className="text-sm text-navy-300 hover:text-gold-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Site
            </Link>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="border-b border-white/5 bg-navy-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-gold-500 text-gold-400"
                    : "border-transparent text-navy-400 hover:text-navy-200 hover:border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "enrollments" && <EnrollmentsTab />}
        {activeTab === "teachers" && <TeachersTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "gallery" && <GalleryTab />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ENROLLMENTS TAB
   ═══════════════════════════════════════════ */

function EnrollmentsTab() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setItems(await getEnrollments());
    } catch {
      setError("Failed to load enrollments. Make sure Firestore is enabled.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: string, status: string) {
    try {
      await updateEnrollmentStatus(id, status);
      setItems((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: status as Enrollment["status"] } : e,
        ),
      );
    } catch {
      alert("Failed to update status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this enrollment? This cannot be undone.")) return;
    try {
      await deleteEnrollment(id);
      setItems((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  if (loading) return <LoadingSpinner label="Loading enrollments..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Enrollments{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length})
          </span>
        </h2>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="📋" message="No enrollments yet. They will appear here when students fill the enrollment form on your website." />
      ) : (
        <div className="space-y-4">
          {items.map((e) => (
            <div key={e.id} className="gradient-border p-5 sm:p-6 rounded-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-white font-semibold text-base">{e.name}</h3>
                  <p className="text-navy-400 text-sm">
                    Guardian: {e.guardianName}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-navy-300">
                    <span>📞 {e.phone}</span>
                    {e.email && <span>✉️ {e.email}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {e.course && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {e.course}
                      </span>
                    )}
                    {e.className && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Class: {e.className}
                      </span>
                    )}
                  </div>
                  {e.address && (
                    <p className="text-navy-500 text-xs mt-2">📍 {e.address}</p>
                  )}
                  {e.message && (
                    <p className="text-navy-400 text-xs mt-1 italic">
                      &ldquo;{e.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <select
                    value={e.status}
                    onChange={(ev) => changeStatus(e.id, ev.target.value)}
                    className={`status-select text-xs px-3 py-1.5 rounded-full border font-medium ${
                      e.status === "new"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : e.status === "contacted"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    <option value="new">🟡 New</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="enrolled">🟢 Enrolled</option>
                  </select>
                  <DeleteButton onClick={() => remove(e.id)} />
                </div>
              </div>
              <p className="text-navy-600 text-xs mt-3">
                {formatDate(e.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TEACHERS TAB
   ═══════════════════════════════════════════ */

function TeachersTab() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", qualification: "", experience: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setItems(await getTeachers());
    } catch {
      setError("Failed to load teachers. Make sure Firestore is enabled.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let photoURL = "";
      let photoPath = "";
      if (photoFile) {
        const res = await uploadImage(photoFile, "teachers");
        photoURL = res.url;
        photoPath = res.path;
      }
      await addTeacher({
        ...form,
        photoURL,
        photoPath,
        order: items.length,
      });
      setForm({ name: "", subject: "", qualification: "", experience: "" });
      setPhotoFile(null);
      setShowForm(false);
      await load();
    } catch {
      alert("Failed to add teacher. Check Firebase Storage permissions.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string, photoPath?: string) {
    if (!confirm("Delete this teacher?")) return;
    try {
      if (photoPath) await deleteFromStorage(photoPath);
      await deleteTeacher(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  if (loading) return <LoadingSpinner label="Loading teachers..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Teachers{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} in database)
          </span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm !py-2 !px-5"
        >
          <span>{showForm ? "Cancel" : "+ Add Teacher"}</span>
        </button>
      </div>

      <p className="text-navy-500 text-xs mb-6">
        Note: 3 default teachers (Prasenjit Pal, Lalan Mandal, Makhan Maji) are
        always shown on the website. Teachers added here appear alongside them.
      </p>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="gradient-border p-6 rounded-xl mb-6 space-y-4 animate-slide-down"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Teacher Name *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Subject(s) *"
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Qualification (e.g., B.Ed.)"
              value={form.qualification}
              onChange={(e) =>
                setForm((p) => ({ ...p, qualification: e.target.value }))
              }
              className="input-field"
            />
            <input
              type="text"
              placeholder="Experience (e.g., 10+ Years) *"
              value={form.experience}
              onChange={(e) =>
                setForm((p) => ({ ...p, experience: e.target.value }))
              }
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-navy-400 mb-2">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="text-sm text-navy-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500/10 file:text-gold-400 file:font-medium file:cursor-pointer hover:file:bg-gold-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm !py-2.5 disabled:opacity-50"
          >
            <span>{submitting ? "Adding..." : "Add Teacher"}</span>
          </button>
        </form>
      )}

      {/* List */}
      {items.length === 0 ? (
        <EmptyState
          icon="👨‍🏫"
          message='No teachers in database yet. Click "+ Add Teacher" to add faculty members beyond the 3 defaults.'
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="gradient-border p-5 rounded-xl relative group"
            >
              <button
                onClick={() => remove(t.id, t.photoPath)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete teacher"
              >
                <TrashIcon />
              </button>
              <div className="flex items-center gap-4">
                {t.photoURL ? (
                  <img
                    src={t.photoURL}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-navy-950 font-bold text-lg shrink-0">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {t.name}
                  </h3>
                  <p className="text-gold-400 text-xs">{t.subject}</p>
                  {t.qualification && (
                    <p className="text-navy-400 text-xs">{t.qualification}</p>
                  )}
                  <p className="text-navy-500 text-xs">{t.experience}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVIEWS TAB
   ═══════════════════════════════════════════ */

function ReviewsTab() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", achievement: "", quote: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setItems(await getReviews());
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(form);
      setForm({ name: "", achievement: "", quote: "" });
      setShowForm(false);
      await load();
    } catch {
      alert("Failed to add review");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  if (loading) return <LoadingSpinner label="Loading reviews..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Reviews{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} in database)
          </span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm !py-2 !px-5"
        >
          <span>{showForm ? "Cancel" : "+ Add Review"}</span>
        </button>
      </div>

      <p className="text-navy-500 text-xs mb-6">
        3 default testimonials are always shown. Reviews added here appear
        alongside them on the website.
      </p>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="gradient-border p-6 rounded-xl mb-6 space-y-4 animate-slide-down"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Student Name *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Achievement (e.g., Madhyamik 2025 Topper) *"
              value={form.achievement}
              onChange={(e) =>
                setForm((p) => ({ ...p, achievement: e.target.value }))
              }
              className="input-field"
              required
            />
          </div>
          <textarea
            placeholder="Review / Testimonial Quote *"
            value={form.quote}
            onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
            className="input-field"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm !py-2.5 disabled:opacity-50"
          >
            <span>{submitting ? "Adding..." : "Add Review"}</span>
          </button>
        </form>
      )}

      {/* List */}
      {items.length === 0 ? (
        <EmptyState
          icon="⭐"
          message='No reviews in database. Click "+ Add Review" to add student testimonials.'
        />
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <div
              key={r.id}
              className="gradient-border p-5 rounded-xl relative group"
            >
              <button
                onClick={() => remove(r.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete review"
              >
                <TrashIcon />
              </button>
              <div className="text-gold-500/30 text-3xl font-serif leading-none mb-2 select-none">
                &ldquo;
              </div>
              <p className="text-navy-300 text-sm leading-relaxed mb-3 italic">
                {r.quote}
              </p>
              <p className="text-white text-sm font-medium">
                {r.name}{" "}
                <span className="text-gold-400/70 text-xs font-normal">
                  — {r.achievement}
                </span>
              </p>
              <p className="text-navy-600 text-xs mt-2">
                {formatDate(r.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   GALLERY TAB
   ═══════════════════════════════════════════ */

function GalleryTab() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setItems(await getGalleryImages());
    } catch {
      setError("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;
    setSubmitting(true);
    try {
      const res = await uploadImage(imageFile, "gallery");
      await addGalleryImage({
        url: res.url,
        storagePath: res.path,
        caption,
        order: items.length,
      });
      setImageFile(null);
      setCaption("");
      setPreview(null);
      setShowForm(false);
      await load();
    } catch {
      alert("Failed to upload. Check Firebase Storage permissions.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string, storagePath?: string) {
    if (!confirm("Delete this image?")) return;
    try {
      if (storagePath) await deleteFromStorage(storagePath);
      await deleteGalleryImage(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  if (loading) return <LoadingSpinner label="Loading gallery..." />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Classroom Gallery{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} images)
          </span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm !py-2 !px-5"
        >
          <span>{showForm ? "Cancel" : "+ Upload Image"}</span>
        </button>
      </div>

      <p className="text-navy-500 text-xs mb-6">
        Upload photos of your classrooms. They appear in the &quot;Our
        Classrooms&quot; section on the website.
      </p>

      {/* Upload Form */}
      {showForm && (
        <form
          onSubmit={handleUpload}
          className="gradient-border p-6 rounded-xl mb-6 space-y-4 animate-slide-down"
        >
          <div>
            <label className="block text-sm text-navy-400 mb-2">
              Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-navy-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500/10 file:text-gold-400 file:font-medium file:cursor-pointer hover:file:bg-gold-500/20"
              required
            />
          </div>

          {preview && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-48 object-cover"
              />
            </div>
          )}

          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field"
          />

          <button
            type="submit"
            disabled={submitting || !imageFile}
            className="btn-primary text-sm !py-2.5 disabled:opacity-50"
          >
            <span>{submitting ? "Uploading..." : "Upload Image"}</span>
          </button>
        </form>
      )}

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <EmptyState
          icon="🖼️"
          message='No classroom images yet. Click "+ Upload Image" to add photos of your classrooms.'
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-white/5"
            >
              <div className="aspect-[4/3]">
                <img
                  src={img.url}
                  alt={img.caption || "Classroom"}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => remove(img.id, img.storagePath)}
                  className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  title="Delete image"
                >
                  <TrashIcon />
                </button>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-navy-950/90 to-transparent">
                  <p className="text-white text-xs">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Shared UI Components
   ═══════════════════════════════════════════ */

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-navy-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      ⚠️ {message}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-16">
      <span className="text-5xl mb-4 block">{icon}</span>
      <p className="text-navy-400 text-sm max-w-md mx-auto">{message}</p>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors"
      title="Delete"
    >
      <TrashIcon />
    </button>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function formatDate(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp?.toDate) return "Just now";
  try {
    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Just now";
  }
}

/* ═══════════════════════════════════════════
   ADMIN LOGIN FORM COMPONENT
   ═══════════════════════════════════════════ */

function AdminLoginForm({ adminEmail }: { adminEmail: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const { user, signInWithGoogle, signInWithEmail, signOut, error, clearError } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    clearError();
    try {
      await signInWithEmail(email, password);
    } catch {
      // Error handled by AuthContext or error state
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError("");
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const isUnauthorizedUser = user && user.email?.toLowerCase().trim() !== adminEmail;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb w-[400px] h-[400px] bg-gold-500 -top-[10%] -left-[10%] animate-float" />
      <div className="orb w-[300px] h-[300px] bg-navy-500 -bottom-[10%] -right-[10%] animate-float" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Top brand */}
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-gold-500/30 shadow-xl shadow-gold-500/20">
            <Image src="/logo.png" alt="সাফল্য Logo" fill className="object-cover" priority sizes="80px" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">Admin Portal</h1>
          <p className="text-navy-300 text-sm mt-1">সাফল্য Coaching Center Management</p>
        </div>

        {/* Card */}
        <div className="gradient-border p-8 rounded-2xl shadow-2xl glass-dark">
          {isUnauthorizedUser ? (
            /* Logged in with wrong account */
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                <p className="font-semibold text-base mb-1">Access Restricted</p>
                <p className="text-xs text-navy-300">
                  Currently logged in as: <span className="text-white font-medium">{user.email}</span>
                </p>
                <p className="text-xs text-navy-400 mt-2">
                  This account does not have admin access. Only <span className="text-gold-400 font-mono">{adminEmail}</span> can access the admin dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => signOut()}
                  className="w-full btn-primary !py-3 text-sm"
                >
                  <span>Sign Out & Try Admin Account</span>
                </button>

                <Link href="/" className="btn-secondary !py-2.5 text-xs text-navy-300">
                  Return to Website
                </Link>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-6">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-navy-100 hover:bg-white/10 hover:border-gold-500/30 transition-all font-medium text-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#0d1526] text-navy-400">or admin email & password</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field !pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {(error || localError) && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <span>⚠️</span> {error || localError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary !py-3 text-sm font-semibold disabled:opacity-50"
                >
                  <span>{loading ? "Authenticating..." : "Login to Admin Panel"}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">
            ← Back to Main Website
          </Link>
        </div>
      </div>
    </div>
  );
}
