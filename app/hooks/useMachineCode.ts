import { useState, useEffect } from 'react';

export const useMachineCode = () => {
  const [machineCode, setMachineCode] = useState<string>('');

  useEffect(() => {
    // Get the machine code from localStorage when component mounts
    const savedMachineCode = localStorage.getItem('selectedMachineCode');
    if (savedMachineCode) {
      setMachineCode(savedMachineCode);
    }
  }, []);

  return machineCode;
};