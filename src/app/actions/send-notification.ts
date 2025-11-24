"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { firebaseAdmin, ensureFirebaseAdmin } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

interface SendNotificationParams {
  title: string;
  message: string;
  recipientType: "all" | "seekers" | "companies" | "specific";
  recipientUids?: string[];
  imageUrl?: string;
  actionUrl?: string;
  sentBy: string;
}

export async function sendNotification(params: SendNotificationParams) {
  const supabase = await createClient();

  try {
    const { title, message, recipientType, recipientUids, imageUrl, actionUrl, sentBy } = params;

    // FCM Validation Rules
    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title is required" };
    }

    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message is required" };
    }

    // FCM title max length: 65 characters (recommended)
    if (title.length > 65) {
      return { success: false, error: "Title must be 65 characters or less" };
    }

    // FCM message max length: 240 characters (recommended for best display)
    if (message.length > 240) {
      return { success: false, error: "Message must be 240 characters or less" };
    }

    // Helper function to fetch all data with pagination
    async function fetchAllRecipients(queryBuilder: any): Promise<string[]> {
      let allUids: string[] = [];
      let offset = 0;
      const limit = 1000;

      while (true) {
        // Clone the query builder and add select/range for pagination
        // If queryBuilder already has select(), use it directly, otherwise add select
        const query = queryBuilder.select("uid", { count: "exact" });
        const { data, error, count } = await query.range(offset, offset + limit - 1);

        if (error) {
          console.error("Error fetching recipients:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          break;
        }

        allUids = allUids.concat(data.map((item: any) => item.uid));
        offset += limit;

        if (count !== null && offset >= count) {
          break;
        }
      }

      return allUids;
    }

    // Determine recipients
    let targetUids: string[] = [];
    
    if (recipientType === "specific") {
      if (!recipientUids || recipientUids.length === 0) {
        return { success: false, error: "Please select at least one recipient" };
      }
      targetUids = recipientUids;
    } else if (recipientType === "all") {
      // Fetch all users with pagination
      const queryBuilder = supabase.from("all_users");
      targetUids = await fetchAllRecipients(queryBuilder);
    } else if (recipientType === "seekers") {
      // Fetch job seekers with pagination
      // Use accounttype instead of role for seekers
      // Need to call select() first to get the proper query builder type
      const queryBuilder = supabase.from("all_users").select("uid").eq("accounttype", "seeker");
      targetUids = await fetchAllRecipients(queryBuilder);
    } else if (recipientType === "companies") {
      // Fetch companies with pagination
      // Companies might be in all_users with accounttype='employer' or in companies table
      // Try all_users first with employer accounttype
      // Need to call select() first to get the proper query builder type
      const queryBuilder = supabase.from("all_users").select("uid").eq("accounttype", "employer");
      targetUids = await fetchAllRecipients(queryBuilder);
    }

    if (targetUids.length === 0) {
      return { success: false, error: "No recipients found" };
    }

    // FCM limits and best practices:
    // - Max 500 tokens per multicast message (sendEachForMulticast)
    // - Use batching to avoid rate limits
    // - Handle invalid tokens and remove them
    // - Implement retry logic for transient errors
    const batchSize = 500; // FCM maximum for sendEachForMulticast
    let totalDelivered = 0;
    let totalFailed = 0;

    // Build FCM message payload following FCM best practices
    // Reference: https://firebase.google.com/docs/cloud-messaging/send-message
    const fcmPayload: admin.messaging.MulticastMessage = {
      notification: {
        title: title.substring(0, 65), // FCM recommended: max 65 chars for title
        body: message.substring(0, 240), // FCM recommended: max 240 chars for body
        ...(imageUrl && { imageUrl }), // Optional: large image for Android/iOS
      },
      // Data payload for handling in app (not displayed in notification)
      data: {
        ...(actionUrl && { click_action: actionUrl }), // Deep link or action URL
        sent_at: new Date().toISOString(),
        notification_type: recipientType,
      },
      // Android-specific configuration
      android: {
        priority: "high" as const, // Required for data messages, recommended for notifications
        notification: {
          sound: "default",
          channelId: "default", // Android notification channel
          priority: "high" as const,
          ...(imageUrl && { imageUrl }), // Android large image
        },
        // Optional: Android-specific data
        data: {
          ...(actionUrl && { click_action: actionUrl }),
        },
      },
      // iOS (APNS) specific configuration
      apns: {
        payload: {
          aps: {
            alert: {
              title: title.substring(0, 65),
              body: message.substring(0, 240),
            },
            sound: "default",
            badge: 1, // Increment badge count
            ...(imageUrl && { "mutable-content": 1 }), // Enable notification extension for images
          },
        },
        // Optional: Custom data for iOS
        ...(imageUrl && {
          fcmOptions: {
            imageUrl,
          },
        }),
      },
      // Web push configuration
      webpush: {
        notification: {
          title: title.substring(0, 65),
          body: message.substring(0, 240),
          icon: "/icon-192x192.png", // Default icon path
          ...(imageUrl && { image: imageUrl }),
          ...(actionUrl && { requireInteraction: true }), // Keep notification until user interacts
        },
        ...(actionUrl && {
          fcmOptions: {
            link: actionUrl,
          },
        }),
      },
      tokens: [], // Will be filled in batches
    };

    // Get FCM tokens for target UIDs with pagination
    // FCM tokens might be stored in all_users table or a separate tokens table
    let validTokens: { uid: string; token: string }[] = [];
    const tokenBatchSize = 1000;
    
    // Fetch tokens in batches to avoid query size limits
    for (let i = 0; i < targetUids.length; i += tokenBatchSize) {
      const batchUids = targetUids.slice(i, i + tokenBatchSize);
      
      const { data: fcmTokens, error: tokenError } = await supabase
        .from("all_users")
        .select("uid, token")
        .in("uid", batchUids)
        .not("token", "is", null);
      
      if (tokenError) {
        console.error("Error fetching FCM tokens:", tokenError);
        continue;
      }
      
      if (fcmTokens) {
        validTokens = validTokens.concat(
          fcmTokens
            .filter(t => t.token)
            .map(t => ({ uid: t.uid, token: t.token }))
        );
      }
    }

    // Check if Firebase Admin is initialized, try to initialize if not
    if (!firebaseAdmin.apps.length) {
      const initialized = ensureFirebaseAdmin();
      if (!initialized) {
        const missing: string[] = [];
        if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
        if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
        if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
        
        return { 
          success: false, 
          error: `Firebase Admin not initialized. Missing environment variables: ${missing.join(', ')}. Please check your production environment configuration.` 
        };
      }
    }

    // Send in batches following FCM best practices
    // FCM allows up to 500 tokens per multicast message
    const tokenStrings = validTokens.map(t => t.token);
    const invalidTokens: string[] = []; // Track invalid tokens for cleanup
    
    for (let i = 0; i < tokenStrings.length; i += batchSize) {
      const tokens = tokenStrings.slice(i, i + batchSize);

      try {
        const response = await firebaseAdmin.messaging().sendEachForMulticast({
          ...fcmPayload,
          tokens,
        });

        totalDelivered += response.successCount;
        totalFailed += response.failureCount;

        // Handle invalid tokens - FCM best practice: remove invalid tokens
        if (response.responses) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errorCode = resp.error?.code;
              // Token is invalid or unregistered - should be removed
              if (errorCode === 'messaging/invalid-registration-token' || 
                  errorCode === 'messaging/registration-token-not-registered') {
                invalidTokens.push(tokens[idx]);
              }
            }
          });
        }
      } catch (error: any) {
        console.error("FCM send error:", error);
        // If it's a rate limit error, we should retry with backoff
        if (error.code === 'messaging/quota-exceeded' || error.code === 'messaging/unavailable') {
          console.warn("FCM rate limit hit, consider implementing exponential backoff");
        }
        totalFailed += tokens.length;
      }
    }

    // Clean up invalid tokens (FCM best practice)
    if (invalidTokens.length > 0) {
      console.log(`Cleaning up ${invalidTokens.length} invalid FCM tokens`);
      try {
        // Remove invalid tokens from database
        const { error: cleanupError } = await supabase
          .from("all_users")
          .update({ token: null })
          .in("token", invalidTokens);
        
        if (cleanupError) {
          console.error("Error cleaning up invalid tokens:", cleanupError);
        }
      } catch (cleanupErr) {
        console.error("Error during token cleanup:", cleanupErr);
      }
    }

    // Save to notification history
    const { error: saveError } = await supabase
      .from("notification_history")
      .insert({
        title,
        message,
        recipient_type: recipientType,
        recipient_uids: targetUids,
        sent_by: sentBy,
        delivery_count: totalDelivered,
        read_count: 0,
        sent_at: new Date().toISOString(),
      });

    if (saveError) {
      console.error("Error saving notification history:", saveError);
    }

    revalidatePath("/admin/notifications");

    return {
      success: true,
      delivered: totalDelivered,
      failed: totalFailed,
      total: targetUids.length,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send notification",
    };
  }
}

