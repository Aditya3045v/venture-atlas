import { redirect } from 'next/navigation';

export default function MFAChallengePage() {
  redirect('/admin');
}

