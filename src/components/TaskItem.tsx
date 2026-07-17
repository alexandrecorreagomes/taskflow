import React from 'react';
import { Calendar, Trash2, Check } from 'lucide-react';
import type { Task, Category, Priority } from '../services/db';

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string, completed: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  category,
  onToggleComplete,
  onDelete,
}) => {
  // Configuração das tags de prioridade
  const priorityConfig: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
    alta: { label: 'ALTA', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
    média: { label: 'MÉDIA', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    baixa: { label: 'BAIXA', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  };

  const pStyle = priorityConfig[task.priority] || priorityConfig.baixa;

  // Formata a data para visualização (DD/MM/AAAA)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Verifica se a tarefa está atrasada (apenas se não estiver concluída)
  const isOverdue = () => {
    if (task.completed || !task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate + 'T23:59:59');
    return dueDate < today;
  };

  return (
    <div
      className={`group flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-300 ${
        task.completed
          ? 'border-slate-100/70 bg-white/50 opacity-60'
          : 'border-slate-200/60 hover:border-slate-300 shadow-xs hover:shadow-md hover:shadow-slate-100/50'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        
        {/* Custom Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id, !task.completed)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20'
          }`}
        >
          {task.completed && <Check size={14} className="stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            className={`text-slate-800 font-semibold text-sm sm:text-base leading-snug truncate ${
              task.completed ? 'line-through text-slate-400 font-normal' : ''
            }`}
          >
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Tag */}
            {category ? (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${category.color} ${category.textColor} ${category.borderColor}`}
              >
                {category.name.toUpperCase()}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border bg-slate-50 text-slate-400 border-slate-200">
                SEM CATEGORIA
              </span>
            )}

            {/* Priority Tag */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
            >
              {pStyle.label}
            </span>

            {/* Due Date Indicator */}
            {task.dueDate && (
              <div
                className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-md border ${
                  isOverdue()
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}
                title={isOverdue() ? 'Tarefa Atrasada!' : 'Data de Vencimento'}
              >
                <Calendar size={12} className="flex-shrink-0" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 ml-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
        title="Excluir tarefa"
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
};
