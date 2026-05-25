'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [stats, setStats] = useState({ orders: 0, workshops: 0, pending: 0, shipping: 0, delivered: 0, review: 0 });
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [workshopsList, setWorkshopsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات فتح وإغلاق فورمات الإضافة
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);

  // حقول التحكم بالتعديل الفوري (الأوردرات والمشاغل)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editOrderData, setEditOrderData] = useState<any>({});
  
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [editWorkshopData, setEditWorkshopData] = useState<any>({});

  // بيانات الأوردر الجديد
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    country: 'Jordan',
    city: 'Amman',
    full_address: '',
    total_amount: '',
    currency: 'JOD',
    order_status: 'pending'
  });

  // بيانات المشغل الجديد
  const [newWorkshop, setNewWorkshop] = useState({
  
    owner_name: '',
    phone_number: '',
    location_city: 'Amman'
  });

  // جلب البيانات الشاملة وتحديث الكروت
  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data: ordersData, count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      const { data: workshopsData, count: workshopsCount } = await supabase.from('workshops').select('*', { count: 'exact' }).order('created_at', { ascending: false });

      const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending');
      const { count: shippingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'shipping');
      const { count: deliveredCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'delivered');
      const { count: reviewCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'review');

      setStats({
        orders: ordersCount || 0,
        workshops: workshopsCount || 0,
        pending: pendingCount || 0,
        shipping: shippingCount || 0,
        delivered: deliveredCount || 0,
        review: reviewCount || 0,
      });
      setOrdersList(ordersData || []);
      setWorkshopsList(workshopsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- عمليات الطلبات (Orders) ---
  async function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        country: newOrder.country,
        city: newOrder.city,
        full_address: newOrder.full_address,
        total_amount: parseFloat(newOrder.total_amount) || 0,
        order_status: newOrder.order_status,
        currency: newOrder.currency
      }]);
      if (error) throw error;
      setNewOrder({ customer_name: '', customer_phone: '', country: 'Jordan', city: 'Amman', full_address: '', total_amount: '', currency: 'JOD', order_status: 'pending' });
      setShowAddForm(false);
      fetchDashboardData();
    } catch (error: any) { alert(error.message); }
  }

  function startEditOrder(order: any) {
    setEditingOrderId(order.id);
    setEditOrderData({ ...order });
  }

  async function handleSaveOrderUpdate(id: string) {
    try {
      const { error } = await supabase.from('orders').update({
        customer_name: editOrderData.customer_name,
        customer_phone: editOrderData.customer_phone,
        country: editOrderData.country,
        city: editOrderData.city,
        full_address: editOrderData.full_address,
        total_amount: parseFloat(editOrderData.total_amount) || 0,
        currency: editOrderData.currency,
        order_status: editOrderData.order_status
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

  // --- عمليات المشاغل (Workshops) ---
  async function handleAddWorkshop(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('workshops').insert([{
    
        owner_name: newWorkshop.owner_name,
        phone: newWorkshop.phone_number,
        location: newWorkshop.location_city
      }]);
      if (error) throw error;
      setNewWorkshop({ owner_name: '', phone_number: '', location_city: 'Amman' });
      setShowWorkshopForm(false);
      fetchDashboardData();
    } catch (error: any) { alert(error.message); }
  }

  function startEditWorkshop(workshop: any) {
    setEditingWorkshopId(workshop.id);
    setEditWorkshopData({ ...workshop });
  }

  async function handleSaveWorkshopUpdate(id: string) {
    try {
      const { error } = await supabase.from('workshops').update({
        name: editWorkshopData.name,
        owner_name: editWorkshopData.owner_name,
        phone: editWorkshopData.phone,
        location: editWorkshopData.location_city
      }).eq('id', id);

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
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-1.5 px-4 rounded-lg transition-colors text-xs">
            {lang === 'ar' ? 'English 🌐' : 'عربي 🌐'}
          </button>
          <span className="text-emerald-500 text-sm font-medium">🟢 {t.connected}</span>
        </div>
      </header>

      {/* كروت الإحصائيات الستة العليا */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-xs text-slate-400 uppercase font-medium">{t.totalOrders}</p>
          <p className="text-3xl font-extrabold text-white mt-1">{loading ? '...' : stats.orders}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-xs text-slate-400 uppercase font-medium">{t.pendingOrders}</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{loading ? '...' : stats.pending}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-xs text-slate-400 uppercase font-medium">{t.workshops}</p>
          <p className="text-3xl font-extrabold text-sky-400 mt-1">{loading ? '...' : stats.workshops}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-xs text-slate-400 uppercase font-medium">{t.shippingOrders}</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">{loading ? '...' : stats.shipping}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-xs text-slate-400 uppercase font-medium">{t.deliveredOrders}</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{loading ? '...' : stats.delivered}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-xs text-slate-400 uppercase font-medium">{t.reviewOrders}</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-1">{loading ? '...' : stats.review}</p>
        </div>
      </div>

      {/* أزرار الإضافة */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <button onClick={() => { setShowAddForm(!showAddForm); setShowWorkshopForm(false); }} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-lg">
          {showAddForm ? t.cancel : t.addOrderBtn}
        </button>
        <button onClick={() => { setShowWorkshopForm(!showWorkshopForm); setShowAddForm(false); }} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-lg">
          {showWorkshopForm ? t.cancel : t.addWorkshopBtn}
        </button>
      </div>

      {/* فورم إضافة طلب جديد */}
      {showAddForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-8">
          <form onSubmit={handleAddOrder} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.name} *</label>
              <input type="text" placeholder={t.name} value={newOrder.customer_name} onChange={e => setNewOrder({...newOrder, customer_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.phone} *</label>
              <input type="text" placeholder={t.phone} value={newOrder.customer_phone} onChange={e => setNewOrder({...newOrder, customer_phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.country}</label>
              <input type="text" placeholder={t.country} value={newOrder.country} onChange={e => setNewOrder({...newOrder, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.city}</label>
              <input type="text" placeholder={t.city} value={newOrder.city} onChange={e => setNewOrder({...newOrder, city: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.amount} *</label>
              <input type="number" step="0.01" placeholder={t.amount} value={newOrder.total_amount} onChange={e => setNewOrder({...newOrder, total_amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.currency}</label>
              <select value={newOrder.currency} onChange={e => setNewOrder({...newOrder, currency: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                <option value="JOD">JOD</option><option value="USD">USD</option><option value="AED">AED</option><option value="SAR">SAR</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.status}</label>
              <select value={newOrder.order_status} onChange={e => setNewOrder({...newOrder, order_status: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                <option value="pending">Pending</option><option value="shipping">Shipping</option><option value="delivered">Delivered</option><option value="review">Review</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs text-slate-400 block mb-1">{t.address}</label>
              <input type="text" placeholder={t.address} value={newOrder.full_address} onChange={e => setNewOrder({...newOrder, full_address: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-sm p-2.5 md:col-span-4 transition-colors">{t.save}</button>
          </form>
        </div>
      )}

      {/* فورم إضافة مشغل جديد */}
      {showWorkshopForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-8">
          <form onSubmit={handleAddWorkshop} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.wOwner}</label>
              <input type="text" placeholder={t.wOwner} value={newWorkshop.owner_name} onChange={e => setNewWorkshop({...newWorkshop, owner_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.phone} *</label>
              <input type="text" placeholder={t.phone} value={newWorkshop.phone_number} onChange={e => setNewWorkshop({...newWorkshop, phone_number: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-sky-500" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.wLoc}</label>
              <input type="text" placeholder={t.wLoc} value={newWorkshop.location_city} onChange={e => setNewWorkshop({...newWorkshop, location_city: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-sky-500" />
            </div>
            <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-sm p-2.5 md:col-span-4 transition-colors">{t.saveW}</button>
          </form>
        </div>
      )}

      {/* قسم الجداول */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. جدول الطلبات مع التعديل الفوري بالسطر */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <h3 className="font-bold text-white text-lg">{t.manageOrders}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">{t.name}</th><th className="p-3">{t.phone}</th><th className="p-3">{t.city}</th>
                  <th className="p-3">{t.address}</th><th className="p-3">{t.amount}</th><th className="p-3">{t.status}</th>
                  <th className="p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {ordersList.map((order) => {
                  const isEditing = editingOrderId === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                      {isEditing ? (
                        <>
                          <td className="p-2"><input type="text" value={editOrderData.customer_name} onChange={e => setEditOrderData({...editOrderData, customer_name: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2"><input type="text" value={editOrderData.customer_phone} onChange={e => setEditOrderData({...editOrderData, customer_phone: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2"><input type="text" value={editOrderData.city} onChange={e => setEditOrderData({...editOrderData, city: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2"><input type="text" value={editOrderData.full_address} onChange={e => setEditOrderData({...editOrderData, full_address: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2 flex gap-1 justify-center items-center">
                            <input type="number" value={editOrderData.total_amount} onChange={e => setEditOrderData({...editOrderData, total_amount: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-16 border border-slate-600" />
                            <select value={editOrderData.currency} onChange={e => setEditOrderData({...editOrderData, currency: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs border border-slate-600">
                              <option value="JOD">JOD</option><option value="USD">USD</option><option value="AED">AED</option><option value="SAR">SAR</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <select value={editOrderData.order_status} onChange={e => setEditOrderData({...editOrderData, order_status: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs border border-slate-600">
                              <option value="pending">Pending</option><option value="shipping">Shipping</option><option value="delivered">Delivered</option><option value="review">Review</option>
                            </select>
                          </td>
                          <td className="p-2 flex gap-2 justify-center">
                            <button onClick={() => handleSaveOrderUpdate(order.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2 py-1 rounded">حفظ 💾</button>
                            <button onClick={() => setEditingOrderId(null)} className="bg-slate-600 hover:bg-slate-500 text-white text-xs px-2 py-1 rounded">إلغاء ❌</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-bold text-white">{order.customer_name}</td>
                          <td className="p-3">{order.customer_phone}</td>
                          <td className="p-3">{order.city}</td>
                          <td className="p-3 text-slate-400 text-xs">{order.full_address || '—'}</td>
                          <td className="p-3 text-emerald-400 font-bold">{order.total_amount} {order.currency}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.order_status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              order.order_status === 'shipping' ? 'bg-indigo-500/20 text-indigo-400' :
                              order.order_status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>{order.order_status}</span>
                          </td>
                          <td className="p-3 flex gap-2 justify-center">
                            <button onClick={() => startEditOrder(order)} className="bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 rounded py-1 px-2 text-xs">تعديل ✏️</button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded py-1 px-2 text-xs">حذف ❌</button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. جدول إدارة المشاغل والورش مع التعديل الفوري */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <h3 className="font-bold text-white text-lg">{t.manageWorkshops}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">{t.wName}</th><th className="p-3">{t.wOwner}</th><th className="p-3">{t.phone}</th><th className="p-3">{t.wLoc}</th><th className="p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {workshopsList.map((workshop) => {
                  const isEditingW = editingWorkshopId === workshop.id;
                  return (
                    <tr key={workshop.id} className="hover:bg-slate-700/30 transition-colors">
                      {isEditingW ? (
                        <>
                          <td className="p-2"><input type="text" value={editWorkshopData.name} onChange={e => setEditWorkshopData({...editWorkshopData, name: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2"><input type="text" value={editWorkshopData.owner_name} onChange={e => setEditWorkshopData({...editWorkshopData, owner_name: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2"><input type="text" value={editWorkshopData.phone} onChange={e => setEditWorkshopData({...editWorkshopData, phone: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2"><input type="text" value={editWorkshopData.location_city} onChange={e => setEditWorkshopData({...editWorkshopData, location: e.target.value})} className="bg-slate-900 text-white p-1 rounded text-xs w-full border border-slate-600" /></td>
                          <td className="p-2 flex gap-2 justify-center">
                            <button onClick={() => handleSaveWorkshopUpdate(workshop.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2 py-1 rounded">حفظ 💾</button>
                            <button onClick={() => setEditingWorkshopId(null)} className="bg-slate-600 hover:bg-slate-500 text-white text-xs px-2 py-1 rounded">إلغاء ❌</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-bold text-white">{workshop.name}</td>
                          <td className="p-3 text-slate-300">{workshop.owner_name || '—'}</td>
                          <td className="p-3 text-sky-400 font-mono">{workshop.phone}</td>
                          <td className="p-3">{workshop.location || '—'}</td>
                          <td className="p-3 flex gap-2 justify-center">
                            <button onClick={() => startEditWorkshop(workshop)} className="bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 rounded py-1 px-2 text-xs">تعديل ✏️</button>
                            <button onClick={() => handleDeleteWorkshop(workshop.id)} className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded py-1 px-2 text-xs">حذف ❌</button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}