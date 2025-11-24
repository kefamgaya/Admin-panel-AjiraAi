"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

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
        const { data, error, count } = await queryBuilder
          .range(offset, offset + limit - 1)
          .select("uid", { count: "exact" });

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
      const queryBuilder = supabase
        .from("all_users")
        .eq("role", "seeker");
      targetUids = await fetchAllRecipients(queryBuilder);
    } else if (recipientType === "companies") {
      // Fetch companies with pagination
      const queryBuilder = supabase.from("companies");
      targetUids = await fetchAllRecipients(queryBuilder);
    }

    if (targetUids.length === 0) {
      return { success: false, error: "No recipients found" };
    }

    // FCM limits: max 500 tokens per multicast message
    // We'll batch the notifications
    const batchSize = 500;
    let totalDelivered = 0;
    let totalFailed = 0;

    // Build FCM message payload following FCM rules
    const fcmPayload: admin.messaging.MulticastMessage = {
      notification: {
        title: title.substring(0, 65), // Enforce max length
        body: message.substring(0, 240), // Enforce max length
        ...(imageUrl && { imageUrl }), // Optional image
      },
      data: {
        ...(actionUrl && { click_action: actionUrl }), // Optional action
        sent_at: new Date().toISOString(),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
          priority: "high" as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
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

    // Send in batches
    const tokenStrings = validTokens.map(t => t.token);
    for (let i = 0; i < tokenStrings.length; i += batchSize) {
      const tokens = tokenStrings.slice(i, i + batchSize);

      try {
        const response = await admin.messaging().sendEachForMulticast({
          ...fcmPayload,
          tokens,
        });

        totalDelivered += response.successCount;
        totalFailed += response.failureCount;
      } catch (error) {
        console.error("FCM send error:", error);
        totalFailed += tokens.length;
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

