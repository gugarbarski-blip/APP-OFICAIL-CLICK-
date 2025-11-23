import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, Firestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, FirestoreError } from 'firebase/firestore';
import { FirebaseConfig, WorkOrder } from '../types';

const STORAGE_KEY = 'os_master_firebase_config';

// State to hold the initialized app instance
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export const getStoredConfig = (): FirebaseConfig | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveConfig = (config: FirebaseConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  initializeFirebase(config);
};

export const clearConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

export const initializeFirebase = (config: FirebaseConfig) => {
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  
  // Initialize Auth and attempt anonymous sign-in
  // This is required for rules that are set to "allow read, write: if request.auth != null;"
  const auth = getAuth(app);
  signInAnonymously(auth).catch((err) => {
    console.warn("Autenticação anônima falhou. Verifique se o provedor 'Anônimo' está ativado no Firebase Console -> Authentication.", err);
  });

  db = getFirestore(app);
  return db;
};

// Initialize on load if config exists
const storedConfig = getStoredConfig();
if (storedConfig) {
  initializeFirebase(storedConfig);
}

// Data Services

export const subscribeToWorkOrders = (
  onData: (orders: WorkOrder[]) => void, 
  onError?: (error: FirestoreError) => void
) => {
  if (!db) return () => {};

  const q = query(collection(db, 'workOrders'));
  
  return onSnapshot(q, 
    (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkOrder[];
      onData(orders);
    },
    (error) => {
      console.error("Erro no Firestore:", error);
      if (onError) onError(error);
    }
  );
};

export const addWorkOrder = async (data: Omit<WorkOrder, 'id' | 'createdAt' | 'concluida'>) => {
  if (!db) throw new Error("Database not initialized");
  await addDoc(collection(db, 'workOrders'), {
    ...data,
    concluida: false,
    createdAt: Date.now()
  });
};

export const updateWorkOrder = async (id: string, data: Partial<WorkOrder>) => {
  if (!db) throw new Error("Database not initialized");
  const docRef = doc(db, 'workOrders', id);
  await updateDoc(docRef, data);
};

export const deleteWorkOrder = async (id: string) => {
  if (!db) throw new Error("Database not initialized");
  const docRef = doc(db, 'workOrders', id);
  await deleteDoc(docRef);
};

export const isConfigured = () => !!db;