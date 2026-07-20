export type { Enrollment, Teacher, Review, GalleryImage } from "./firestore";
import type { Enrollment, Teacher, Review, GalleryImage } from "./firestore";

/* ═══════════════════════════════════════════
   Enrollments (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function addEnrollment(
  data: Record<string, unknown>
): Promise<string> {
  const res = await fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save enrollment to database");
  }

  const json = await res.json();
  return String(json.id || json._id || "");
}

/* ═══════════════════════════════════════════
   Enrollment Settings (Course Options & Custom Fields)
   ═══════════════════════════════════════════ */

export interface ExtraField {
  id: string;
  name: string;
  label: string;
  type: "text" | "select" | "number";
  options?: string[];
  required: boolean;
  enabled: boolean;
}

export interface EnrollmentSetting {
  courseOptions: string[];
  extraFields: ExtraField[];
}

export async function getEnrollmentSettings(): Promise<EnrollmentSetting> {
  const res = await fetch("/api/enrollment-settings", { cache: "no-store" });
  if (!res.ok) {
    return {
      courseOptions: [
        "Foundation (Class 5-7)",
        "Madhyamik Prep (Class 8-10)",
        "Higher Secondary (Class 11-12)",
        "JEE Preparation",
        "NEET Preparation",
        "WBJEE Preparation",
      ],
      extraFields: [],
    };
  }
  return await res.json();
}

export async function updateEnrollmentSettings(
  data: Partial<EnrollmentSetting>
): Promise<EnrollmentSetting> {
  const res = await fetch("/api/enrollment-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update enrollment settings");
  }
  return await res.json();
}

export async function getEnrollments(): Promise<Enrollment[]> {
  const res = await fetch("/api/enrollments", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch enrollments");
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item._id || item.id),
    })) as Enrollment[];
  }
  return [];
}

export async function updateEnrollmentStatus(
  id: string,
  status: string
): Promise<void> {
  const res = await fetch(`/api/enrollments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error("Failed to update status");
  }
}

export async function updateEnrollment(
  id: string,
  data: Partial<Enrollment>
): Promise<void> {
  const res = await fetch(`/api/enrollments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update enrollment");
  }
}

export async function deleteEnrollment(id: string): Promise<void> {
  const res = await fetch(`/api/enrollments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete enrollment");
  }
}

/* ═══════════════════════════════════════════
   Courses (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export interface Course {
  id: string;
  title: string;
  classes: string;
  description: string;
  subjects: string[];
  color: string;
  accent: string;
  border: string;
  icon: string;
  order: number;
}

export async function getCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item._id || item.id),
    })) as Course[];
  }
  return [];
}

export async function addCourse(
  data: Omit<Course, "id">
): Promise<string> {
  const res = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to add course");
  }
  const json = await res.json();
  return String(json.id || json._id);
}

export async function updateCourse(
  id: string,
  data: Partial<Course>
): Promise<void> {
  const res = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update course");
  }
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await fetch(`/api/courses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete course");
  }
}

/* ═══════════════════════════════════════════
   Teachers (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function getTeachers(): Promise<Teacher[]> {
  const res = await fetch("/api/teachers", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch teachers");
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item._id || item.id),
    })) as Teacher[];
  }
  return [];
}

export async function addTeacher(
  data: Omit<Teacher, "id">
): Promise<string> {
  const res = await fetch("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to add teacher");
  }
  const json = await res.json();
  return String(json.id || json._id);
}

export async function updateTeacher(
  id: string,
  data: Partial<Teacher>
): Promise<void> {
  const res = await fetch(`/api/teachers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update teacher");
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  const res = await fetch(`/api/teachers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete teacher");
  }
}

/* ═══════════════════════════════════════════
   Reviews (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function getReviews(): Promise<Review[]> {
  const res = await fetch("/api/reviews", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item._id || item.id),
    })) as Review[];
  }
  return [];
}

export async function addReview(
  data: Omit<Review, "id" | "createdAt">
): Promise<string> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to add review");
  }
  const json = await res.json();
  return String(json.id || json._id);
}

export async function updateReview(
  id: string,
  data: Partial<Review>
): Promise<void> {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update review");
  }
}

export async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete review");
  }
}

/* ═══════════════════════════════════════════
   Gallery (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const res = await fetch("/api/gallery", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch gallery images");
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item._id || item.id),
    })) as GalleryImage[];
  }
  return [];
}

export async function addGalleryImage(
  data: Omit<GalleryImage, "id" | "createdAt">
): Promise<string> {
  const res = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to add gallery image");
  }
  const json = await res.json();
  return String(json.id || json._id);
}

export async function updateGalleryImage(
  id: string,
  data: Partial<GalleryImage>
): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update gallery image");
  }
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete gallery image");
  }
}

// Export image upload helpers from firestore/storage
export { uploadImage, deleteFromStorage } from "./firestore";

/* ═══════════════════════════════════════════
   Admin Users (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdBy: string;
  loginCount?: number;
  lastLoginAt?: string;
  createdAt: string;
}

export async function getAdmins(): Promise<AdminUser[]> {
  const res = await fetch("/api/admins", { cache: "no-store" });
  if (!res.ok) {
    return [];
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item._id || item.id),
    })) as AdminUser[];
  }
  return [];
}

export async function addAdminUser(
  data: { email: string; name: string; createdBy?: string }
): Promise<string> {
  const res = await fetch("/api/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    const json = await res.json();
    return String(json.id || json._id);
  }
  return "";
}

export async function trackAdminLogin(
  email: string,
  name?: string
): Promise<void> {
  try {
    await fetch("/api/admins/track-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
  } catch (err) {
    console.warn("MongoDB API trackAdminLogin error:", err);
  }
}

export async function deleteAdminUser(id: string): Promise<void> {
  try {
    await fetch(`/api/admins/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("MongoDB API deleteAdminUser error:", err);
  }
}
