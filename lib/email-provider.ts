import "server-only";

export interface TransactionalMessage {
  idempotencyKey: string;
  to: string;
  subject: string;
  html: string;
}
export interface EmailProvider {
  readonly name: string;
  send(message: TransactionalMessage): Promise<void>;
}
export function getEmailProvider(): EmailProvider | null {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return null;
  const provider = process.env.EMAIL_PROVIDER || "resend";
  if (provider !== "resend") throw new Error("Unsupported email provider");
  return {
    name: "resend",
    async send(message) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": message.idempotencyKey,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [message.to],
          subject: message.subject,
          html: message.html,
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error(`email_provider_${response.status}`);
    },
  };
}
