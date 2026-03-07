import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * 🔔 DAILY RESET - Emoji Counts Reset at Midnight (00:00)
 * 
 * This function runs every day at 00:00 (midnight) in Europe/Oslo timezone
 * It creates a fresh document for the new day, effectively resetting emoji counters
 */
export const resetEmojiCountsDaily = functions
  .region('europe-west1')
  .pubsub.schedule('0 0 * * *')  // Every day at 00:00 UTC (01:00 CET / 02:00 CEST)
  .timeZone('Europe/Oslo')       // Convert to Oslo timezone (UTC+1/+2)
  .onRun(async (context) => {
    try {
      const today = new Date();
      const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD

      // Create new document for today with empty counts
      // This effectively "resets" emoji counters for the new day
      await db.collection('emoji_counts_daily').doc(dateKey).set({
        date: dateKey,
        counts: {},
        createdAt: admin.firestore.Timestamp.now(),
        resetAt: admin.firestore.Timestamp.now(),
      }, { merge: false }); // merge: false = overwrite if exists

      console.log(`✅ Emoji counts reset for new day: ${dateKey}`);
      return null;
    } catch (error) {
      console.error('❌ Error resetting emoji counts:', error);
      throw error;
    }
  });

/**
 * 📊 DAILY SUMMARY - Archive yesterday's emoji counts (optional)
 * 
 * This runs daily and archives the previous day's counts to a separate collection
 * Useful for historical tracking before they get overwritten
 */
export const archiveYesterdayEmojiCounts = functions
  .region('europe-west1')
  .pubsub.schedule('1 0 * * *')  // 00:01 UTC (01:01 CET)
  .timeZone('Europe/Oslo')
  .onRun(async (context) => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      
      // Get yesterday's data
      const yesterdayDoc = await db.collection('emoji_counts_daily').doc(yesterdayKey).get();
      
      if (yesterdayDoc.exists) {
        const yesterdayData = yesterdayDoc.data();
        
        // Archive to historical collection
        await db.collection('emoji_counts_archive').doc(yesterdayKey).set(yesterdayData);
        
        console.log(`📦 Archived emoji counts for ${yesterdayKey}`);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error archiving emoji counts:', error);
      throw error;
    }
  });

/**
 * 🧹 CLEANUP - Remove emoji counts older than 90 days (optional)
 * 
 * This runs monthly and removes old historical data to keep Firestore clean
 */
export const cleanupOldEmojiCounts = functions
  .region('europe-west1')
  .pubsub.schedule('0 3 1 * *')  // First day of month at 03:00 UTC
  .timeZone('Europe/Oslo')
  .onRun(async (context) => {
    try {
      const today = new Date();
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      
      const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];
      
      // Query and delete documents older than 90 days
      const oldDocs = await db.collection('emoji_counts_archive')
        .where('date', '<', cutoffDate)
        .limit(100)
        .get();
      
      let deletedCount = 0;
      for (const doc of oldDocs.docs) {
        await doc.ref.delete();
        deletedCount++;
      }
      
      console.log(`🧹 Cleaned up ${deletedCount} old emoji count records`);
      return null;
    } catch (error) {
      console.error('❌ Error cleaning up emoji counts:', error);
      throw error;
    }
  });
