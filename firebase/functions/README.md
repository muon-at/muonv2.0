# Cloud Functions for muonv2.0

## Setup & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Functions
```bash
# From the functions directory
npm run deploy

# OR from root
firebase deploy --only functions
```

### 3. Monitor Logs
```bash
npm run logs

# OR from root
firebase functions:log
```

## Functions

### `resetEmojiCountsDaily` ⏰
- **Schedule:** Every day at 00:00 (midnight) Oslo time
- **What it does:** Creates a fresh document for the new day, effectively resetting emoji counters
- **Firestore:** Creates `emoji_counts_daily/{YYYY-MM-DD}` with empty counts

### `archiveYesterdayEmojiCounts` 📦
- **Schedule:** Every day at 00:01 (1 minute after reset)
- **What it does:** Archives yesterday's counts to `emoji_counts_archive` for historical tracking
- **Purpose:** Keep history before data gets reset

### `cleanupOldEmojiCounts` 🧹
- **Schedule:** First day of month at 03:00 UTC
- **What it does:** Deletes archived records older than 90 days
- **Purpose:** Keep Firestore database clean

## Firestore Collections

### `emoji_counts_daily/`
- **Key:** YYYY-MM-DD (e.g., "2026-03-07")
- **Data:**
  ```json
  {
    "date": "2026-03-07",
    "counts": {
      "Oliver T Jenssen": { "🔔": 2, "💎": 1, "🎁": 1 },
      "Stian Abrahamsen": { "🔔": 0, "💎": 0, "🎁": 0 }
    },
    "createdAt": timestamp,
    "resetAt": timestamp
  }
  ```

### `emoji_counts_archive/`
- Historical records from previous days (before deletion)
- Same format as `emoji_counts_daily`

## Troubleshooting

### Function not triggering?
1. Check time zone in Firebase Console (should be Europe/Oslo)
2. Verify Pub/Sub topic exists: `projects/{project-id}/topics/firebase-schedule-resetEmojiCountsDaily`
3. Check function logs: `firebase functions:log`

### Emulator testing
```bash
npm start
# Function will run locally at scheduled times
```

## Integration with Admin Dashboard

The Admin Dashboard (`AdminDashboard.tsx`) automatically:
1. Reads from `emoji_counts_daily/{today}`
2. Displays counts in Progresjon table
3. Real-time updates from chat
4. Automatically resets when the scheduled function runs

No code changes needed in the dashboard!
