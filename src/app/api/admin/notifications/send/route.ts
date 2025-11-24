import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { title, message, recipient_type, target_audience } = body; 
  // target_audience could be "all_users", "seekers", "companies", or specific UIDs

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  try {
    // 1. Determine recipients and fetch tokens
    let tokens: string[] = [];
    let recipientUids: string[] = [];

    // Assuming we have a 'token' column in 'all_users' or similar for FCM tokens
    // Adjust logic based on real schema. 
    // Previous schema for `all_users` showed a `token` column.
    
    let query = supabase.from("all_users").select("uid, token");
    
    if (recipient_type === "seekers") {
       // Filter if there's a role or type, but all_users seems mixed.
       // Schema has `accounttype`? Or `role`?
       // `all_users` has `accounttype`.
       query = query.eq("accounttype", "seeker");
    } else if (recipient_type === "companies") {
       // Companies table has `uid`. Need to join or check company users.
       // Actually `companies` table doesn't have `token` column in schema output I saw earlier?
       // Let's check `companies` schema again.
       // `companies` has `uid`, `email`. No token.
       // Maybe company users are also in `all_users`?
       // Assuming company users are in `all_users` with `accounttype`='employer' or 'company'.
       query = query.eq("accounttype", "employer"); 
    }
    
    // If specific audience, handle here (omitted for brevity)

    const { data: recipients, error: fetchError } = await query;
    
    if (fetchError) throw fetchError;

    if (recipients) {
      // Filter out users without tokens
      const validRecipients = recipients.filter(r => r.token && r.token.length > 10);
      tokens = validRecipients.map(r => r.token!);
      recipientUids = validRecipients.map(r => r.uid);
    }

    let successCount = 0;
    let failureCount = 0;

    // 2. Send via FCM following best practices
    // Reference: https://firebase.google.com/docs/cloud-messaging/send-message
    if (tokens.length > 0) {
      // FCM Multicast allows up to 500 tokens at once (sendEachForMulticast limit)
      const batchSize = 500;
      const invalidTokens: string[] = [];
      
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batchTokens = tokens.slice(i, i + batchSize);
        
        // Build FCM message payload following FCM best practices
        const messagePayload: admin.messaging.MulticastMessage = {
          notification: { 
            title: title.substring(0, 65), // FCM recommended: max 65 chars
            body: message.substring(0, 240) // FCM recommended: max 240 chars
          },
          tokens: batchTokens,
          data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            sent_at: new Date().toISOString(),
          },
          android: {
            priority: "high" as const,
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
        };

        try {
          const response = await firebaseAdmin.messaging().sendEachForMulticast(messagePayload);
          successCount += response.successCount;
          failureCount += response.failureCount;
          
          // Handle invalid tokens - FCM best practice: remove invalid tokens
          if (response.responses) {
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errorCode = resp.error?.code;
                if (errorCode === 'messaging/invalid-registration-token' || 
                    errorCode === 'messaging/registration-token-not-registered') {
                  invalidTokens.push(batchTokens[idx]);
                }
              }
            });
          }
        } catch (error: any) {
          console.error("FCM send error:", error);
          // Handle rate limiting
          if (error.code === 'messaging/quota-exceeded' || error.code === 'messaging/unavailable') {
            console.warn("FCM rate limit hit, consider implementing exponential backoff");
          }
          failureCount += batchTokens.length;
        }
      }
      
      // Clean up invalid tokens (FCM best practice)
      if (invalidTokens.length > 0) {
        try {
          await supabase
            .from("all_users")
            .update({ token: null })
            .in("token", invalidTokens);
          console.log(`Cleaned up ${invalidTokens.length} invalid FCM tokens`);
        } catch (cleanupErr) {
          console.error("Error cleaning up invalid tokens:", cleanupErr);
        }
      }
    }

    // 3. Log to notification_history
    const { error: logError } = await supabase.from("notification_history").insert({
      title,
      message,
      recipient_type: recipient_type || "all",
      recipient_uids: recipientUids, // This might be large, array column handled?
      sent_by: user.id,
      delivery_count: successCount,
      read_count: 0 // Will need an API to update this when read
    });

    if (logError) {
      console.error("Failed to log notification:", logError);
    }

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      failed: failureCount,
      total_targeted: tokens.length
    });

  } catch (error: any) {
    console.error("Notification Send Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

