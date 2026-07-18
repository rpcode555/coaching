import * as firestore from "./firestore";

export type { Enrollment, Teacher, Review, GalleryImage } from "./firestore";

/* ═══════════════════════════════════════════
   Enrollments (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function addEnrollment(
  data: Omit<firestore.Enrollment, "id" | "status" | "createdAt">
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

export async function getEnrollments(): Promise<firestore.Enrollment[]> {
  const res = await fetch("/api/enrollments", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch enrollments from database");
  }
  const items = await res.json();
  if (Array.isArray(items)) {
    return items.map((item) => ({
      ...item,
      id: String(item._id || item.id),
    }));
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

export async function deleteEnrollment(id: string): Promise<void> {
  const res = await fetch(`/api/enrollments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete enrollment");
  }
}

/* ═══════════════════════════════════════════
   Teachers (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function getTeachers(): Promise<firestore.Teacher[]> {
  try {
    const res = await fetch("/api/teachers", { cache: "no-store" });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: String(item._id || item.id),
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB API getTeachers error:", err);
  }
  return firestore.getTeachers();
}

export async function addTeacher(
  data: Omit<firestore.Teacher, "id">
): Promise<string> {
  const res = await fetch("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    const json = await res.json();
    return String(json.id || json._id);
  }
  return firestore.addTeacher(data);
}

export async function updateTeacher(
  id: string,
  data: Partial<firestore.Teacher>
): Promise<void> {
  const res = await fetch(`/api/teachers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    return firestore.updateTeacher(id, data);
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  const res = await fetch(`/api/teachers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return firestore.deleteTeacher(id);
  }
}

/* ═══════════════════════════════════════════
   Reviews (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function getReviews(): Promise<firestore.Review[]> {
  try {
    const res = await fetch("/api/reviews", { cache: "no-store" });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: String(item._id || item.id),
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB API getReviews error:", err);
  }
  return firestore.getReviews();
}

export async function addReview(
  data: Omit<firestore.Review, "id" | "createdAt">
): Promise<string> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    const json = await res.json();
    return String(json.id || json._id);
  }
  return firestore.addReview(data);
}

export async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return firestore.deleteReview(id);
  }
}

/* ═══════════════════════════════════════════
   Gallery (Direct MongoDB API)
   ═══════════════════════════════════════════ */

export async function getGalleryImages(): Promise<firestore.GalleryImage[]> {
  try {
    const res = await fetch("/api/gallery", { cache: "no-store" });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: String(item._id || item.id),
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB API getGalleryImages error:", err);
  }
  return firestore.getGalleryImages();
}

export async function addGalleryImage(
  data: Omit<firestore.GalleryImage, "id" | "createdAt">
): Promise<string> {
  const res = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    const json = await res.json();
    return String(json.id || json._id);
  }
  return firestore.addGalleryImage(data);
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return firestore.deleteGalleryImage(id);
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
  try {
    const res = await fetch("/api/admins", { cache: "no-store" });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: String(item._id || item.id),
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB API getAdmins error:", err);
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
