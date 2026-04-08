import { supabase } from '@/app/lib/supabase';

export const machineService = {
  getMachines: async () => {
    const { data, error } = await supabase
      .from('machine') 
      .select('*')
      .order('last_active', { ascending: false });

    if (error) throw error;
    return data;
  },

  // สร้างตู้ใหม่
  createMachine: async (name: string, location: string) => {
    const { data, error } = await supabase
      .from('machine')
      .insert([{ name, location, status: 'offline' }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // อัปเดตสถานะตู้
  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('machine')
      .update({ status, last_active: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // ลบตู้
  deleteMachine: async (id: string) => {
    const { error } = await supabase
      .from('machine')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};