import { db } from "@/lib/db";

interface Message {
  to: string;
  channel: "EMAIL" | "SMS";
  subject: string;
  body: string;
}

/**
 * Notification integration point.
 * - EMAIL: this project ships without an SMTP library to keep dependencies small.
 *   Add `nodemailer` and send inside `deliver()` when SMTP_* variables are configured.
 * - SMS: posts JSON to SMS_WEBHOOK_URL (use any provider's HTTP gateway) when configured.
 * Without credentials, messages are stored in the Notification table and logged only.
 */
async function deliver(m: Message): Promise<{ sent: boolean; error?: string }> {
  if (m.channel === "SMS" && process.env.SMS_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.SMS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.SMS_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.SMS_WEBHOOK_TOKEN}` } : {}),
        },
        body: JSON.stringify({ to: m.to, message: m.body }),
      });
      return res.ok ? { sent: true } : { sent: false, error: `HTTP ${res.status}` };
    } catch (e) {
      return { sent: false, error: e instanceof Error ? e.message : "unknown error" };
    }
  }
  console.info(`[notify:${m.channel}] to=${m.to} subject="${m.subject}" (no provider configured, logged only)`);
  return { sent: false, error: "No provider configured" };
}

export async function notify(m: Message): Promise<void> {
  const result = await deliver(m);
  await db.notification.create({
    data: { ...m, sent: result.sent, error: result.error ?? null },
  });
}
