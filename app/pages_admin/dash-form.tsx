'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; 
import { Loader2, Search } from 'lucide-react';

interface MachineData {
  id: string;
  name: string;
  status: string;
  location?: string;
}

export default function MachineDashboard() {
  const router = useRouter();
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // Fetch machines จาก Supabase
  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ดึงข้อมูลจากตาราง machine (ตัวเล็กตามใน DB)
      const { data, error: sbError } = await supabase
        .from('machine')
        .select('*')
        .order('name', { ascending: true });

      if (sbError) throw sbError;

      setMachines(data || []);
    } catch (err) {
      console.error('Failed to load machines:', err);
      setError(err instanceof Error ? err.message : 'Failed to load machines');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedMachineId = localStorage.getItem('selectedMachineId');
    if (savedMachineId) {
      setSelectedMachine(savedMachineId);
    }
    fetchMachines();
  }, []);

  // Filter ตามชื่อ หรือ สถานที่
  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (machine.location && machine.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (machine: MachineData) => {
    setSelectedMachine(machine.id);
    localStorage.setItem('selectedMachineId', machine.id);
    localStorage.setItem('selectedMachineName', machine.name);
    // ถ้า Boss อยากให้เลือกเสร็จแล้วไปหน้าอื่นต่อ ใส่ router.push ตรงนี้ได้เลย
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#9B1C27]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-red-600 font-bold mb-4">Error: {error}</p>
          <button 
            onClick={fetchMachines}
            className="bg-[#9B1C27] text-white px-6 py-2 rounded-xl hover:bg-[#8B1922] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-ibm-thai">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">เลือกตู้ Photobooth</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่อตู้ หรือ สถานที่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-[#9B1C27] outline-none transition-all"
          />
        </div>

        <div className="grid gap-4">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className={`p-5 rounded-2xl border-2 bg-white flex justify-between items-center transition-all ${
                selectedMachine === machine.id ? 'border-[#9B1C27] shadow-md' : 'border-transparent shadow-sm'
              }`}
            >
              <div>
                <div className="font-bold text-lg text-gray-800">{machine.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${machine.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-sm text-gray-500 uppercase">{machine.status}</span>
                  {machine.location && <span className="text-sm text-gray-400">| {machine.location}</span>}
                </div>
              </div>
              
              <button
                onClick={() => handleSelect(machine)}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  selectedMachine === machine.id 
                    ? 'bg-[#9B1C27] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {selectedMachine === machine.id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}

          {filteredMachines.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed">
              <p className="text-gray-400">ไม่พบตู้ที่กำลังค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}