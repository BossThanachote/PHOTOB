import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import machineService from '../services/machineService';
import { Loader2, Search } from 'lucide-react';
import { StatusType } from '@/types/types';

interface MachineData {
  id: string;
  code: string;
  name: string;
  status: StatusType;
}

export default function MachineDashboard() {
  const router = useRouter();
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  const getMachineNameFromStorage = (machineId: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`machine_name_${machineId}`);
  };

  // Fetch machines and filter for active ones
  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const data = await machineService.getTransactions();
      // Filter only active machines
      const activeMachines = data
        .filter(machine => machine.status.toLowerCase() === 'active')
        .map(machine => ({
          ...machine,
          name: getMachineNameFromStorage(machine.id) || machine.name
        }));
      setMachines(activeMachines);
      setError(null);
    } catch (err) {
      console.error('Failed to load machines:', err);
      setError(err instanceof Error ? err.message : 'Failed to load machines');
    } finally {
      setIsLoading(false);
    }
  };

  // Load selected machine from localStorage on mount
  useEffect(() => {
    // เปลี่ยนจาก selectedMachineCode เป็น selectedMachineId
    const savedMachineId = localStorage.getItem('selectedMachineId');
    if (savedMachineId) {
      setSelectedMachine(savedMachineId);
    }
    fetchMachines();
  }, []);

  // Filter machines based on search term
  const filteredMachines = machines.filter(machine =>
    machine.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (machine: MachineData) => {
    setSelectedMachine(machine.id);
    // เก็บข้อมูลใน localStorage
    localStorage.setItem('selectedMachineId', machine.id);
    localStorage.setItem('selectedMachineCode', machine.code);
    localStorage.setItem('selectedMachineName', machine.name);
    
  
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchMachines}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredMachines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-medium">Code: {machine.code}</div>
              {machine.name && <div className="text-gray-600 mt-1">{machine.name}</div>}
            </div>
            <button
              onClick={() => handleSelect(machine)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedMachine === machine.id  // เปลี่ยนจาก machine.code เป็น machine.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {selectedMachine === machine.id ? 'Selected' : 'Select'}  {/* เปลี่ยนตรงนี้ด้วย */}
            </button>
          </div>
        ))}

        {filteredMachines.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg border">
            <p className="text-gray-500">
              {searchTerm ? 'No matching machines found' : 'No active machines available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}