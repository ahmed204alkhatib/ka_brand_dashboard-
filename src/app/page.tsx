'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [stats, setStats] = useState({ orders: 0, workshops: 0, pending: 0, shipping: 0, delivered: 0, review: 0 });
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // حالة البحث
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editOrderData, setEditOrderData] = useState<any>({});

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data: ordersData, count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      
      // تحديث الإحصائيات
      const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending');
      const { count: shippingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'shipping');
      const { count: deliveredCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'delivered');
      
      setStats({
        orders: ordersCount || 0,
        workshops: 0, // يمكنك تحديثها لاحقاً
        pending: pendingCount || 0,
        shipping: shippingCount || 0,
        delivered: deliveredCount || 0,
        review: 0,
      });
      setOrdersList(ordersData || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  useEffect(() => { fetchDashboardData(); }, []);

  const t = {
    ar: { title: 'KA Brand System', manageOrders: 'إدارة الطلبات', name: 'الاسم', phone: 'الهاتف', city: 'المدينة', amount: 'المبلغ', status: 'الحالة', service: 'الخدمة', notes: 'ملاحظات' },
    en: { title: 'KA Brand System', manageOrders: 'Manage Orders', name: 'Name', phone: 'Phone', city: 'City', amount: 'Amount', status: 'Status', service: 'Service', notes: 'Notes' }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="bg-slate-700 px-4 py-1 rounded">Language 🌐</button>
      </header>

      {/* شريط البحث */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex justify-between items-center">
        <h3 className="font-bold text-lg">{t.manageOrders}</h3>
        <input 
          type="text" 
          placeholder="بحث بالاسم أو الهاتف..." 
          className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white w-64"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* جدول الطلبات */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm text-center">
          <thead className="bg-slate-900 text-slate-400 uppercase">
            <tr>
              <th className="p-3">{t.name}</th><th className="p-3">{t.phone}</th><th className="p-3">{t.city}</th>
              <th className="p-3">{t.service}</th><th className="p-3">{t.notes}</th><th className="p-3">{t.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {ordersList
              .filter(o => (o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer_phone?.includes(searchQuery)))
              .map((order) => (
                <tr key={order.id} className="hover:bg-slate-700/30">
                  <td className="p-3">{order.customer_name}</td>
                  <td className="p-3">{order.customer_phone}</td>
                  <td className="p-3">{order.city}</td>
                  <td className="p-3 font-semibold text-emerald-400">{order.service_type || '-'}</td>
                  <td className="p-3 text-slate-400 truncate max-w-[150px]">{order.design_notes || '-'}</td>
                  <td className="p-3">{order.order_status}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}