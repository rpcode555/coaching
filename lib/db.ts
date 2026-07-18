import * as firestore from "./firestore";

export type { Enrollment, Teacher, Review, GalleryImage } from "./firestore";

/* ═══════════════════════════════════════════
   Enrollments
   ═══════════════════════════════════════════ */

export async function addEnrollment(
  data: Omit<firestore.Enrollment, "id" | "status" | "createdAt">
): Promise<string> {
  try {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.id || json._id;
    }
  } catch (err) {
    console.warn("MongoDB API error, falling back to Firestore/LocalStorage:", err);
  }
  return firestore.addEnrollment(data);
}

export async function getEnrollments(): Promise<firestore.Enrollment[]> {
  try {
    const res = await fetch("/api/enrollments");
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
    }
  } catch (err) {
    console.warn("MongoDB API fetch error, falling back to Firestore:", err);
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
      if (Array.isArray(items) && items.length > 0) {
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
      if (Array.isArray(items) && items.length > 0) {
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
      if (Array.isArray(items) && items.length > 0) {
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
