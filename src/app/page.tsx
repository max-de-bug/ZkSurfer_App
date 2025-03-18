import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
  // This is just a fallback and will never be rendered
  return null;
}