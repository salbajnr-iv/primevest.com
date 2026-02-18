import { redirect } from 'next/navigation'

export default function AdminSignInRedirectPage() {
  // Redirect to the actual admin sign-in page
  redirect('/admin/auth/signin')
}

