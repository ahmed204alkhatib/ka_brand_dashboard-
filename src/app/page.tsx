<div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">{t.manageOrders}</h3>
            <input 
              type="text" 
              placeholder="بحث..." 
              className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white w-40"
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
                {ordersList
                  .filter(o => o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-slate-700/30">
                      <td className="p-3 font-medium">{order.customer_name}</td>
                      <td className="p-3 text-emerald-400 font-bold">{order.service_type || 'سادة'}</td>
                      <td className="p-3">{order.total_amount} {order.currency}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded bg-slate-700">{order.order_status}</span>
                      </td>
                      <td className="p-3 text-slate-400 max-w-[150px] truncate">{order.design_notes || '-'}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>