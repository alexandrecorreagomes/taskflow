import React, { useState } from 'react';
import { Plus, Settings, Filter, CheckCircle2, Calendar } from 'lucide-react';
import type { Task, Category, Priority, ColorOption } from '../services/db';
import { TaskItem } from './TaskItem';
import { CategoryManager } from './CategoryManager';

interface TaskTabProps {
  tasks: Task[];
  categories: Category[];
  onCreateTask: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => void | Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => void | Promise<void>;
  onDeleteTask: (id: string) => void | Promise<void>;
  onAddCategory: (name: string, colorOpt: ColorOption) => void | Promise<void>;
  onDeleteCategory: (id: string) => void | Promise<void>;
}

export const TaskTab: React.FC<TaskTabProps> = ({
  tasks,
  categories,
  onCreateTask,
  onToggleComplete,
  onDeleteTask,
  onAddCategory,
  onDeleteCategory,
}) => {
  // Estados do formulário de criação
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('baixa');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');

  // Estados de filtros
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Controle do modal de categorias
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Inicializa o categoryId padrão do formulário se houver categorias
  React.useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Por favor, insira o título da tarefa.');
      return;
    }
    setFormError('');

    onCreateTask({
      title: title.trim(),
      categoryId: categoryId || (categories[0]?.id || ''),
      priority,
      dueDate,
    });

    // Reseta o formulário mantendo as seleções de categoria e prioridade
    setTitle('');
    setDueDate('');
  };

  // Filtragem e ordenação de tarefas
  const filteredTasks = tasks.filter((task) => {
    // Filtro de Status
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;

    // Filtro de Categoria
    if (selectedCategoryFilter !== 'all' && task.categoryId !== selectedCategoryFilter) return false;

    // Filtro de Prioridade
    if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) return false;

    return true;
  });

  // Ordena tarefas: pendentes primeiro, depois por data de vencimento (tarefas sem data por último)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Contadores
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card de Métricas Rápidas */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Progresso Geral</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Pendentes</span>
                <span className="text-2xl font-bold text-emerald-700 block mt-1">{pendingCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Concluídas</span>
                <span className="text-2xl font-bold text-slate-600 block mt-1">{completedCount}</span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Filter size={15} className="text-slate-400" />
                Filtros
              </h3>
              <button 
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setSelectedPriorityFilter('all');
                  setFilterStatus('all');
                }}
                className="text-xs text-slate-400 hover:text-emerald-600 font-medium transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>

            {/* Filtro de Categoria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Categorias</label>
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <Settings size={12} />
                  Editar
                </button>
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-sm transition-all"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Prioridade */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Prioridade</label>
              <select
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-sm transition-all"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="alta">Alta</option>
                <option value="média">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Formulário de Criação de Tarefas */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <Plus size={18} className="text-emerald-600" />
              Adicionar Nova Tarefa
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setFormError('');
                  }}
                  placeholder="No que você está trabalhando hoje?"
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-base transition-all font-medium placeholder-slate-400"
                />
                {formError && <p className="text-rose-500 text-xs font-medium">{formError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Seletor Categoria */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-sm transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor Prioridade */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</label>
                  <div className="flex gap-1 bg-slate-50/70 p-1 border border-slate-200 rounded-xl">
                    {(['baixa', 'média', 'alta'] as Priority[]).map((p) => {
                      const isActive = priority === p;
                      const activeColors = {
                        baixa: 'bg-blue-50 text-blue-700 border-blue-100',
                        média: 'bg-amber-50 text-amber-700 border-amber-100',
                        alta: 'bg-rose-50 text-rose-700 border-rose-100',
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize ${
                            isActive
                              ? `${activeColors[p]} shadow-xs`
                              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Data de Vencimento */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Prazo (Opcional)</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-sm transition-all"
                    />
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Plus size={16} />
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>

          {/* Listagem de Tarefas */}
          <div className="space-y-4">
            
            {/* Header de Filtro de Status */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
              <div className="flex gap-2">
                {(['all', 'pending', 'completed'] as const).map((status) => {
                  const label = { all: 'Todas', pending: 'Pendentes', completed: 'Concluídas' }[status];
                  const count = status === 'all' 
                    ? tasks.length 
                    : status === 'pending' ? pendingCount : completedCount;
                  const isActive = filterStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Exibindo {sortedTasks.length} {sortedTasks.length === 1 ? 'tarefa' : 'tarefas'}
              </div>
            </div>

            {/* Lista física */}
            {sortedTasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTasks.map((task) => {
                  const cat = categories.find((c) => c.id === task.categoryId);
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      category={cat}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDeleteTask}
                    />
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/60 shadow-xs flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
                  <CheckCircle2 size={24} className="stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Nenhuma tarefa encontrada</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {filterStatus !== 'all' || selectedCategoryFilter !== 'all' || selectedPriorityFilter !== 'all'
                      ? 'Nenhuma tarefa atende aos critérios dos filtros selecionados.'
                      : 'Você está livre por hoje! Adicione uma nova tarefa acima para começar.'}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Modal de Gerenciamento de Categorias */}
      {isCategoryManagerOpen && (
        <CategoryManager
          categories={categories}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
          onClose={() => setIsCategoryManagerOpen(false)}
        />
      )}

    </div>
  );
};
