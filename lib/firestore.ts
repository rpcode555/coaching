import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface Enrollment {
  id: string;
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  course: string;
  className: string;
  address: string;
  message: string;
  status: "new" | "contacted" | "enrolled";
  createdAt: Timestamp;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  photoURL: string;
  photoPath: string;
  order: number;
}

export interface Review {
  id: string;
  name: string;
  achievement: string;
  quote: string;
  createdAt: Timestamp;
}

export interface GalleryImage {
  id: string;
  url: string;
  storagePath: string;
  caption: string;
  order: number;
  createdAt: Timestamp;
}

/* ═══════════════════════════════════════════
   Enrollments
   ═══════════════════════════════════════════ */

export async function addEnrollment(
  data: Omit<Enrollment, "id" | "status" | "createdAt">,
): Promise<string> {
  const cleanData = {
    name: data.name || "",
    guardianName: data.guardianName || "",
    phone: data.phone || "",
    email: data.email || "",
    course: data.course || "",
    className: data.className || "",
    address: data.address || "",
    message: data.message || "",
    status: "new" as const,
  };

  const saveToLocalStorage = () => {
    if (typeof window !== "undefined") {
      const existing = JSON.parse(
        localStorage.getItem("safalya_enrollments") || "[]",
      );
      const localItem = {
        id: "local_" + Date.now(),
        ...cleanData,
        createdAt: { toDate: () => new Date() } as unknown as Timestamp,
      };
      existing.unshift(localItem);
      localStorage.setItem("safalya_enrollments", JSON.stringify(existing));
      return localItem.id;
    }
    return "local_" + Date.now();
  };

  try {
    // 2.5s Timeout to prevent hanging if Firestore connection stalls
    const timeout = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), 2500),
    );

    const docPromise = addDoc(collection(db, "enrollments"), {
      ...cleanData,
      createdAt: serverTimestamp(),
    }).then((ref) => ref.id);

    const id = await Promise.race([docPromise, timeout]);
    return id;
  } catch (err) {
    console.warn("Firestore write timed out/failed, saved to local storage:", err);
    return saveToLocalStorage();
  }
}

export async function getEnrollments(): Promise<Enrollment[]> {
  let firestoreItems: Enrollment[] = [];

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), 2500),
    );

    const q = query(
      collection(db, "enrollments"),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await Promise.race([getDocs(q), timeout]);
    firestoreItems = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Enrollment,
    );
  } catch (err) {
    console.warn("Firestore read failed or timed out:", err);
  }

  let localItems: Enrollment[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("safalya_enrollments");
      if (raw) {
        const parsed = JSON.parse(raw);
        localItems = parsed.map((item: Enrollment) => ({
          ...item,
          createdAt: {
            toDate: () => new Date((item.createdAt as unknown as { toDate?: string }).toDate || Date.now()),
          } as unknown as Timestamp,
        }));
      }
    } catch {}
  }

  return [...localItems, ...firestoreItems];
}

export async function updateEnrollmentStatus(
  id: string,
  status: string,
): Promise<void> {
  if (id.startsWith("local_") && typeof window !== "undefined") {
    const raw = localStorage.getItem("safalya_enrollments");
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((item: Enrollment) =>
        item.id === id ? { ...item, status } : item,
      );
      localStorage.setItem("safalya_enrollments", JSON.stringify(updated));
    }
    return;
  }
  await updateDoc(doc(db, "enrollments", id), { status });
}

export async function deleteEnrollment(id: string): Promise<void> {
  if (id.startsWith("local_") && typeof window !== "undefined") {
    const raw = localStorage.getItem("safalya_enrollments");
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.filter((item: Enrollment) => item.id !== id);
      localStorage.setItem("safalya_enrollments", JSON.stringify(updated));
    }
    return;
  }
  await deleteDoc(doc(db, "enrollments", id));
}

/* ═══════════════════════════════════════════
   Teachers
   ═══════════════════════════════════════════ */

export async function getTeachers(): Promise<Teacher[]> {
  const q = query(collection(db, "teachers"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Teacher,
  );
}

export async function addTeacher(
  data: Omit<Teacher, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "teachers"), data);
  return docRef.id;
}

export async function updateTeacher(
  id: string,
  data: Partial<Teacher>,
): Promise<void> {
  await updateDoc(doc(db, "teachers", id), data);
}

export async function deleteTeacher(id: string): Promise<void> {
  await deleteDoc(doc(db, "teachers", id));
}

/* ═══════════════════════════════════════════
   Reviews
   ═══════════════════════════════════════════ */

export async function getReviews(): Promise<Review[]> {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Review,
  );
}

export async function addReview(
  data: Omit<Review, "id" | "createdAt">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", id));
}

/* ═══════════════════════════════════════════
   Gallery
   ═══════════════════════════════════════════ */

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const q = query(collection(db, "gallery"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as GalleryImage,
  );
}

export async function addGalleryImage(
  data: Omit<GalleryImage, "id" | "createdAt">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "gallery"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await deleteDoc(doc(db, "gallery", id));
}

/* ═══════════════════════════════════════════
   Image Upload / Delete (Firebase Storage)
   ═══════════════════════════════════════════ */

async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob> {
  if (typeof window === "undefined" || file.type === "image/svg+xml" || file.size < 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadImage(
  file: File,
  folder: string,
): Promise<{ url: string; path: string }> {
  try {
    const compressedBlob = await compressImage(file);
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");
    const isWebp = compressedBlob.type === "image/webp";
    const path = `${folder}/${Date.now()}_${sanitizedName}${isWebp ? ".webp" : ""}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressedBlob);
    const url = await getDownloadURL(storageRef);
    return { url, path };
  } catch (err) {
    console.warn("Compression/upload optimization error, using original file upload:", err);
    const path = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, path };
  }
}

export async function deleteFromStorage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch {
    // File may already be deleted
  }
}
