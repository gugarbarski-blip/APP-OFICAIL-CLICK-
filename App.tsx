import React, { useState, useEffect } from 'react';
import { Plus, Settings, ClipboardList, Search, AlertTriangle, ExternalLink, CheckCircle, Clock, ListFilter } from 'lucide-react';
import { WorkOrder, WorkOrderFormData, FirebaseConfig } from './types';
import { subscribeToWorkOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder, isConfigured, saveConfig, clearConfig } from './services/firebase';
import { WorkOrderCard } from './components/WorkOrderCard';
import { WorkOrderForm } from './components/WorkOrderForm';
import { ConfigDialog } from './components/ConfigDialog';
import { Button } from './components/Button';

type FilterStatus = 'all' | 'pending' | 'completed';

const App: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  
  const [isConfigOpen, setIsConfigOpen] = useState(!isConfigured());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  // Load data logic
  useEffect(() => {
    if (!isConfigured()) {
        setLoading(false);
        return;
    }

    setPermissionError(false);

    const unsubscribe = subscribeToWorkOrders(
      (fetchedOrders) => {
        // Sort logic: 
        // 1. Incomplete first, Complete last
        // 2. Date ascending (Earliest first)
        const sorted = [...fetchedOrders].sort((a, b) => {
          if (a.concluida !== b.concluida) {
            return a.concluida ? 1 : -1;
          }
          return a.prazoLimite.localeCompare(b.prazoLimite);
        });
        setOrders(sorted);
        setLoading(false);
        setPermissionError(false);
      },
      (error) => {
        setLoading(false);
        if (error.code === 'permission-denied') {
          setPermissionError(true);
        }
      }
    );

    return () => unsubscribe();
  }, [isConfigOpen]); // Re-run if config changes

  // Filter logic
  useEffect(() => {
    let result = orders;

    // 1. Filter by Status
    if (filterStatus === 'pending') {
      result = result.filter(o => !o.concluida);
    } else if (filterStatus === 'completed') {
      result = result.filter(o => o.concluida);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(o => 
            o.numeroOs.toLowerCase().includes(lowerTerm) ||
            o.loja.toLowerCase().includes(lowerTerm) ||
            o.vendedor.toLowerCase().includes(lowerTerm)
        );
    }
    
    setFilteredOrders(result);
  }, [searchTerm, orders, filterStatus]);

  // Handlers
  const handleConfigSave = (config: FirebaseConfig) => {
    saveConfig(config);
    setIsConfigOpen(false);
    window.location.reload(); // Reload to initialize with new keys
  };

  const handleCreate = () => {
    setEditingOrder(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (order: WorkOrder) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: WorkOrderFormData) => {
    try {
      if (editingOrder) {
        await updateWorkOrder(editingOrder.id, data);
      } else {
        await addWorkOrder(data);
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      } else {
        alert("Erro ao salvar: " + error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkOrder(id);
    } catch (error: any) {
       if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
    }
  };

  const handleToggleStatus = async (order: WorkOrder) => {
    try {
      await updateWorkOrder(order.id, { concluida: !order.concluida });
    } catch (error: any) {
       if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
    }
  };

  const handleResetConfig = () => {
    if (window.confirm("Isso removerá a conexão com o banco de dados. Deseja continuar?")) {
        clearConfig();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Configuration Modal */}
      {isConfigOpen && <ConfigDialog onSave={handleConfigSave} />}

      {/* Form Modal */}
      <WorkOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingOrder}
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
                <ClipboardList size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">OS Master</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <Button onClick={handleCreate}>
              <Plus size={20} className="sm:mr-2" />
              <span className="hidden sm:inline">Nova OS</span>
            </Button>
            <button 
                onClick={handleResetConfig}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Configurações"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Permission Error Banner */}
        {permissionError && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-red-800">Acesso Negado (Firestore Permission Denied)</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p className="mb-2">O Firebase bloqueou o acesso aos dados. Isso acontece por causa das <strong>Regras de Segurança (Rules)</strong> ou porque a <strong>Autenticação Anônima</strong> não está ativada.</p>
                            
                            <p className="font-bold mt-2">Como corrigir:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Vá ao <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-medium hover:text-red-900">Firebase Console</a>.</li>
                                <li>No menu <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong>, ative o provedor <strong>"Anônimo" (Anonymous)</strong>.</li>
                                <li>OU no menu <strong>Firestore Database</strong> &rarr; <strong>Rules</strong>, altere as regras para teste:</li>
                            </ol>
                            <pre className="bg-red-100 p-2 rounded mt-2 text-xs font-mono border border-red-200">
{`allow read, write: if true;`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Stats Summary - Now Clickable for Filtering */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div 
              onClick={() => setFilterStatus('all')}
              className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'all' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
            >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">Total</p>
                  <ListFilter size={16} className="text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
            <div 
              onClick={() => setFilterStatus('pending')}
              className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'pending' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
            >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <Clock size={16} className="text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => !o.concluida).length}
                </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">Atrasadas</p>
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                    {orders.filter(o => !o.concluida && o.prazoLimite < new Date().toISOString().split('T')[0]).length}
                </p>
            </div>
            <div 
               onClick={() => setFilterStatus('completed')}
               className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'completed' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
            >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">Concluídas</p>
                  <CheckCircle size={16} className="text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.concluida).length}
                </p>
            </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="bg-gray-200 p-1 rounded-lg flex shrink-0 md:w-auto w-full">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${filterStatus === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${filterStatus === 'pending' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    Pendentes
                </button>
                <button
                    onClick={() => setFilterStatus('completed')}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${filterStatus === 'completed' ? 'bg-white text-green-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    Concluídas
                </button>
            </div>

             {/* Search Bar */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar por OS, Loja ou Vendedor..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* List */}
        {loading ? (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando ordens...</p>
            </div>
        ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhuma OS encontrada</h3>
                <p className="text-gray-500 mb-6">
                    {filterStatus === 'all' ? "Crie uma nova ordem de serviço para começar." : "Não há ordens com este status."}
                </p>
                {filterStatus === 'all' && <Button onClick={handleCreate} variant="secondary">Criar Agora</Button>}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                    <WorkOrderCard
                        key={order.id}
                        order={order}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                    />
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;