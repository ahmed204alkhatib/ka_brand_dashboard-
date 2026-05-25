'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [stats, setStats] = useState({ orders: 0, workshops: 0, pending: 0, shipping: 0, delivered: 0, review: 0 });
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [workshopsList, setWorkshopsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // -- الإضافة الأولى: تعريف حالة البحث --
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editOrderData, setEditOrderData] = useState<any>({});
  
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [editWorkshopData, setEditWorkshopData] = useState<any>({});

  const [newOrder, setNewOrder] = useState({
    customer_name: '', customer_phone: '', country: 'Jordan', city: 'Amman', full_address: '', total_amount: '', currency: 'JOD', order_status: 'pending'
  });

  const [newWorkshop, setNewWorkshop] = useState({ owner_name: '', phone_number: '', location_city: 'Amman' });

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data: ordersData, count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      const { data: workshopsData, count: workshopsCount } = await supabase.from('workshops').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending');
      const { count: shippingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'shipping');
      const { count: deliveredCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'delivered');
      const { count: reviewCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'review');

      setStats({ orders: ordersCount || 0, workshops: workshopsCount || 0, pending: pendingCount || 0, shipping: shippingCount || 0, delivered: deliveredCount || 0, review: reviewCount || 0 });
      setOrdersList(ordersData || []);
      setWorkshopsList(workshopsData || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  useEffect(() => { fetchDashboardData(); }, []);

  async function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: newOrder.customer_name, customer_phone: newOrder.customer_phone, country: newOrder.country, city: newOrder.city, full_address: newOrder.full_address, total_amount: parseFloat(newOrder.total_amount) || 0, order_status: newOrder.order_status, currency: newOrder.currency
      }]);
      if (error) throw error;
      setNewOrder({ customer_name: '', customer_phone: '', country: 'Jordan', city: 'Amman', full_address: '', total_amount: '', currency: 'JOD', order_status: 'pending' });
      setShowAddForm(false);
      fetchDashboardData();
    } catch (error: any) { alert(error.message); }
  }

  function startEditOrder(order: any) { setEditingOrderId(order.id); setEditOrderData({ ...order }); }

  async function handleSaveOrderUpdate(id: string) {
    try {
      const { error } = await supabase.from('orders').update({
        customer_name: editOrderData.customer_name, customer_phone: editOrderData.customer_phone, country: editOrderData.country, city: editOrderData.city, full_address: editOrderData.full_address, total_amount: parseFloat(editOrderData.total_amount) || 0, currency: editOrderData.currency, order_status: editOrderData.order_status
      }).eq('id', id);
      if (error) throw error;
      setEditingOrderId(null);
      fetchDashboardData();
    } catch (error: any) { alert(error.message); }
  }

  async function handleDeleteOrder(id: string) {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
    await supabase.from('orders').delete().eq('id', id);
    fetchDashboardData();
  }

  async function handleAddWorkshop(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('workshops').insert([{ owner_name: newWorkshop.owner_name, phone: newWorkshop.phone_number, location: newWorkshop.location_city }]);
      if (error) throw error;
      setNewWorkshop({ owner_name: '', phone_number: '', location_city: 'Amman' });
      setShowWorkshopForm(false);
      fetchDashboardData();
    } catch (error: any) { alert(error.message); }
  }

  function startEditWorkshop(workshop: any) { setEditingWorkshopId(workshop.id); setEditWorkshopData({ ...workshop }); }

  async function handleSaveWorkshopUpdate(id: string) {
    try {
      const { error } = await supabase.from('workshops').update({ owner_name: editWorkshopData.owner_name, phone: editWorkshopData.phone, location: editWorkshopData.location_city }).eq('id', id);
      if (error) throw error;
      setEditingWorkshopId(null);
      fetchDashboardData();
    } catch (error: any) { alert(error.message); }
  }

  async function handleDeleteWorkshop(id: string) {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
    await supabase.from('workshops').delete().eq('id', id);
    fetchDashboardData();
  }

  const t = {
    ar: { title: 'KA Brand System', subtitle: 'لوحة التحكم المركزية لإدارة الإنتاج والمشاغل', connected: 'متصل', totalOrders: 'إجمالي الطلبات', pendingOrders: 'قيد التنفيذ', workshops: 'المشاغل', shippingOrders: 'بالشحن', deliveredOrders: 'وصلت', reviewOrders: 'مراجعة', addOrderBtn: 'إضافة طلب جديد ➕', addWorkshopBtn: 'إضافة مشغل جديد 🏭', name: 'الاسم', phone: 'الهاتف', country: 'الدولة', city: 'المدينة', address: 'العنوان بالتفصيل', amount: 'المبلغ', currency: 'العملة', status: 'الحالة', save: 'حفظ الطلب', cancel: 'إلغاء', wName: 'اسم المشغل', wOwner: 'اسم صاحب المشغل', wLoc: 'الموقع', saveW: 'حفظ المشغل', manageOrders: 'إدارة الطلبات الحالية', manageWorkshops: 'إدارة المشاغل والورش' },
    en: { title: 'KA Brand System', subtitle: 'Central Production & Workshop Dashboard', connected: 'Connected', totalOrders: 'Total Orders', pendingOrders: 'Pending', workshops: 'Workshops', shippingOrders: 'Shipping', deliveredOrders: 'Delivered', reviewOrders: 'Review', addOrderBtn: 'Add Order ➕', addWorkshopBtn: 'Add Workshop 🏭', name: 'Name', phone: 'Phone', country: 'Country', city: 'City', address: 'Full Address', amount: 'Amount', currency: 'Currency', status: 'Status', save: 'Save Order', cancel: 'Cancel', wName: 'Workshop Name', wOwner: 'Owner Name', wLoc: 'Location', saveW: 'Save Workshop', manageOrders: 'Manage Current Orders', manageWorkshops: 'Manage Workshops' }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ... (بقية الكود الخاص بك كما هو) ... */}
      
      {/* قسم الجداول */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">{t.manageOrders}</h3>
            {/* -- الإضافة الثانية: خانة البحث -- */}
            <input type="text" placeholder="بحث..." className="bg-slate-900 border border-slate-700 rounded p-1 text-sm w-32" onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">{t.name}</th><th className="p-3">{t.phone}</th><th className="p-3">الخدمة</th><th className="p-3">ملاحظات</th><th className="p-3">{t.status}</th><th className="p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {/* -- الإضافة الثالثة: الفلتر -- */}
                {ordersList.filter((o: any) => o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/30">
                    <td className="p-3">{order.customer_name}</td>
                    <td className="p-3">{order.customer_phone}</td>
                    <td className="p-3 text-emerald-400 font-bold">{order.service_type || 'سادة'}</td>
                    <td className="p-3 text-slate-400 truncate max-w-[100px]">{order.design_notes || '-'}</td>
                    <td className="p-3">{order.order_status}</td>
                    <td className="p-3"><button onClick={() => startEditOrder(order)} className="text-sky-400">تعديل</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}