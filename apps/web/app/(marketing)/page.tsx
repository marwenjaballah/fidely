import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { HomePageContent } from "@/features/site/components/HomePageContent"

export default async function HomePage() {
  const cookieStore = await cookies()
  const role = cookieStore.get("user_role")?.value

  if (role) {
    switch (role) {
      case "SUPER_ADMIN":
        redirect("/admin/overview")
      case "MERCHANT":
        redirect("/merchant/overview")
      case "CASHIER":
        redirect("/cashier")
      case "CUSTOMER":
      case "USER":
      default:
        redirect("/customer/overview")
    }
  }

  return <HomePageContent />
}

