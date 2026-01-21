'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

function PermissionErrorToast({ error }: { error: FirestorePermissionError }) {
  const deniedRequest = error.context;

  return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      <p className="font-bold">Firestore Permission Denied</p>
      <p>Your request was denied by Firestore Security Rules.</p>
      <pre className="mt-2 p-2 bg-red-50 text-sm rounded overflow-auto">
        <code>{JSON.stringify(deniedRequest, null, 2)}</code>
      </pre>
    </div>
  );
}


export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Caught Firestore Permission Error:", error.toString());
      toast({
        variant: 'destructive',
        duration: 10000,
        title: "Firestore Permission Denied",
        description: <PermissionErrorToast error={error} />,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
