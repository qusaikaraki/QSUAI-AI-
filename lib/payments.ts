/** Gateway boundary. Never treat a browser redirect as proof of payment. */
export interface PaymentProvider {
  readonly name: string;
  createPayment(
    registrationId: string,
  ): Promise<
    { kind: "manual"; instructions: string } | { kind: "redirect"; url: string }
  >;
  verifyWebhook?(
    rawBody: string,
    signature: string,
  ): Promise<{ registrationId: string; received: boolean }>;
}
export function manualPayments(instructions: string): PaymentProvider {
  return {
    name: "manual",
    async createPayment() {
      return { kind: "manual", instructions };
    },
  };
}
