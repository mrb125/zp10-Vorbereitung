/**
 * ZP10 Diagnose - Firebase Configuration Module
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password + Google)
 * 3. Create Firestore database in native mode
 * 4. Get your Firebase config from Project Settings
 * 5. Replace the placeholder values below with your actual config
 * 6. Copy firestore-rules.txt to Firestore Security Rules
 * 7. Enable Google Sign-In in Authentication methods
 */

// Firebase SDK imports (v9+ modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
  getAnalytics,
  logEvent
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js';

// ============================================================================
// FIREBASE CONFIGURATION - REPLACE WITH YOUR PROJECT CREDENTIALS
// ============================================================================
// Get these values from Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE",
  measurementId: "YOUR_MEASUREMENT_ID_HERE"
};
// ============================================================================

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Authentication Functions
 */

export async function signUpWithEmail(email, password, role, name, classCode = null) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user profile in Firestore
    const userProfile = {
      uid,
      email,
      name,
      role, // "schueler" or "lehrer"
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    // Add classId for students
    if (role === "schueler" && classCode) {
      const classQuery = query(collection(db, "classes"), where("code", "==", classCode));
      const classSnapshot = await getDocs(classQuery);

      if (!classSnapshot.empty) {
        const classDoc = classSnapshot.docs[0];
        userProfile.classId = classDoc.id;

        // Add student to class
        await updateDoc(doc(db, "classes", classDoc.id), {
          studentUids: arrayUnion(uid)
        });
      } else {
        throw new Error("Ungültiger Klassencode");
      }
    }

    await setDoc(doc(db, "users", uid), userProfile);

    logEvent(analytics, "sign_up", { method: "email", role });
    return userCredential.user;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

export async function signInWithEmailPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Update last login
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: serverTimestamp()
    });

    logEvent(analytics, "login", { method: "email" });
    return userCredential.user;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const uid = result.user.uid;

    // Check if user profile exists, if not create it
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      const nameQuery = query(collection(db, "users"), where("uid", "==", uid));
      await setDoc(doc(db, "users", uid), {
        uid,
        email: result.user.email,
        name: result.user.displayName || "User",
        role: "schueler", // Default role for Google Sign-In
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await updateDoc(doc(db, "users", uid), {
        lastLogin: serverTimestamp()
      });
    }

    logEvent(analytics, "login", { method: "google" });
    return result.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    logEvent(analytics, "password_reset_requested");
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    logEvent(analytics, "logout");
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * User Profile Functions
 */

export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(uid, updates) {
  try {
    await updateDoc(doc(db, "users", uid), updates);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Results Management Functions
 */

export async function saveModuleResult(uid, moduleId, result) {
  try {
    const resultData = {
      moduleId,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      date: serverTimestamp(),
      xp: result.xp || 0,
      triggeredMVs: result.triggeredMVs || [],
      klp: result.klp || [],
      timeUsed: result.timeUsed || 0,
      answers: result.answers || [] // Store answers for review
    };

    await setDoc(
      doc(db, "results", uid, "modules", moduleId),
      resultData,
      { merge: true }
    );

    logEvent(analytics, "module_completed", {
      moduleId,
      score: result.score,
      xp: result.xp
    });

    return resultData;
  } catch (error) {
    console.error("Error saving module result:", error);
    throw error;
  }
}

export async function saveExamResult(uid, examId, result) {
  try {
    const resultData = {
      examId,
      score: result.score,
      maxScore: result.maxScore,
      note: result.note || null,
      date: serverTimestamp(),
      timeUsed: result.timeUsed || 0,
      answers: result.answers || []
    };

    await setDoc(
      doc(db, "results", uid, "exams", examId),
      resultData,
      { merge: true }
    );

    logEvent(analytics, "exam_completed", { examId, score: result.score });

    return resultData;
  } catch (error) {
    console.error("Error saving exam result:", error);
    throw error;
  }
}

export async function getModuleResult(uid, moduleId) {
  try {
    const resultDoc = await getDoc(doc(db, "results", uid, "modules", moduleId));
    if (resultDoc.exists()) {
      return resultDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting module result:", error);
    return null;
  }
}

export async function getAllModuleResults(uid) {
  try {
    const resultsSnapshot = await getDocs(collection(db, "results", uid, "modules"));
    const results = {};
    resultsSnapshot.forEach(doc => {
      results[doc.id] = doc.data();
    });
    return results;
  } catch (error) {
    console.error("Error getting all module results:", error);
    return {};
  }
}

export async function getExamResult(uid, examId) {
  try {
    const resultDoc = await getDoc(doc(db, "results", uid, "exams", examId));
    if (resultDoc.exists()) {
      return resultDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting exam result:", error);
    return null;
  }
}

export async function getAllExamResults(uid) {
  try {
    const resultsSnapshot = await getDocs(collection(db, "results", uid, "exams"));
    const results = {};
    resultsSnapshot.forEach(doc => {
      results[doc.id] = doc.data();
    });
    return results;
  } catch (error) {
    console.error("Error getting all exam results:", error);
    return {};
  }
}

/**
 * Class Management Functions (Teachers)
 */

export async function createClass(teacherUid, className) {
  try {
    // Generate a unique 6-character class code
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const classData = {
      name: className,
      teacherUid,
      code: classCode,
      studentUids: [],
      createdAt: serverTimestamp(),
      moduleLocks: {} // { moduleId: boolean }
    };

    const classRef = doc(collection(db, "classes"));
    await setDoc(classRef, classData);

    logEvent(analytics, "class_created");

    return { id: classRef.id, ...classData };
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
}

export async function getTeacherClasses(teacherUid) {
  try {
    const classesQuery = query(
      collection(db, "classes"),
      where("teacherUid", "==", teacherUid)
    );
    const classesSnapshot = await getDocs(classesQuery);
    const classes = [];
    classesSnapshot.forEach(doc => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    return classes;
  } catch (error) {
    console.error("Error getting teacher classes:", error);
    return [];
  }
}

export async function getClass(classId) {
  try {
    const classDoc = await getDoc(doc(db, "classes", classId));
    if (classDoc.exists()) {
      return { id: classDoc.id, ...classDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting class:", error);
    return null;
  }
}

export async function getClassStudents(classId) {
  try {
    const classData = await getClass(classId);
    if (!classData) return [];

    const studentUids = classData.studentUids || [];
    const students = [];

    for (const uid of studentUids) {
      const studentDoc = await getDoc(doc(db, "users", uid));
      if (studentDoc.exists()) {
        students.push({ uid, ...studentDoc.data() });
      }
    }

    return students;
  } catch (error) {
    console.error("Error getting class students:", error);
    return [];
  }
}

export async function removeStudentFromClass(classId, studentUid) {
  try {
    await updateDoc(doc(db, "classes", classId), {
      studentUids: arrayRemove(studentUid)
    });

    await updateDoc(doc(db, "users", studentUid), {
      classId: null
    });

    logEvent(analytics, "student_removed_from_class");
    return true;
  } catch (error) {
    console.error("Error removing student from class:", error);
    throw error;
  }
}

export async function updateModuleLock(classId, moduleId, locked) {
  try {
    const lockPath = `moduleLocks.${moduleId}`;
    await updateDoc(doc(db, "classes", classId), {
      [lockPath]: locked
    });

    logEvent(analytics, "module_lock_updated", { moduleId, locked });
    return true;
  } catch (error) {
    console.error("Error updating module lock:", error);
    throw error;
  }
}

/**
 * Offline Sync Functions (localStorage ↔ Firestore)
 */

const SYNC_PREFIX = "zp10_sync_";

export async function syncOfflineResults(uid) {
  try {
    const allKeys = Object.keys(localStorage);
    const syncKeys = allKeys.filter(key => key.startsWith(SYNC_PREFIX));

    for (const key of syncKeys) {
      const data = JSON.parse(localStorage.getItem(key));

      if (data.type === "module") {
        await saveModuleResult(uid, data.moduleId, data.result);
      } else if (data.type === "exam") {
        await saveExamResult(uid, data.examId, data.result);
      }

      // Remove from local storage after successful sync
      localStorage.removeItem(key);
    }

    logEvent(analytics, "offline_sync_completed");
    return true;
  } catch (error) {
    console.error("Error syncing offline results:", error);
    return false;
  }
}

export function saveOfflineResult(type, moduleId, examId, result) {
  const key = `${SYNC_PREFIX}${type}_${moduleId || examId}_${Date.now()}`;
  const data = { type, moduleId, examId, result };
  localStorage.setItem(key, JSON.stringify(data));
}

export function getOfflinePendingCount() {
  const allKeys = Object.keys(localStorage);
  return allKeys.filter(key => key.startsWith(SYNC_PREFIX)).length;
}

/**
 * Export Firebase instances for advanced use
 */
export { auth, db, analytics };
