import { initializeFirebase } from '../../firebase';
const { firestore: db } = initializeFirebase();
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    OrderByDirection,
    orderBy,
    Timestamp,
    DocumentData,
    QueryConstraint
} from 'firebase/firestore';

// Collection references
export const collections = {
    users: 'users',
    projects: 'projects',
    tasks: 'tasks',
    attendance: 'attendance',
    daily_updates: 'daily_updates',
};

// Generic get all
export async function getAll<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    const ref = collection(db, collectionName);
    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

// Generic get by ID
export async function getById<T>(collectionName: string, id: string): Promise<T | null> {
    const ref = doc(db, collectionName, id);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as T;
    }
    return null;
}

// Generic add
export async function create<T extends DocumentData>(collectionName: string, data: Omit<T, 'id'>) {
    const ref = collection(db, collectionName);
    const docRef = await addDoc(ref, {
        ...data,
        createdAt: Date.now(),
    });
    return docRef.id;
}

// Generic update
export async function update(collectionName: string, id: string, data: Partial<DocumentData>) {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, {
        ...data,
        updatedAt: Date.now(),
    });
}

// Generic delete
export async function remove(collectionName: string, id: string) {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
}
