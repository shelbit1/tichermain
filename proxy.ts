export { auth as proxy } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/essay/:path*", "/onboarding/:path*", "/subscription/:path*"],
}
