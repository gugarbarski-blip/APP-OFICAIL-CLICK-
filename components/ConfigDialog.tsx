import React, { useState } from 'react';
import { FirebaseConfig } from '../types';
import { Button } from './Button';
import { Save, AlertTriangle } from 'lucide-react';

interface ConfigDialogProps {
  onSave: (config: FirebaseConfig) => void;
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({ onSave }) => {
  const [jsonConfig, setJsonConfig] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      // Allow user to paste just the object or the variable declaration
      let cleanString = jsonConfig;
      if (cleanString.includes('const firebaseConfig =')) {
        const match = cleanString.match(/const firebaseConfig = ({[\s\S]*?});/);
        if (match) cleanString = match[1];
      }

      // Fix unquoted keys if necessary (simple regex approach) or assume valid JSON
      // To be safe, we ask for valid JSON, but let's try to parse
      const config = JSON.parse(cleanString) as FirebaseConfig;
      
      if (!config.apiKey || !config.projectId) {
        throw new Error("Configuração inválida. Faltam campos obrigatórios.");
      }

      onSave(config);
    } catch (e) {
      setError('JSON inválido. Certifique-se de copiar o objeto de configuração corretamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <AlertTriangle size={32} />
          <h2 className="text-xl font-bold text-gray-900">Configuração Necessária</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Para utilizar este aplicativo, você precisa conectar seu projeto <strong>Firebase Firestore</strong>.
          Cole abaixo o objeto <code>firebaseConfig</code> do seu console Firebase.
        </p>

        <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-mono">Exemplo de formato esperado (JSON):</p>
          <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
{`{
  "apiKey": "AIzaSy...",
  "authDomain": "seu-app.firebaseapp.com",
  "projectId": "seu-app",
  "storageBucket": "seu-app.appspot.com",
  "messagingSenderId": "123456...",
  "appId": "1:123456..."
}`}
          </pre>
        </div>

        <textarea
          value={jsonConfig}
          onChange={(e) => {
            setJsonConfig(e.target.value);
            setError('');
          }}
          placeholder="Cole seu JSON de configuração aqui..."
          className="w-full h-40 font-mono text-sm border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 mb-2"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} disabled={!jsonConfig.trim()}>
            <Save size={18} className="mr-2" />
            Salvar e Conectar
          </Button>
        </div>
      </div>
    </div>
  );
};
