import * as firestore from "./firestore";

export type { Enrollment, Teacher, Review, GalleryImage } from "./firestore";

/* ═══════════════════════════════════════════
   Enrollments
   ═══════════════════════════════════════════ */

export async function addEnrollment(
  data: Omit<firestore.Enrollment, "id" | "status" | "createdAt">
): Promise<string> {
  const localId = "local_" + Date.now();
  const cleanItem = {
    id: localId,
    name: data.name || "",
    guardianName: data.guardianName || "",
    phone: data.phone || "",
    email: data.email || "",
    course: data.course || "",
    className: data.className || "",
    address: data.address || "",
    message: data.message || "",
    status: "new" as const,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("safalya_enrollments") || "[]");
      existing.unshift(cleanItem);
      localStorage.setItem("safalya_enrollments", JSON.stringify(existing));
    } catch {}
  }

  fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (res.ok) {
        if (typeof window !== "undefined") {
          try {
            const list = JSON.parse(localStorage.getItem("safalya_enrollments") || "[]");
            const updated = list.filter((i: { id: string }) => i.id !== localId);
            localStorage.setItem("safalya_enrollments", JSON.stringify(updated));
          } catch {}
        }
      }
    })
    .catch(() => {});

  return localId;
}


export async function getEnrollments(): Promise<firestore.Enrollment[]> {
  let mongoItems: firestore.Enrollment[] = [];
  try {
    const res = await fetch("/api/enrollments");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        mongoItems = items.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB API fetch error, checking local storage:", err);
  }

  let localItems: firestore.Enrollment[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("safalya_enrollments");
      if (raw) {
        localItems = JSON.parse(raw);
      }
    } catch {}
  }

  const mongoIds = new Set(mongoItems.map((i) => i.id));
  const uniqueLocal = localItems.filter((i) => !mongoIds.has(i.id));

  if (mongoItems.length > 0 || uniqueLocal.length > 0) {
    return [...uniqueLocal, ...mongoItems];
  }

  return firestore.getEnrollments();
}

export async function updateEnrollmentStatus(
  id: string,
  status: string
): Promise<void> {
  try {
    const res = await fetch(`/api/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("MongoDB API update status error:", err);
  }
  return firestore.updateEnrollmentStatus(id, status);
}

export async function deleteEnrollment(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/enrollments/${id}`, {
      method: "DELETE",
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("MongoDB API delete enrollment error:", err);
  }
  return firestore.deleteEnrollment(id);
}

/* ═══════════════════════════════════════════
   Teachers
   ═══════════════════════════════════════════ */

export async function getTeachers(): Promise<firestore.Teacher[]> {
  try {
    const res = await fetch("/api/teachers");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: item._id || item.id,
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
  try {
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.id || json._id;
    }
  } catch (err) {
    console.warn("MongoDB API addTeacher error:", err);
  }
  return firestore.addTeacher(data);
}

export async function updateTeacher(
  id: string,
  data: Partial<firestore.Teacher>
): Promise<void> {
  try {
    const res = await fetch(`/api/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("MongoDB API updateTeacher error:", err);
  }
  return firestore.updateTeacher(id, data);
}

export async function deleteTeacher(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/teachers/${id}`, {
      method: "DELETE",
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("MongoDB API deleteTeacher error:", err);
  }
  return firestore.deleteTeacher(id);
}

/* ═══════════════════════════════════════════
   Reviews
   ═══════════════════════════════════════════ */

export async function getReviews(): Promise<firestore.Review[]> {
  try {
    const res = await fetch("/api/reviews");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: item._id || item.id,
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
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.id || json._id;
    }
  } catch (err) {
    console.warn("MongoDB API addReview error:", err);
  }
  return firestore.addReview(data);
}

export async function deleteReview(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("MongoDB API deleteReview error:", err);
  }
  return firestore.deleteReview(id);
}

/* ═══════════════════════════════════════════
   Gallery
   ═══════════════════════════════════════════ */

export async function getGalleryImages(): Promise<firestore.GalleryImage[]> {
  try {
    const res = await fetch("/api/gallery");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: item._id || item.id,
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
  try {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.id || json._id;
    }
  } catch (err) {
    console.warn("MongoDB API addGalleryImage error:", err);
  }
  return firestore.addGalleryImage(data);
}

export async function deleteGalleryImage(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/gallery/${id}`, {
      method: "DELETE",
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("MongoDB API deleteGalleryImage error:", err);
  }
  return firestore.deleteGalleryImage(id);
}

// Export image upload helpers from firestore/storage
export { uploadImage, deleteFromStorage } from "./firestore";

/* ═══════════════════════════════════════════
   Admin Users
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
    const res = await fetch("/api/admins");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          ...item,
          id: item._id || item.id,
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
  try {
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.id || json._id;
    }
  } catch (err) {
    console.warn("MongoDB API addAdminUser error:", err);
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


