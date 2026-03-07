import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export default function AdminSignInRedirectPage() {
  // Redirect to the actual admin sign-in page
  redirect('/admin/auth/signin')
}

