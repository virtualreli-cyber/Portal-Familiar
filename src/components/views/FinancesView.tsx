import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { ExpenseItem, ExpenseCategory } from '../../types';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { getUserPreferences, saveUserPreferences } from '../../lib/userPreferences';
import { ConfirmModal } from '../ConfirmModal';

const CATEGORIES: ExpenseCategory[] = [
  'Vivienda',
  'Suministros',
  'Alimentación',
  'Colegio',
  'Transporte',
  'Ocio',
  'Salud',
  'Otros'
];

export const FinancesView: React.FC = () => {
  const { expenses, addExpense, toggleExpensePaid, deleteExpense } = useFamily();
  const { permissions, isAdmin, currentMember } = useAuth();

  const [selectedCategory, setSelectedCategoryState] = useState<string>(() => 
    getUserPreferences(currentMember.id).financesCategoryFilter
  );
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const setSelectedCategory = (cat: string) => {
    setSelectedCategoryState(cat);
    saveUserPreferences(currentMember.id, { financesCategoryFilter: cat });
  };
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useBodyScrollLock(showAddModal || deletingExpenseId !== null);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Suministros');
  const [dueDateDay, setDueDateDay] = useState('5');
  const [notes, setNotes] = useState('');

  if (!permissions.canManageFinances) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Acceso Restringido</h3>
        <p className="text-xs text-slate-500">
          La gestión de facturas y economía doméstica requiere permisos de Administrador / Padres.
        </p>
      </div>
    );
  }

  const filteredExpenses = expenses.filter(ex => {
    if (selectedCategory !== 'Todas' && ex.category !== selectedCategory) return false;
    return true;
  });

  const totalAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const paidAmount = filteredExpenses.filter(e => e.paid).reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      dueDateDay: dueDateDay ? parseInt(dueDateDay) : undefined,
      paid: false,
      paidBy: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Gastos y Facturas Familiares</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control de recibos mensuales del hogar, suministros y estado de pagos
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-200 active-touch shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Factura</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gastos Mes</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalAmount.toFixed(2)} €</h3>
        </div>

        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200/80 shadow-xs">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pagado
          </p>
          <h3 className="text-2xl font-extrabold text-emerald-900 mt-1">{paidAmount.toFixed(2)} €</h3>
        </div>

        <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200/80 shadow-xs">
          <p className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-rose-600" /> Pendiente
          </p>
          <h3 className="text-2xl font-extrabold text-rose-900 mt-1">{pendingAmount.toFixed(2)} €</h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Filtrar por Categoría</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Expenses Checklist */}
      <div className="space-y-3">
        {filteredExpenses.map(ex => (
          <div
            key={ex.id}
            className={`bg-white rounded-2xl p-4 border transition flex items-center justify-between gap-3 shadow-xs ${
              ex.paid ? 'opacity-70 bg-slate-50 border-slate-200' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleExpensePaid(ex.id)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition active-touch shrink-0 ${
                  ex.paid 
                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                    : 'border-slate-300 hover:border-emerald-500 bg-white'
                }`}
              >
                {ex.paid && <Check className="w-4 h-4" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-base text-slate-900 ${ex.paid ? 'line-through text-slate-500' : ''}`}>
                    {ex.title}
                  </h4>
                  <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {ex.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  {ex.dueDateDay && <span>Vence el día {ex.dueDateDay} de cada mes</span>}
                  {ex.notes && <span>• {ex.notes}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`font-extrabold text-base ${ex.paid ? 'text-slate-500' : 'text-emerald-700'}`}>
                {ex.amount.toFixed(2)} €
              </span>

              <button
                onClick={() => setDeletingExpenseId(ex.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition active-touch"
                title="Eliminar gasto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <h3 className="font-bold text-lg">Nueva Factura o Gasto</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Concepto / Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Luz y Gas, Hipoteca, Seguro Médico..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Importe (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej: 120.50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Día de Vencimiento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de pago, empresa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 text-sm active-touch"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 text-sm active-touch"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingExpenseId}
        onCancel={() => setDeletingExpenseId(null)}
        onConfirm={() => {
          if (deletingExpenseId) deleteExpense(deletingExpenseId);
          setDeletingExpenseId(null);
        }}
      />
    </div>
  );
};
