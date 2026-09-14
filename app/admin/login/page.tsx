import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { admin, configured } from "@/lib/db";
export default async function Page() {
  if (await admin()) redirect("/admin");
  return (
    <div className="container section">
      <AdminLogin enabled={configured()} />
    </div>
  );
}
