import "server-only";
import { db } from "./db";
import { emailTemplate } from "./email-templates";
import { getEmailProvider } from "./email-provider";
export async function drainOutbox() {
  const provider = getEmailProvider();
  if (!provider) return { sent: 0, configured: false };
  const client = db();
  const { data: jobs, error } = await client.rpc("claim_emails");
  if (error) throw error;
  let sent = 0;
  for (const job of jobs || []) {
    try {
      const rendered = emailTemplate(job.template, job.payload);
      await provider.send({
        idempotencyKey: job.id,
        to: job.recipient,
        ...rendered,
      });
      await client
        .from("email_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", job.id);
      sent++;
    } catch {
      await client
        .from("email_outbox")
        .update({
          status: job.attempts >= 5 ? "failed" : "pending",
          last_error: "delivery_failed",
        })
        .eq("id", job.id);
    }
  }
  return { sent, configured: true };
}
