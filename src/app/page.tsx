'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const t = {
    ar: { manageOrders: 'إدارة الطلبات الحالية' },
    en: { manageOrders: 'Manage Current Orders' }
  }[lang];

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setOrdersList(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      {/* قسم الجدول */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-white text-lg">{t.manageOrders}</h3>
          <input 
            type="text" 
            placeholder="بحث..." 
            className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white w-40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="p-3">الاسم</th>
                <th className="p-3">الخدمة</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {ordersList && ordersList
                .filter((o: any) => o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-700/30">
                    <td className="p-3">{order.customer_name}</td>
                    <td className="p-3 text-emerald-400 font-bold">{order.service_type || 'سادة'}</td>
                    <td className="p-3">{order.total_amount}</td>
                    <td className="p-3">{order.order_status}</td>
                    <td className="p-3 text-slate-400">{order.design_notes || '-'}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}