import React, { useState } from 'react';
import { FamilyData, Bill, BillCategory } from '../../types/family';
import { triggerConfetti } from '../../utils/confetti';
import { 
  Receipt, 
  Plus, 
  Check, 
  Trash2, 
  AlertCircle, 
  Coins, 
  PieChart, 
  CheckCircle2 
} from 'lucide-react';

interface BillsViewProps {
  data: FamilyData;
  onUpdateData: (newData: FamilyData) => void;
}

const CATEGORIES: BillCategory[] = [
  'Servicios',
  'Vivienda',
  'Suscripciones',
  'Educación',
  'Seguros',
  'Otros',
];

export const BillsView: React.FC<BillsViewProps> = ({ data, onUpdateData }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BillCategory>('Servicios');
  const [amount, setAmount] = useState('');
  const [dueDateDay, setDueDateDay] = useState<number>(10);
  const [notes, setNotes] = useState('');

  // Calculations
  const totalMonthly = data.bills.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingBills = data.bills.filter((b) => b.status === 'Pendiente');
  const pendingTotal = pendingBills.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const paidTotal = totalMonthly - pendingTotal;

  const handleToggleStatus = (billId: string) => {
    const updated = data.bills.map((b) => {
      if (b.id === billId) {
        const isNowPaid = b.status === 'Pendiente';
        if (isNowPaid) triggerConfetti();
        return {
          ...b,
          status: isNowPaid ? ('Pagado' as const) : ('Pendiente' as const),
        };
      }
      return b;
    });

    onUpdateData({ ...data, bills: updated });
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newBill: Bill = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      category,
      amount: parseFloat(amount) || 0,
      dueDateDay: Number(dueDateDay) || 1,
      status: 'Pendiente',
      notes: notes.trim() || undefined,
    };

    onUpdateData({
      ...data,
      bills: [...data.bills, newBill],
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setShowAddModal(false);
    triggerConfetti();
  };

  const handleDeleteBill = (billId: string) => {
    const updated = data.bills.filter((b) => b.id !== billId);
    onUpdateData({ ...data, bills: updated });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-2 text-amber-300">
            <Receipt className="w-3.5 h-3.5" /> Economía Doméstica
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Gastos y Facturas Recurrentes</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Control de los recibos de la luz, agua, colegio, suscripciones y gastos fijos del mes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-400 text-slate-900 font-bold text-xs hover:bg-amber-300 transition flex items-center gap-2 shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-900" /> Añadir Recibo / Gasto
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gasto Mensual Estimado</span>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalMonthly.toFixed(2)} €</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pendiente de Pago ({pendingBills.length})</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{pendingTotal.toFixed(2)} €</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ya Pagado Este Mes</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{paidTotal.toFixed(2)} €</div>
          </div>
        </div>

      </div>

      {/* Bills List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-500" /> Lista de Recibos y Facturas
          </h3>
          <span className="text-xs text-slate-400">Haz clic en el recuadro para marcar como pagado</span>
        </div>

        <div className="space-y-3">
          {data.bills.map((bill) => {
            const isPaid = bill.status === 'Pagado';

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPaid
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-80'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(bill.id)}
                    className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition border ${
                      isPaid
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {bill.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Vence el día <strong className="text-slate-700 dark:text-slate-300">{bill.dueDateDay}</strong> de cada mes
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold mt-0.5 ${isPaid ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {bill.title}
                    </h4>
                    {bill.notes && <p className="text-xs text-slate-400 italic mt-0.5">"{bill.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">
                      {bill.amount.toFixed(2)} €
                    </span>
                    <span className={`block text-[10px] font-bold ${isPaid ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {bill.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition rounded-lg"
                    title="Eliminar recibo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" /> Registrar Nuevo Recibo o Factura
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Concepto / Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Luz Iberdrola, Internet Fibra..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Importe Mensual (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BillCategory)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Día del mes en que vence (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas adicionales</label>
                <input
                  type="text"
                  placeholder="Ej: Cobro en cuenta Santander"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">
                  Guardar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
