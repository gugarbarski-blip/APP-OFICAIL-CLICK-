export interface WorkOrder {
  id: string;
  numeroOs: string;
  loja: string;
  vendedor: string;
  prazoLimite: string; // Format: YYYY-MM-DD
  metodoEntrega: 'Retirar na Sede' | 'Entrega na Loja';
  concluida: boolean;
  createdAt: number;
}

export type WorkOrderFormData = Omit<WorkOrder, 'id' | 'concluida' | 'createdAt'>;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
