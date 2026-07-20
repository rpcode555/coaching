"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createAdminUserAccount } from "@/lib/firebase";
import {
  getEnrollments,
  updateEnrollmentStatus,
  updateEnrollment,
  deleteEnrollment,
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  deleteFromStorage,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getGalleryImages,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  uploadImage,
  getAdmins,
  addAdminUser,
  deleteAdminUser,
  trackAdminLogin,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  Course,
  Enrollment,
  Teacher,
  Review,
  GalleryImage,
  AdminUser,
} from "@/lib/db";

type Tab = "enrollments" | "courses" | "teachers" | "reviews" | "gallery" | "admins";

const TABS: { key: Tab; label: string }[] = [
  { key: "enrollments", label: "📋 Enrollments" },
  { key: "courses", label: "📚 Courses" },
  { key: "teachers", label: "👨‍🏫 Teachers" },
  { key: "reviews", label: "⭐ Reviews" },
  { key: "gallery", label: "🖼️ Gallery" },
  { key: "admins", label: "👑 Admin Users" },
];


/* ═══════════════════════════════════════════
   Admin Page (root)
   ═══════════════════════════════════════════ */

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("enrollments");
  const [adminList, setAdminList] = useState<AdminUser[]>([]);

  useEffect(() => {
    getAdmins().then(setAdminList).catch(() => { });
  }, []);

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "palranjan144@gmail.com").trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();
  const isSuperAdmin = !!userEmail && userEmail === adminEmail;
  const isDbAdmin = !!userEmail && adminList.some((a) => a.email.toLowerCase() === userEmail);
  const isAdmin = isSuperAdmin || isDbAdmin;

  useEffect(() => {
    if (isAdmin && userEmail) {
      trackAdminLogin(userEmail, user?.displayName || "Admin").catch(() => { });
    }
  }, [isAdmin, userEmail, user?.displayName]);



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
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.key
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
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "teachers" && <TeachersTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "gallery" && <GalleryTab />}
        {activeTab === "admins" && <AdminsTab currentUserEmail={user?.email || ""} superAdminEmail={adminEmail} />}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    guardianName: "",
    phone: "",
    email: "",
    course: "",
    className: "",
    address: "",
    message: "",
    status: "new",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await getEnrollments());
    } catch {
      setError("Failed to load enrollments. Check your MongoDB connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  function startEdit(e: Enrollment) {
    setEditingId(e.id);
    setEditForm({
      name: e.name || "",
      guardianName: e.guardianName || "",
      phone: e.phone || "",
      email: e.email || "",
      course: e.course || "",
      className: e.className || "",
      address: e.address || "",
      message: e.message || "",
      status: e.status || "new",
    });
  }

  async function handleEdit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      await updateEnrollment(editingId, editForm as Partial<Enrollment>);
      setEditingId(null);
      await load();
    } catch {
      alert("Failed to update enrollment");
    } finally {
      setEditSubmitting(false);
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
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Student Enrollments{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length})
          </span>
        </h2>
        <button onClick={load} className="text-sm text-navy-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
          <RefreshIcon /> Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="📋" message="No enrollments yet. They will appear here when students fill the enrollment form on your website." />
      ) : (
        <div className="space-y-4">
          {items.map((e) => (
            <div key={e.id} className="gradient-border p-5 sm:p-6 rounded-xl relative group">
              {editingId === e.id ? (
                /* ── Edit Form ── */
                <form onSubmit={handleEdit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Student Name *" value={editForm.name} onChange={(ev) => setEditForm((p) => ({ ...p, name: ev.target.value }))} className="input-field text-sm" required />
                    <input type="text" placeholder="Guardian Name *" value={editForm.guardianName} onChange={(ev) => setEditForm((p) => ({ ...p, guardianName: ev.target.value }))} className="input-field text-sm" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="tel" placeholder="Phone *" value={editForm.phone} onChange={(ev) => setEditForm((p) => ({ ...p, phone: ev.target.value }))} className="input-field text-sm" required />
                    <input type="email" placeholder="Email" value={editForm.email} onChange={(ev) => setEditForm((p) => ({ ...p, email: ev.target.value }))} className="input-field text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Course" value={editForm.course} onChange={(ev) => setEditForm((p) => ({ ...p, course: ev.target.value }))} className="input-field text-sm" />
                    <input type="text" placeholder="Class Name" value={editForm.className} onChange={(ev) => setEditForm((p) => ({ ...p, className: ev.target.value }))} className="input-field text-sm" />
                    <select value={editForm.status} onChange={(ev) => setEditForm((p) => ({ ...p, status: ev.target.value }))} className="input-field text-sm">
                      <option value="new">🟡 New</option>
                      <option value="contacted">🔵 Contacted</option>
                      <option value="enrolled">🟢 Enrolled</option>
                    </select>
                  </div>
                  <textarea placeholder="Address" value={editForm.address} onChange={(ev) => setEditForm((p) => ({ ...p, address: ev.target.value }))} className="input-field text-sm" rows={2} />
                  <textarea placeholder="Message" value={editForm.message} onChange={(ev) => setEditForm((p) => ({ ...p, message: ev.target.value }))} className="input-field text-sm" rows={2} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting} className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50">
                      <span>{editSubmitting ? "Saving..." : "Save Enrollment"}</span>
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-navy-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Display ── */
                <>
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
                        className={`status-select text-xs px-3 py-1.5 rounded-full border font-medium ${e.status === "new"
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
                      <button
                        onClick={() => startEdit(e)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-navy-400 hover:text-blue-400 transition-colors"
                        title="Edit Enrollment"
                      >
                        <EditIcon />
                      </button>
                      <DeleteButton onClick={() => remove(e.id)} />
                    </div>
                  </div>
                  <p className="text-navy-600 text-xs mt-3">
                    {formatDate(e.createdAt)}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   COURSES TAB
   ═══════════════════════════════════════════ */

const THEMES: Record<string, { color: string; accent: string; border: string; label: string }> = {
  emerald: {
    label: "Emerald Green",
    color: "from-emerald-500/20 to-teal-500/10",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  blue: {
    label: "Ocean Blue",
    color: "from-blue-500/20 to-indigo-500/10",
    accent: "text-blue-400",
    border: "border-blue-500/20",
  },
  purple: {
    label: "Royal Purple",
    color: "from-purple-500/20 to-violet-500/10",
    accent: "text-purple-400",
    border: "border-purple-500/20",
  },
  gold: {
    label: "Golden Yellow",
    color: "from-gold-500/20 to-amber-500/10",
    accent: "text-gold-400",
    border: "border-gold-500/20",
  },
};

function CoursesTab() {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    classes: "",
    description: "",
    subjects: "",
    icon: "📚",
    theme: "blue",
  });
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    classes: "",
    description: "",
    subjects: "",
    icon: "📚",
    theme: "blue",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await getCourses());
    } catch {
      setError("Failed to load courses. Check your MongoDB connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedTheme = THEMES[form.theme] || THEMES.blue;
      const subjectsArray = form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await addCourse({
        title: form.title,
        classes: form.classes,
        description: form.description,
        subjects: subjectsArray,
        color: selectedTheme.color,
        accent: selectedTheme.accent,
        border: selectedTheme.border,
        icon: form.icon || "📚",
        order: items.length,
      });

      setForm({
        title: "",
        classes: "",
        description: "",
        subjects: "",
        icon: "📚",
        theme: "blue",
      });
      setShowForm(false);
      await load();
    } catch {
      alert("Failed to add course");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(c: Course) {
    let themeKey = "blue";
    if (c.accent?.includes("emerald")) themeKey = "emerald";
    else if (c.accent?.includes("purple")) themeKey = "purple";
    else if (c.accent?.includes("gold")) themeKey = "gold";

    setEditingId(c.id);
    setEditForm({
      title: c.title,
      classes: c.classes,
      description: c.description,
      subjects: Array.isArray(c.subjects) ? c.subjects.join(", ") : "",
      icon: c.icon || "📚",
      theme: themeKey,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      const selectedTheme = THEMES[editForm.theme] || THEMES.blue;
      const subjectsArray = editForm.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateCourse(editingId, {
        title: editForm.title,
        classes: editForm.classes,
        description: editForm.description,
        subjects: subjectsArray,
        color: selectedTheme.color,
        accent: selectedTheme.accent,
        border: selectedTheme.border,
        icon: editForm.icon || "📚",
      });

      setEditingId(null);
      await load();
    } catch {
      alert("Failed to update course");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function moveCourse(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const current = newItems[index];
    const target = newItems[targetIndex];

    const currentOrder = current.order ?? index;
    const targetOrder = target.order ?? targetIndex;

    newItems[index] = { ...target, order: currentOrder };
    newItems[targetIndex] = { ...current, order: targetOrder };
    setItems(newItems);

    try {
      await Promise.all([
        updateCourse(current.id, { order: targetOrder }),
        updateCourse(target.id, { order: currentOrder }),
      ]);
    } catch {
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this course? It will be removed from your website.")) return;
    try {
      await deleteCourse(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete course");
    }
  }

  if (loading) return <LoadingSpinner label="Loading courses..." />;
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Courses We Offer{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} active courses)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm text-navy-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
            <RefreshIcon /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm !py-2 !px-5"
          >
            <span>{showForm ? "Cancel" : "+ Add Course"}</span>
          </button>
        </div>
      </div>

      <p className="text-navy-500 text-xs mb-6">
        Manage the academic programs displayed on your main website.
      </p>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="gradient-border p-6 rounded-xl mb-6 space-y-4 animate-slide-down"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Course Title (e.g., Foundation) *"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Classes (e.g., Class 5 – 7) *"
              value={form.classes}
              onChange={(e) => setForm((p) => ({ ...p, classes: e.target.value }))}
              className="input-field"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Icon (e.g. 📚, 🌱, 🎓) *"
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                className="input-field w-24 text-center"
                required
              />
              <select
                value={form.theme}
                onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}
                className="input-field flex-1"
              >
                {Object.entries(THEMES).map(([k, t]) => (
                  <option key={k} value={k}>
                    Theme: {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            placeholder="Course Description *"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="input-field"
            rows={2}
            required
          />

          <input
            type="text"
            placeholder="Subjects (comma separated e.g. Mathematics, Science, English) *"
            value={form.subjects}
            onChange={(e) => setForm((p) => ({ ...p, subjects: e.target.value }))}
            className="input-field"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm !py-2.5 disabled:opacity-50"
          >
            <span>{submitting ? "Adding Course..." : "Add Course"}</span>
          </button>
        </form>
      )}

      {/* List */}
      {items.length === 0 ? (
        <EmptyState
          icon="📚"
          message='No courses found in database. Click "+ Add Course" to create your first program.'
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((c, idx) => (
            <div
              key={c.id}
              className={`relative rounded-xl bg-gradient-to-br ${c.color || "from-blue-500/20 to-indigo-500/10"} border ${c.border || "border-blue-500/20"} p-6 group transition-all`}
            >
              {editingId === c.id ? (
                /* ── Edit Form ── */
                <form onSubmit={handleEdit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Title *" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="input-field text-sm" required />
                    <input type="text" placeholder="Classes *" value={editForm.classes} onChange={(e) => setEditForm((p) => ({ ...p, classes: e.target.value }))} className="input-field text-sm" required />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Icon *" value={editForm.icon} onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))} className="input-field text-sm w-16 text-center" required />
                      <select value={editForm.theme} onChange={(e) => setEditForm((p) => ({ ...p, theme: e.target.value }))} className="input-field text-sm flex-1">
                        {Object.entries(THEMES).map(([k, t]) => (
                          <option key={k} value={k}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <textarea placeholder="Description *" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className="input-field text-sm" rows={2} required />
                  <input type="text" placeholder="Subjects (comma separated) *" value={editForm.subjects} onChange={(e) => setEditForm((p) => ({ ...p, subjects: e.target.value }))} className="input-field text-sm" required />
                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting} className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50">
                      <span>{editSubmitting ? "Saving..." : "Save"}</span>
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-navy-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Display ── */
                <>
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gold-400 border border-white/10 mr-1">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => moveCourse(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-navy-300 hover:text-white transition-colors disabled:opacity-30"
                      title="Move Up (Show earlier)"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveCourse(idx, "down")}
                      disabled={idx === items.length - 1}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-navy-300 hover:text-white transition-colors disabled:opacity-30"
                      title="Move Down (Show later)"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => startEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-navy-300 hover:text-blue-400 transition-colors"
                      title="Edit course"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-300 hover:text-red-400 transition-colors"
                      title="Delete course"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-3xl select-none">{c.icon || "📚"}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">{c.title}</h3>
                      <span className={`text-xs font-semibold ${c.accent || "text-blue-400"}`}>
                        {c.classes}
                      </span>
                    </div>
                  </div>

                  <p className="text-navy-300 text-xs leading-relaxed my-3">{c.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(c.subjects) &&
                      c.subjects.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-navy-200"
                        >
                          {s}
                        </span>
                      ))}
                  </div>
                </>
              )}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", subject: "", qualification: "", experience: "" });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await getTeachers());
    } catch {
      setError("Failed to load teachers. Check your MongoDB connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  function startEdit(t: Teacher) {
    setEditingId(t.id);
    setEditForm({ name: t.name, subject: t.subject, qualification: t.qualification, experience: t.experience });
    setEditPhotoFile(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      const updateData: Partial<Teacher> = { ...editForm };
      if (editPhotoFile) {
        const res = await uploadImage(editPhotoFile, "teachers");
        updateData.photoURL = res.url;
        updateData.photoPath = res.path;
        // Delete old photo
        const old = items.find((t) => t.id === editingId);
        if (old?.photoPath) {
          await deleteFromStorage(old.photoPath).catch(() => { });
        }
      }
      await updateTeacher(editingId, updateData);
      setEditingId(null);
      setEditPhotoFile(null);
      await load();
    } catch {
      alert("Failed to update teacher");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function moveTeacher(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const current = newItems[index];
    const target = newItems[targetIndex];

    const currentOrder = current.order ?? index;
    const targetOrder = target.order ?? targetIndex;

    newItems[index] = { ...target, order: currentOrder };
    newItems[targetIndex] = { ...current, order: targetOrder };
    setItems(newItems);

    try {
      await Promise.all([
        updateTeacher(current.id, { order: targetOrder }),
        updateTeacher(target.id, { order: currentOrder }),
      ]);
    } catch {
      await load();
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
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Teachers{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} in database)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm text-navy-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
            <RefreshIcon /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm !py-2 !px-5"
          >
            <span>{showForm ? "Cancel" : "+ Add Teacher"}</span>
          </button>
        </div>
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
          {items.map((t, idx) => (
            <div
              key={t.id}
              className="gradient-border p-5 rounded-xl relative group"
            >
              {editingId === t.id ? (
                /* ── Edit Form ── */
                <form onSubmit={handleEdit} className="space-y-3">
                  <input type="text" placeholder="Name *" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="input-field text-sm" required />
                  <input type="text" placeholder="Subject *" value={editForm.subject} onChange={(e) => setEditForm((p) => ({ ...p, subject: e.target.value }))} className="input-field text-sm" required />
                  <input type="text" placeholder="Qualification" value={editForm.qualification} onChange={(e) => setEditForm((p) => ({ ...p, qualification: e.target.value }))} className="input-field text-sm" />
                  <input type="text" placeholder="Experience *" value={editForm.experience} onChange={(e) => setEditForm((p) => ({ ...p, experience: e.target.value }))} className="input-field text-sm" required />
                  <div>
                    <label className="block text-xs text-navy-400 mb-1">Replace Photo (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)} className="text-xs text-navy-300 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gold-500/10 file:text-gold-400 file:text-xs file:cursor-pointer" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting} className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50">
                      <span>{editSubmitting ? "Saving..." : "Save"}</span>
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-navy-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Display ── */
                <>
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20 mr-1">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => moveTeacher(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-white/10 text-navy-300 hover:text-white transition-colors disabled:opacity-30"
                      title="Move Up (Show 1st / earlier)"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveTeacher(idx, "down")}
                      disabled={idx === items.length - 1}
                      className="p-1 rounded hover:bg-white/10 text-navy-300 hover:text-white transition-colors disabled:opacity-30"
                      title="Move Down (Show later)"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-navy-500 hover:text-blue-400 transition-colors"
                      title="Edit teacher"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => remove(t.id, t.photoPath)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors"
                      title="Delete teacher"
                    >
                      <TrashIcon />
                    </button>
                  </div>
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
                </>
              )}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", achievement: "", quote: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await getReviews());
    } catch {
      setError("Failed to load reviews. Check your MongoDB connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  function startEdit(r: Review) {
    setEditingId(r.id);
    setEditForm({ name: r.name, achievement: r.achievement, quote: r.quote });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      await updateReview(editingId, editForm);
      setEditingId(null);
      await load();
    } catch {
      alert("Failed to update review");
    } finally {
      setEditSubmitting(false);
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
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Reviews{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} in database)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm text-navy-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
            <RefreshIcon /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm !py-2 !px-5"
          >
            <span>{showForm ? "Cancel" : "+ Add Review"}</span>
          </button>
        </div>
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
              {editingId === r.id ? (
                /* ── Edit Form ── */
                <form onSubmit={handleEdit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Name *" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="input-field text-sm" required />
                    <input type="text" placeholder="Achievement *" value={editForm.achievement} onChange={(e) => setEditForm((p) => ({ ...p, achievement: e.target.value }))} className="input-field text-sm" required />
                  </div>
                  <textarea placeholder="Quote *" value={editForm.quote} onChange={(e) => setEditForm((p) => ({ ...p, quote: e.target.value }))} className="input-field text-sm" rows={3} required />
                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting} className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50">
                      <span>{editSubmitting ? "Saving..." : "Save"}</span>
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-navy-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Display ── */
                <>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(r)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-navy-500 hover:text-blue-400 transition-colors"
                      title="Edit review"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-navy-500 hover:text-red-400 transition-colors"
                      title="Delete review"
                    >
                      <TrashIcon />
                    </button>
                  </div>
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
                </>
              )}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await getGalleryImages());
    } catch {
      setError("Failed to load gallery. Check your MongoDB connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  function startEdit(img: GalleryImage) {
    setEditingId(img.id);
    setEditCaption(img.caption || "");
    setEditImageFile(null);
    setEditPreview(null);
  }

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setEditPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setEditPreview(null);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      const updateData: Partial<GalleryImage> = { caption: editCaption };
      if (editImageFile) {
        const res = await uploadImage(editImageFile, "gallery");
        updateData.url = res.url;
        updateData.storagePath = res.path;
        // Delete old image
        const old = items.find((img) => img.id === editingId);
        if (old?.storagePath) {
          await deleteFromStorage(old.storagePath).catch(() => { });
        }
      }
      await updateGalleryImage(editingId, updateData);
      setEditingId(null);
      setEditImageFile(null);
      setEditPreview(null);
      await load();
    } catch {
      alert("Failed to update gallery image");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function moveGallery(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const current = newItems[index];
    const target = newItems[targetIndex];

    const currentOrder = current.order ?? index;
    const targetOrder = target.order ?? targetIndex;

    newItems[index] = { ...target, order: currentOrder };
    newItems[targetIndex] = { ...current, order: targetOrder };
    setItems(newItems);

    try {
      await Promise.all([
        updateGalleryImage(current.id, { order: targetOrder }),
        updateGalleryImage(target.id, { order: currentOrder }),
      ]);
    } catch {
      await load();
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
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Classroom Gallery{" "}
          <span className="text-navy-400 text-sm font-normal">
            ({items.length} images)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="text-sm text-navy-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
            <RefreshIcon /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm !py-2 !px-5"
          >
            <span>{showForm ? "Cancel" : "+ Upload Image"}</span>
          </button>
        </div>
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
          {items.map((img, idx) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-white/5"
            >
              {editingId === img.id ? (
                /* ── Edit Form ── */
                <form onSubmit={handleEdit} className="p-4 space-y-3 bg-navy-900/80">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={editPreview || img.url}
                      alt={editCaption || "Classroom"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-navy-400 mb-1">Replace Image (optional)</label>
                    <input type="file" accept="image/*" onChange={handleEditFileChange} className="text-xs text-navy-300 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gold-500/10 file:text-gold-400 file:text-xs file:cursor-pointer" />
                  </div>
                  <input type="text" placeholder="Caption" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="input-field text-sm" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting} className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50">
                      <span>{editSubmitting ? "Saving..." : "Save"}</span>
                    </button>
                    <button type="button" onClick={() => { setEditingId(null); setEditPreview(null); }} className="text-xs text-navy-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Display ── */
                <>
                  <div className="aspect-[4/3]">
                    <img
                      src={img.url}
                      alt={img.caption || "Classroom"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/50 text-gold-400 border border-white/20">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => moveGallery(idx, "up")}
                      disabled={idx === 0}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-30"
                      title="Move Up (Show earlier)"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveGallery(idx, "down")}
                      disabled={idx === items.length - 1}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-30"
                      title="Move Down (Show later)"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => startEdit(img)}
                      className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                      title="Edit image"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => remove(img.id, img.storagePath)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
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
                </>
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

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
      <span>⚠️ {message}</span>
      {onRetry && (
        <button onClick={onRetry} className="ml-4 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-all">
          Retry
        </button>
      )}
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

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function formatDate(timestamp: unknown): string {
  if (!timestamp) return "Just now";

  // Handle Firestore Timestamp objects
  if (typeof timestamp === "object" && timestamp !== null && "toDate" in timestamp) {
    try {
      const tsObj = timestamp as { toDate: () => Date };
      return tsObj.toDate().toLocaleDateString("en-IN", {
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

  // Handle ISO date strings from MongoDB
  if (typeof timestamp === "string") {
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleDateString("en-IN", {
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

  return "Just now";
}

/* ═══════════════════════════════════════════
   ADMIN USERS TAB
   ═══════════════════════════════════════════ */

function AdminsTab({
  currentUserEmail,
  superAdminEmail,
}: {
  currentUserEmail: string;
  superAdminEmail: string;
}) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setAdmins(await getAdmins());
    } catch {
      setError("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // 1. Add to MongoDB database so the admin user shows in admin panel list
      await addAdminUser({
        email: form.email,
        name: form.name,
        createdBy: currentUserEmail || "admin",
      });

      // 2. Try to create Firebase Auth email/password account
      let notice = "";
      try {
        await createAdminUserAccount(form.email, form.password, form.name);
      } catch (fbErr: unknown) {
        const fbError = fbErr as { code?: string; message?: string };
        if (fbError.code === "auth/operation-not-allowed") {
          notice = " (Note: Enable 'Email/Password' in Firebase Console → Authentication → Sign-in method to allow direct password logins).";
        } else if (fbError.code === "auth/email-already-in-use") {
          notice = " (Firebase auth account already exists).";
        } else {
          console.warn("Firebase Auth creation notice:", fbError);
        }
      }

      setSuccess(`Admin user ${form.email} added successfully!${notice}`);
      setForm({ name: "", email: "", password: "" });
      await load();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to create admin user");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeAdmin(id: string, email: string) {
    if (email.toLowerCase() === superAdminEmail.toLowerCase()) {
      alert("Cannot delete primary superadmin!");
      return;
    }
    if (!confirm(`Remove admin access for ${email}?`)) return;

    try {
      await deleteAdminUser(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      setSuccess(`Removed admin ${email}`);
    } catch {
      alert("Failed to delete admin user");
    }
  }

  const totalAdminsCount = admins.length + 1;
  const totalLoginsCount = admins.reduce((sum, a) => sum + (a.loginCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-navy-400 font-medium uppercase tracking-wider">
              Total Admins Created
            </div>
            <div className="text-3xl font-extrabold text-navy-100 mt-1">
              {totalAdminsCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xl text-gold-400">
            👑
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-navy-400 font-medium uppercase tracking-wider">
              Total Logins Recorded
            </div>
            <div className="text-3xl font-extrabold text-navy-100 mt-1">
              {totalLoginsCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl text-blue-400">
            🔑
          </div>
        </div>
      </div>

      {/* ── Add Admin Form ── */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-navy-100 mb-1 flex items-center gap-2">
          <span>👑</span> Add New Admin User
        </h2>
        <p className="text-navy-400 text-xs mb-6">
          Create an email & password account for a co-admin or staff member to manage this dashboard.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-navy-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-300 mb-1">
              Password (min 6 chars) *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm !py-2.5 px-6 disabled:opacity-50"
            >
              <span>{submitting ? "Creating Admin..." : "Add Admin User"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Admin Users List Table ── */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy-100">Authorized Admin Accounts</h3>
            <p className="text-navy-400 text-xs mt-0.5">Users permitted to access this dashboard</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-semibold">
            {totalAdminsCount} Admin{totalAdminsCount === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading admin accounts..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-900/60 text-navy-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Admin User</th>
                  <th className="py-3.5 px-6 font-semibold">Role / Status</th>
                  <th className="py-3.5 px-6 font-semibold">Added By</th>
                  <th className="py-3.5 px-6 font-semibold">Login Count</th>
                  <th className="py-3.5 px-6 font-semibold">Last Login</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-navy-200">
                {/* Superadmin Primary Account */}
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gold-300">{superAdminEmail}</div>
                    <div className="text-xs text-navy-400">Primary Super Admin</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-medium">
                      Superadmin
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-navy-400">System Default</td>
                  <td className="py-4 px-6 text-xs font-semibold text-gold-400">
                    {admins.find(a => a.email.toLowerCase() === superAdminEmail.toLowerCase())?.loginCount || 1} logins
                  </td>
                  <td className="py-4 px-6 text-xs text-navy-400">
                    {admins.find(a => a.email.toLowerCase() === superAdminEmail.toLowerCase())?.lastLoginAt
                      ? new Date(admins.find(a => a.email.toLowerCase() === superAdminEmail.toLowerCase())!.lastLoginAt!).toLocaleString("en-IN")
                      : "Active Now"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-xs text-navy-500 italic">Protected</span>
                  </td>
                </tr>

                {/* Additional Admins from MongoDB */}
                {admins
                  .filter((a) => a.email.toLowerCase() !== superAdminEmail.toLowerCase())
                  .map((adm) => (
                    <tr key={adm.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-navy-100">{adm.name || "Admin User"}</div>
                        <div className="text-xs text-navy-400">{adm.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                          Admin
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-navy-400">{adm.createdBy || "Admin"}</td>
                      <td className="py-4 px-6 text-xs font-semibold text-navy-200">
                        {adm.loginCount || 0} logins
                      </td>
                      <td className="py-4 px-6 text-xs text-navy-400">
                        {adm.lastLoginAt
                          ? new Date(adm.lastLoginAt).toLocaleString("en-IN")
                          : "Not logged in yet"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => removeAdmin(adm.id, adm.email)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-all"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
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

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, signOut, error, clearError } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    clearError();
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      // Auto-register superadmin if account doesn't exist yet in Firebase Auth
      if (
        (firebaseErr.code === "auth/user-not-found" ||
          firebaseErr.code === "auth/invalid-credential") &&
        email.trim().toLowerCase() === adminEmail
      ) {
        try {
          await signUpWithEmail(email, password, "Super Admin");
          return;
        } catch {
          // Keep original error
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setSendingReset(true);
    setResetMessage("");
    setResetError("");
    try {
      await sendPasswordReset(resetEmail);
      setResetMessage("Password reset email sent! Check your inbox for reset instructions.");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setResetError(e.message || "Failed to send password reset link.");
    } finally {
      setSendingReset(false);
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
          ) : isForgotPassword ? (
            /* Forgot Password Form */
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-navy-100">Reset Admin Password</h3>
                <p className="text-navy-400 text-xs mt-1">
                  Enter your admin email address to receive a secure password reset link.
                </p>
              </div>

              {resetMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <span>✅</span> {resetMessage}
                </div>
              )}
              {resetError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <span>⚠️</span> {resetError}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="admin@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingReset}
                  className="w-full btn-primary !py-3 text-sm font-semibold disabled:opacity-50"
                >
                  <span>{sendingReset ? "Sending Reset Email..." : "Send Reset Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetMessage("");
                    setResetError("");
                  }}
                  className="w-full text-center text-xs text-navy-400 hover:text-gold-400 transition-colors mt-2"
                >
                  ← Back to Login
                </button>
              </form>
            </div>
          ) : (
            /* Standard Login Form */
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
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-navy-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setIsForgotPassword(true);
                      }}
                      className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
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
