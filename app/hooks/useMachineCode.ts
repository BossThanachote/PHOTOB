import { useState, useEffect } from 'react';

export const useMachineCode = () => {
  const [machineCode, setMachineCode] = useState<string>('');

  useEffect(() => {
    const savedMachineCode = localStorage.getItem('selectedMachineCode');
    if (savedMachineCode) {
      setMachineCode(savedMachineCode);
    }
  }, []);

  return machineCode;
};