import { z } from "zod";
import { interests, levels, years } from "./content";
const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, "يرجى إكمال هذا الحقل")
    .max(max, "النص أطول من المسموح")
    .refine(
      (v) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F<>]/.test(v),
      "يرجى إدخال نص دون وسوم",
    );
export const registrationSchema = z.object({
  full_name: text(3, 120),
  email: z
    .email("أدخل بريدًا إلكترونيًا صحيحًا")
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    }, "أدخل رقم هاتف يتكون من 8 إلى 15 رقمًا مع رمز الدولة")
    .regex(/^\+?[0-9\s()-]{8,22}$/, "أدخل رقمًا صحيحًا مع رمز الدولة"),
  university: text(2, 160),
  major: text(2, 160),
  year: z.enum(years as [string, ...string[]]),
  city: text(0, 100).optional(),
  age: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v) && Number(v) >= 13 && Number(v) <= 100),
      "العمر بين 13 و100",
    ),
  ai_level: z.enum(levels as [string, ...string[]]),
  interests: z.array(z.enum(interests as [string, ...string[]])).max(8),
  motivation: text(0, 2000).optional(),
  support_requested: z.boolean().default(false),
  consent: z.literal(true, { error: "الموافقة مطلوبة لإتمام التسجيل" }),
  website: z.string().max(0),
  cohort_id: z.uuid(),
});
export type RegistrationInput = z.input<typeof registrationSchema>;
export const contactSchema = z.object({
  name: text(2, 120),
  email: z.email().max(254),
  subject: text(3, 160),
  message: text(10, 3000),
  website: z.string().max(0),
});
export const courseSchema = z
  .object({
    name: text(3, 160),
    description: text(10, 1000),
    start_date: z.iso.date().nullable(),
    end_date: z.iso.date().nullable(),
    days: text(0, 150),
    time: z
      .string()
      .refine((v) => v === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(v)),
    timezone: z.string().refine((v) => {
      try {
        new Intl.DateTimeFormat("ar", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }),
    sessions: z.number().int().positive().max(200).nullable(),
    session_minutes: z.number().int().positive().max(480).nullable(),
    capacity: z.number().int().positive().max(10000).nullable(),
    deadline: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)))
      .nullable(),
    price: z.number().min(0).max(100000).nullable(),
    currency: z.enum(["ILS", "USD", "JOD", "EUR", "TRY", "SAR", "AED"]),
    state: z.enum(["open", "limited", "closed", "waitlist", "upcoming"]),
    registration_enabled: z.boolean(),
    waitlist_enabled: z.boolean(),
    support_enabled: z.boolean(),
    meeting_url: z.union([
      z.literal(""),
      z.url().refine((v) => v.startsWith("https://")),
    ]),
    payment_instructions: text(0, 3000),
  })
  .refine(
    (v) => !v.start_date || !v.end_date || v.end_date >= v.start_date,
    "تاريخ النهاية يجب أن يلي البداية",
  );
export const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum([
    "pending",
    "approved",
    "waitlisted",
    "rejected",
    "cancelled",
  ]),
  payment: z.enum(["pending", "received", "scholarship", "free"]),
  note: text(0, 3000),
});
