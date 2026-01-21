'use client';

import { useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, onIdTokenChanged, getIdTokenResult, IdTokenResult } from 'firebase/auth';
import { useAuth, useFirebaseApp } from '../provider';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export interface UseUser {
  user: User | null;
  claims: IdTokenResult['claims'] | null;
  loading: boolean;
}

export function useUser(): UseUser {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [claims, setClaims] = useState<IdTokenResult['claims'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const idTokenResult = await getIdTokenResult(user);
        setClaims(idTokenResult.claims);
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await getIdTokenResult(user);
        setClaims(idTokenResult.claims);
      } else {
        setClaims(null);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, [auth]);

  return useMemo(() => ({ user, claims, loading }), [user, claims, loading]);
}

export function useUserDoc<T>(userId: string | undefined) {
    const app = useFirebaseApp();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!app || !userId) {
            setLoading(false);
            return;
        }
        const db = getFirestore(app);
        const docRef = doc(db, 'users', userId);

        const getDocument = async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() } as T);
                } else {
                    setData(null);
                }
            } catch (e: any) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        getDocument();
    }, [app, userId]);

    return { data, loading, error };
}
