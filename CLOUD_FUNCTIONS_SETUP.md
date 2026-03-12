# Cloud Functions Setup for Push Notifications

## What's Ready

✅ Cloud Function code in `functions/index.js`
✅ VAPID keys configured
✅ Two trigger functions:
   - `sendChatNotification`: Triggered when new message in chat_channels
   - `sendDMNotification`: Triggered when new DM message
✅ Push notification logic: sends to all users except sender

## How to Deploy

### Step 1: Login to Firebase

```bash
firebase login
```

Select your Firebase project when prompted.

### Step 2: Deploy Functions

```bash
cd /tmp/muonv2.0
firebase deploy --only functions
```

This will:
- Upload functions to Firebase
- Create Firestore triggers
- Deploy HTTP endpoint for VAPID key

### Step 3: Verify Deployment

In Firebase Console:
1. Go to **Cloud Functions**
2. You should see:
   - `sendChatNotification` (Firestore trigger)
   - `sendDMNotification` (Firestore trigger)
   - `getVapidKey` (HTTP trigger)

## How It Works

### When user sends message:

1. **Frontend:** Message saved to Firestore `chat_channels/{id}/messages/{id}`
2. **Cloud Function:** Detects new message (onCreate trigger)
3. **Function Logic:**
   - Get all active push subscriptions
   - Build notification payload
   - Send Web Push to all users (except sender)
4. **Service Worker:** Receives push, shows notification
5. **Mobile:** User sees notification + hears sound + vibrates

### Push Subscription Storage

Subscriptions stored in Firestore:
```
push_subscriptions/{userId}
  ├─ subscription: { endpoint, keys... }
  └─ updatedAt: timestamp
```

When user grants notification permission in Chat:
- Frontend calls `subscribeToWebPush(userId)`
- Stores subscription under user ID
- Cloud Function reads these on new messages

## Environment Variables (Optional)

If you want to use env vars instead of hardcoded keys:

1. Create `.env` file in `functions/`:
```
VAPID_PUBLIC=BBo0I4DuK1Sk-MExUGj7UrgE2y4HTgAGO6nisAQxJu4TFYUiPb1IEOwRk0ZYr4YmtEx_Ag256ogjznbuKLw9NtU
VAPID_PRIVATE=3gHCHUteClu_hhlViIDfcU0zoowtupJR5d-15OhKDiU
```

2. Set Firebase config:
```bash
firebase functions:config:set vapid.public=<key> vapid.private=<key>
```

## Testing Push Notifications

### Manual Test:

1. Open app on mobile
2. Grant notification permission
3. Send a message from desktop
4. **Mobile should ping!** 📱🔔

### Check Logs:

```bash
firebase functions:log
```

You'll see:
```
✅ Push sent to user123
✅ Push sent to user456
📨 Notifications sent
```

## Troubleshooting

### "No push subscriptions found"
- User hasn't granted notification permission yet
- User's subscription expired (need to re-grant)
- Browser doesn't support Web Push

### "Error 410: Gone"
- Subscription expired
- Cloud Function will auto-delete it
- User needs to re-grant permission

### "VAPID key mismatch"
- Frontend and backend VAPID keys don't match
- Update both if you generate new keys
- Run: `npm run generate-vapid` and update backend

## Next Steps

After deployment:

1. ✅ Test on mobile (send message, should notify)
2. ✅ Check Cloud Function logs
3. ✅ Test with app closed (should still notify!)
4. ✅ Celebrate! 🎉

---

**Ready to deploy?**

```bash
cd /tmp/muonv2.0
firebase deploy --only functions
```

Questions? Check logs with:
```bash
firebase functions:log --limit 50
```
