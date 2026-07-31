import React, { useState } from 'react';
import { ExpenseItem, ExpenseCategory, FamilyMember } from '../types';
import { 
  Wallet, Plus, Trash2, DollarSign, TrendingUp, PieChart, ArrowUpRight
} from 'lucide-react';

interface ExpenseTrackerViewProps {
  expenses: ExpenseItem[];
  familyMembers: FamilyMember[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_BUDGETS: Record<ExpenseCategory, number> = {
  Vivienda: 800,
  Suministros: 200,
  Alimentación: 600,
  Colegio: 300,
  Transporte: 150,
  Ocio: 150,
  Salud: 100,
  Otros: 100
};

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

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  familyMembers,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Alimentación');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(familyMembers[0]?.name || 'Carlos');
  const [notes, setNotes] = useState('');

  // Calculations
  const filteredExpenses = expenses.filter(ex => 
    selectedCategory === 'Todas' || ex.category === selectedCategory
  );

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudget = Object.values(CATEGORY_BUDGETS).reduce((acc, curr) => acc + curr, 0);

  // Calculate spent per category
  const categoryTotals: Record<ExpenseCategory, number> = {
    Vivienda: 0,
    Suministros: 0,
    Alimentación: 0,
    Colegio: 0,
    Transporte: 0,
    Ocio: 0,
    Salud: 0,
    Otros: 0
  };

  expenses.forEach(ex => {
    if (categoryTotals[ex.category] !== undefined) {
      categoryTotals[ex.category] += ex.amount;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    onAddExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      paidBy,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600 text-white rounded-2xl shadow-md shadow-violet-600/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Gastos y Presupuesto Familiar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Control mensual de suministros, compras, educación y ocio
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Presupuesto Mensual</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {totalBudget.toFixed(2)} €
            </span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Gastado Mes</span>
            <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
              {totalSpent.toFixed(2)} €
            </span>
          </div>
          <div className="p-3 bg-violet-100 dark:bg-violet-950 text-violet-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Restante Disponible</span>
            <span className={`text-2xl font-black ${
              (totalBudget - totalSpent) < 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {(totalBudget - totalSpent).toFixed(2)} €
            </span>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Budget Bars */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">
            Desglose por Categoría
          </h3>

          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const spent = categoryTotals[cat];
              const budget = CATEGORY_BUDGETS[cat];
              const percent = Math.min(100, Math.round((spent / budget) * 100));
              const isOver = spent > budget;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className={isOver ? 'text-rose-600 font-black' : 'text-slate-500'}>
                      {spent.toFixed(0)}€ / {budget}€
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver
                          ? 'bg-rose-500'
                          : percent > 80
                          ? 'bg-amber-500'
                          : 'bg-violet-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              Historial de Gastos ({filteredExpenses.length})
            </h3>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay gastos registrados</p>
              <p className="text-xs">Añade tu primer gasto para llevar la cuenta.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-violet-100 dark:bg-violet-950 text-violet-600 rounded-xl font-bold">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {ex.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-violet-600 dark:text-violet-400">{ex.category}</span>
                          <span>•</span>
                          <span>Pagado por: {ex.paidBy}</span>
                          <span>•</span>
                          <span>{ex.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {ex.amount.toFixed(2)} €
                      </span>
                      <button
                        onClick={() => onDeleteExpense(ex.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-600" /> Registrar Nuevo Gasto
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto del Gasto *</label>
                <input
                  type="text"
                  placeholder="Ej. Factura Luz, Gasolina, Supermercado..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Importe (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 45.50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pagado por</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {familyMembers.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
