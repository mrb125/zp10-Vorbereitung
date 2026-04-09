# ZP10 Diagnose Firebase Backend - Setup Guide

Complete Firebase backend infrastructure for the ZP10 Diagnose platform has been created.

## Files Created

### 1. **firebase-config.js** (13 KB)
Central Firebase configuration and utility module used by all HTML files.

**Exports:**
- Authentication: `signUpWithEmail()`, `signInWithEmailPassword()`, `signInWithGoogle()`, `sendPasswordReset()`, `logOut()`, `onAuthChange()`
- User profiles: `getUserProfile()`, `updateUserProfile()`
- Results: `saveModuleResult()`, `saveExamResult()`, `getModuleResult()`, `getAllModuleResults()`, etc.
- Class management: `createClass()`, `getTeacherClasses()`, `getClass()`, `getClassStudents()`, `removeStudentFromClass()`, `updateModuleLock()`
- Offline sync: `saveOfflineResult()`, `syncOfflineResults()`, `getOfflinePendingCount()`

**Firebase SDK:** v10.7.0 (modular, from CDN)

### 2. **zp10-login.html** (20 KB)
Complete login and registration page.

**Features:**
- Dark theme matching the application design
- Email/Password authentication
- Google SSO sign-in button
- Two tabs: Login and Registration
- Role selection (Schüler / Lehrer)
- Student class code entry during registration
- Teacher school email field during registration
- Password reset flow
- Form validation and error handling
- Automatic redirect based on user role after login

### 3. **zp10-lehrer.html** (31 KB)
Complete teacher dashboard with comprehensive features.

**Features:**
- Navigation bar with user info and logout
- Four main tabs:
  - **Meine Klassen:** Create new classes, view all teacher's classes with student count and class codes
  - **Statistiken:** View class analytics, student performance heatmap across modules, aggregate statistics
  - **Schüler:** List students in a class, view individual student module results
  - **Module:** Lock/unlock modules for specific classes
- Modal dialogs for class and student details
- Class code display and copy functionality
- Responsive design for mobile and desktop
- Dark theme throughout

### 4. **firestore-rules.txt** (8.4 KB)
Firestore security rules with comprehensive access control.

**Collections Protected:**
- `users/{uid}`: User profiles
- `classes/{classId}`: Class information and student enrollment
- `results/{uid}/modules/{moduleId}`: Student module results
- `results/{uid}/exams/{examId}`: Student exam results
- `customQuestions/{questionId}`: Teacher-created custom questions (optional)

**Access Control:**
- Students can only read/write their own results
- Teachers can read results of students in their classes
- Only teachers can create/manage classes
- Only teachers can lock/unlock modules
- Teachers cannot view/modify each other's classes

---

## Setup Instructions

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing project
3. Enable Google Analytics (optional but recommended)

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider
4. Add authorized domains (your app domain)

### Step 3: Create Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Choose **native mode** (recommended over datastore mode)
3. Start in **production mode** (we'll set security rules)
4. Choose your region (closest to your users)

### Step 4: Configure Firebase Config
1. In Firebase Console, go to **Project Settings** > **Your apps**
2. Copy your Firebase config object
3. Open `firebase-config.js`
4. Replace the placeholder values in the `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY_HERE",
     authDomain: "YOUR_AUTH_DOMAIN_HERE",
     projectId: "YOUR_PROJECT_ID_HERE",
     storageBucket: "YOUR_STORAGE_BUCKET_HERE",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
     appId: "YOUR_APP_ID_HERE",
     measurementId: "YOUR_MEASUREMENT_ID_HERE"
   };
   ```

### Step 5: Deploy Firestore Security Rules
1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Copy the entire content of `firestore-rules.txt`
3. Paste it into the Rules editor
4. Click **Publish**

### Step 6: Test the Setup
1. Open `zp10-login.html` in your browser
2. Try creating a new account (Email/Password or Google)
3. Verify:
   - Registration creates a user in Firebase Auth
   - User profile is created in Firestore
   - Login redirects to the appropriate dashboard
   - Teacher dashboard loads correctly

---

## Database Schema

### users/{uid}
```javascript
{
  uid: string,
  email: string,
  name: string,
  role: "schueler" | "lehrer",
  classId?: string,         // For students only
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### classes/{classId}
```javascript
{
  name: string,
  teacherUid: string,
  code: string,             // 6-character code for students
  studentUids: string[],    // Array of student UIDs
  createdAt: timestamp,
  moduleLocks: {            // e.g., { "algebra": true, "geometry": false }
    [moduleId]: boolean
  }
}
```

### results/{uid}/modules/{moduleId}
```javascript
{
  moduleId: string,
  score: number,
  maxScore: number,
  percentage: number,       // 0-100
  date: timestamp,
  xp: number,              // Experience points earned
  triggeredMVs: string[],  // Array of triggered metacognitive views
  klp: string[],           // Array of affected competencies
  timeUsed: number,        // Seconds
  answers: object[]        // Array of student answers (optional)
}
```

### results/{uid}/exams/{examId}
```javascript
{
  examId: string,
  score: number,
  maxScore: number,
  note: string | null,     // Grade/note if applicable
  date: timestamp,
  timeUsed: number,        // Seconds
  answers: object[]        // Array of student answers
}
```

---

## Integration with HTML Files

### Import in your HTML files:
```javascript
import {
  signInWithEmailPassword,
  logOut,
  onAuthChange,
  saveModuleResult,
  getAllModuleResults,
  // ... other functions as needed
} from './firebase-config.js';
```

### Use in your modules:
```javascript
// Save a module result
await saveModuleResult(currentUser.uid, 'algebra', {
  score: 18,
  maxScore: 20,
  percentage: 90,
  xp: 150,
  triggeredMVs: ['meta1', 'meta2'],
  klp: [],
  timeUsed: 1200
});

// Get all results for a student
const results = await getAllModuleResults(currentUser.uid);

// Listen to auth changes
onAuthChange((user) => {
  if (user) {
    console.log('User logged in:', user.uid);
  } else {
    console.log('User logged out');
  }
});
```

---

## Offline-First Approach

The `firebase-config.js` includes offline sync functionality:

```javascript
// Save results offline (if Firestore not available)
saveOfflineResult('module', 'algebra', null, resultData);

// Later, sync when back online
await syncOfflineResults(currentUser.uid);

// Check pending items
const pending = getOfflinePendingCount();
```

---

## Security Best Practices

1. **Never expose Firebase config in production** - The config itself is not sensitive, but API key should be restricted to your domain
2. **Firestore Rules are restrictive** - Students can only see/modify their own data; teachers can only see their students
3. **Regular backups** - Firebase Console has automatic backups
4. **Monitor usage** - Check your quota dashboard for unexpected spikes
5. **Test rules** - Use Firebase Emulator Suite for local development

---

## Troubleshooting

### "Project not found" error
- Verify your projectId in firebase-config.js matches your Firebase Console project ID

### "Permission denied" errors
- Check Firestore Security Rules are deployed correctly
- Verify user authentication state (check browser console)
- Make sure user profile is created in Firestore after signup

### Google Sign-In not working
- Add your domain to authorized domains in Google Cloud Console
- Verify Google OAuth consent screen is configured

### Class code not working during signup
- Make sure teacher created the class first
- Verify the 6-character code is correct (case-sensitive)
- Check class exists in Firestore and has correct name

---

## Next Steps

1. Integrate these files into your main application
2. Update import paths in HTML files if directory structure differs
3. Create `zp10-hub.html` for student dashboard
4. Create module pages and import firebase-config
5. Add offline service worker support for better offline experience

---

**Created:** March 27, 2026
**Firebase SDK Version:** 10.7.0 (modular)
**Target:** ZP10 Diagnose Platform
