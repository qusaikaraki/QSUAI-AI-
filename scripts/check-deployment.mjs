// Validate launch configuration without displaying credentials or contacting services.
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const errors = [];
const required = [
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RATE_LIMIT_SECRET",
  "CRON_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "ADMIN_NOTIFICATION_EMAIL",
];
for (const name of required) {
  if (!process.env[name]?.trim()) errors.push(`${name}: missing`);
}

function httpsUrl(name, originOnly = false) {
  if (!process.env[name]) return;
  try {
    const value = process.env[name];
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hostname === "localhost" ||
      url.hostname.endsWith(".localhost") ||
      url.hostname.endsWith(".test") ||
      url.hostname.endsWith(".invalid") ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]" ||
      (originOnly && value !== url.origin)
    ) {
      errors.push(`${name}: use an exact public HTTPS origin without a trailing slash`);
    }
  } catch {
    errors.push(`${name}: invalid URL`);
  }
}

httpsUrl("NEXT_PUBLIC_SITE_URL", true);
httpsUrl("SUPABASE_URL", true);
for (const name of ["RATE_LIMIT_SECRET", "CRON_SECRET"]) {
  if (process.env[name] && process.env[name].length < 32) {
    errors.push(`${name}: use a securely generated secret of at least 32 characters`);
  }
}
if (
  process.env.RATE_LIMIT_SECRET &&
  process.env.RATE_LIMIT_SECRET === process.env.CRON_SECRET
) {
  errors.push("RATE_LIMIT_SECRET and CRON_SECRET: use independent secrets");
}
if (process.env.EMAIL_PROVIDER !== "resend") {
  errors.push("EMAIL_PROVIDER: the installed production adapter is resend");
}
if (process.env.ACADEMY_TEST_FIXTURE) {
  errors.push("ACADEMY_TEST_FIXTURE: must be absent from production");
}
if (errors.length) {
  console.error("Launch configuration is incomplete:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Launch configuration checks passed. No credential values were printed.");
  console.log("Still verify live database access, admin login, email delivery and the scheduler.");
}
