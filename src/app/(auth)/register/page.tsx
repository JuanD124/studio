import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Authentication has been removed. Redirect to the main dashboard.
  redirect('/dashboard');
}
