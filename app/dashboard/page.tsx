import { redirect } from "next/navigation";
import DashboardClient from "@/app/dashboard/DashboardClient";
import { getDashboardData } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
  }

  const dashboardData = await getDashboardData(supabase);

  return <DashboardClient initialData={dashboardData} />;
}
