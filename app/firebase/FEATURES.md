# ZP10 Diagnose v4 Design - Feature Overview

## Login Page (zp10-login.html)

### Visual Design
- Hero section with "Mathe-Check ZP10" branding
- Two-column layout (hero + form card)
- Decorative gradient blobs in background
- Feature highlights (3 key benefits)

### User Experience
- Tab-based login/registration
- Email/Password authentication
- Google Single Sign-On
- Role selection (Student/Teacher)
- Class code entry for students
- Password reset flow
- Loading indicators
- Clear error messages

### Color Scheme
- Primary: #5B6CF0 (purple)
- Accent: #FF6B8A (pink)
- Background: #F0F4FF (light purple)
- Text: #1A1D3B (dark)

## Teacher Dashboard (zp10-lehrer.html)

### Navigation
```
┌─────────────────────────────────────────────────┐
│ 📊 Mathe-Check    [Live-Sync Badge]    👤 Logout│
└─────────────────────────────────────────────────┘

┌─ Tabs ─────────────────────────────────────────┐
│ 📚 Klassen | 📈 Statistiken | 👥 Schüler | 🎯 Module
└────────────────────────────────────────────────┘
```

### Tab 1: Klassen (Classes)
- Grid of class cards
- Class name, code, student count
- Quick actions (Edit, Delete)
- "Create New Class" button
- Displays date created

### Tab 2: Statistiken (Statistics)
**Summary Cards:**
- Total Classes
- Total Students
- Modules Completed
- Average Success Rate

**Kompetenz-Radar (Competency Radar):**
- Radar chart showing performance across topics
- Topics: Algebra, Geometrie, Funktionen, Stochastik, Trigonometrie
- Visual representation of class strengths/weaknesses

**Notenprognose (Grade Prognosis):**
- Bar chart projecting grade distribution (1-6)
- Shows expected number of students per grade
- Helps teachers plan support strategies

**Förderempfehlungen (Recommendations):**
- 3 personalized recommendations
- Color-coded cards (primary background)
- Specific topics and suggested actions
- Examples:
  - "Geometrie: Intensive Wiederholung" (5 students)
  - "Algebra: Gute Fortschritte" (all students)
  - "Stochastik: Differenzierung notwendig" (mixed level)

### Tab 3: Schüler (Students)
- Complete list of all students across classes
- Student name, email, class
- View details button per student
- Student modal with:
  - Completed modules
  - Scores and percentages
  - Option to remove from class

### Tab 4: Module (Module Management)
- Per-class module lock/unlock
- Prevents students from accessing before teacher readiness
- Class selection dropdown
- Module list with lock status

### Live-Sync Badge
Located in navbar center:
- **Green (✓ Synchronisiert)**: All changes saved to Firebase
- **Yellow (↻ Wird synchronisiert)**: Syncing in progress
- **Yellow (◐ X ausstehend)**: X results waiting to sync
- **Gray (◌ Offline)**: No internet connection

### Modal Dialogs

**Create Class Modal:**
- Input: Class name
- Buttons: Cancel, Create
- Auto-generates 6-character class code

**Student Details Modal:**
- Student name in header
- List of all module results
- Score, max points, percentage
- Remove button (with confirmation)

### Print Support
When printing (Ctrl+P):
- Hides navbar, tabs, buttons
- Maintains all data tables and charts
- Page-break handling for cards
- High contrast for readability
- Professional report layout

## Unified Sync Module (zp10-firebase-sync.js)

### Architecture
```
Module Result
    ↓
ZP10Sync.saveResult()
    ↓
[1. Save to localStorage] ←─── Always succeeds
    ↓
[2. Try Firebase sync]
    ├─ Online + User logged in → SUCCESS
    └─ Offline/No user → Queue for retry
    ↓
[Custom "zp10-sync-status" event]
    ↓
UI status indicator updated
```

### Features

**Offline-First Design:**
- All results saved to localStorage first
- Guaranteed data preservation even if network fails
- Automatic sync when connection restored
- Queue system for retries

**Status Indicators:**
```javascript
status: 'synced'    // All data synced to Firebase
status: 'pending'   // Some results awaiting sync
status: 'syncing'   // Currently syncing
status: 'error'     // Sync error occurred
status: 'offline'   // No internet connection
```

**Event System:**
```javascript
window.addEventListener('zp10-sync-status', (e) => {
  console.log(e.detail); // { status, pendingCount }
});
```

**Statistics API:**
```javascript
const stats = ZP10Sync.getStats();
// Returns: {
//   total: 25,           // Total results saved
//   synced: 22,          // Successfully synced
//   pending: 3,          // Awaiting sync
//   online: true,        // Firebase connected
//   user: 'user@email'   // Current user email
// }
```

### Module Integration
Simple 3-step integration:

```html
<!-- Step 1: Include the script -->
<script src="../firebase/zp10-firebase-sync.js"></script>

<!-- Step 2: Add sync indicator (optional) -->
<div id="syncStatus"></div>
<script>ZP10Sync.showSyncStatus('syncStatus');</script>

<!-- Step 3: Save results when module completes -->
<script>
const resultData = {
  score: 18,
  maxScore: 20,
  percentage: 90,
  xp: 150,
  triggeredMVs: [],
  klp: ['KLP-Algebra-Basics'],
  timeUsed: 1200  // seconds
};

ZP10Sync.saveResult('modul-algebra-basics', resultData);
</script>
```

## Design System Details

### Typography
```css
Headings:   Nunito Sans, 700-800 weight, 18-42px
Body:       Inter, 400-500 weight, 13-16px
Mono:       Courier New (for class codes)
```

### Spacing Scale
```
xs: 6px
sm: 12px
md: 16px
lg: 20px
xl: 28px
2xl: 32px
3xl: 40px
```

### Border Radius
```
Small: 12px (inputs, small cards)
Medium: 14px (buttons)
Large: 20px (main cards, modals)
```

### Shadows
```
Small: 0 2px 8px rgba(0,0,0,0.04)
Medium: 0 4px 12px rgba(91,108,240,0.2)
Large: 0 20px 60px rgba(0,0,0,0.3)
```

### Transitions
```
Duration: 0.3s
Timing: ease (default)
Used on: hover, focus, visibility changes
```

## Responsive Breakpoints

```
Desktop:  > 1024px  (full layout)
Tablet:   768-1024px (adjusted padding)
Mobile:   < 768px   (single column, optimized touch)
```

### Mobile Optimizations
- Touch-friendly button sizes (44px minimum)
- Single column layouts
- Optimized typography sizes
- Readable form inputs
- Swipeable tab navigation (overflow-x on tabs)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Form labels linked to inputs
- Focus states visible (3px box-shadow)
- Color contrast WCAG AA compliant
- Keyboard navigation support
- Error messages clear and descriptive
- Loading states announced

## Browser Compatibility

**Fully supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile:**
- iOS Safari 14+
- Chrome Mobile (latest 2 versions)
- Samsung Internet 14+

**Features requiring:**
- CSS Grid (all modern browsers)
- CSS custom properties (all modern browsers)
- Chart.js 3.9+ (included via CDN)
- Firebase SDK (included via CDN)

## Performance Metrics

- Page load: < 2 seconds
- First contentful paint: < 1 second
- Cumulative layout shift: < 0.1
- Time to interactive: < 2.5 seconds
- Chart.js adds ~100KB minified

## Security Considerations

- Passwords never displayed in console
- LocalStorage used only for offline sync
- Firebase security rules enforce per-user access
- HTTPS required for all Firebase operations
- Session tokens auto-expire
- No sensitive data in URLs

