'use client';

import { useState, useEffect, useMemo } from 'react';
import type { DocumentReference, DocumentData, FirestoreError, DocumentSnapshot } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export interface UseDoc<T> {
  loading: boolean;
  data: (T & { id: string }) | null;
  error: FirestoreError | null;
}

export function useDoc<T>(docRef: DocumentReference<DocumentData> | null): UseDoc<T> {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (doc: DocumentSnapshot) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T & { id: string });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error(`Error fetching document:`, err);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return useMemo(() => ({ loading, data, error }), [loading, data, error]);
}
