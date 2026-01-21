'use client';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// this is a browser only component
// we get the initialized firebase app
// and pass it to the provider
const firebaseApp = initializeFirebase();

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider {...firebaseApp}>{children}</FirebaseProvider>;
}
