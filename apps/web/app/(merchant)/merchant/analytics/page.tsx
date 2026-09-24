import { redirect } from 'next/navigation'

// Analytics has been merged into the Dashboard (Overview) page
export default function AnalyticsRedirectPage() {
  redirect('/merchant/overview')
}
