import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Authentication has been removed. Redirect to the main dashboard.
  redirect('/dashboard');
}
