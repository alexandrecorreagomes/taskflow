import React from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import type { Task, Category } from '../services/db';

interface AnalyticsTabProps {
  tasks: Task[];
  categories: Category[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ tasks, categories }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  // Calcula taxa de conclusão
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Verifica tarefas atrasadas
  const overdueCount = tasks.filter((task) => {
    if (task.completed || !task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate + 'T23:59:59');
    return dueDate < today;
  }).length;

  // Tarefas por Categoria
  const tasksByCategory = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    return {
      ...cat,
      total: catTasks.length,
      completed: catCompleted,
      rate: catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0,
    };
  });

  // Tarefas por Prioridade
  const priorities = [
    { key: 'alta', label: 'Alta', bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-100/50' },
    { key: 'média', label: 'Média', bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-100/50' },
    { key: 'baixa', label: 'Baixa', bg: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-100/50' },
  ];

  const tasksByPriority = priorities.map((p) => {
    const pTasks = tasks.filter((t) => t.priority === p.key);
    const pCompleted = pTasks.filter((t) => t.completed).length;
    return {
      ...p,
      total: pTasks.length,
      completed: pCompleted,
    };
  });

  // Encontra a categoria com mais tarefas pendentes
  const getMostDemandingCategory = () => {
    if (total === 0) return 'Nenhuma';
    let maxPending = -1;
    let name = 'Nenhuma';
    tasksByCategory.forEach((c) => {
      const pCount = c.total - c.completed;
      if (pCount > maxPending) {
        maxPending = pCount;
        name = c.name;
      }
    });
    return maxPending > 0 ? name : 'Nenhuma';
  };

  // SVG Radial Progress parameters
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Resumo de Métricas (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Taxa de Conclusão Circular */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Taxa de Conclusão
            </h3>
            <p className="text-3xl font-bold text-slate-800">{completionRate}%</p>
            <p className="text-xs text-slate-400 font-medium">
              {completed} de {total} tarefas concluídas
            </p>
          </div>
          
          {/* Radial SVG */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg height={ radius * 2 } width={ radius * 2 } className="-rotate-90">
              <circle
                stroke="#f1f5f9"
                fill="transparent"
                strokeWidth={ stroke }
                r={ normalizedRadius }
                cx={ radius }
                cy={ radius }
              />
              <circle
                stroke="#059669"
                fill="transparent"
                strokeWidth={ stroke }
                strokeDasharray={ circumference + ' ' + circumference }
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={ normalizedRadius }
                cx={ radius }
                cy={ radius }
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-bold text-emerald-700">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Resumo Operacional
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total</span>
              <span className="text-lg font-bold text-slate-700 block mt-1">{total}</span>
            </div>
            <div className="text-center p-2 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-600 block uppercase tracking-wider">Pendentes</span>
              <span className="text-lg font-bold text-amber-700 block mt-1">{pending}</span>
            </div>
            <div className="text-center p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">Atrasadas</span>
              <span className="text-lg font-bold text-rose-700 block mt-1">{overdueCount}</span>
            </div>
          </div>
        </div>

        {/* Insights Rápidos */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Foco Atual
            </h3>
            <div className="mt-3 flex items-start gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mt-0.5 border border-amber-100">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Categoria com mais pendências:</p>
                <p className="text-sm text-slate-500 mt-0.5 font-semibold text-emerald-600">
                  {getMostDemandingCategory()}
                </p>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium border-t border-slate-100 pt-3">
            Dica: priorize tarefas atrasadas para manter seu painel limpo.
          </div>
        </div>

      </div>

      {/* Gráficos de Barra (Bottom Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico por Categoria */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-600" />
              Tarefas por Categoria
            </h3>
          </div>

          <div className="space-y-4">
            {tasksByCategory.length > 0 ? (
              tasksByCategory.map((cat) => {
                const pendingCount = cat.total - cat.completed;
                const percentage = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
                
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-semibold border ${cat.color} ${cat.textColor} ${cat.borderColor}`}>
                        {cat.name}
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {cat.completed}/{cat.total} concluídas ({pendingCount} pendentes)
                      </span>
                    </div>
                    {/* Barra de Progresso customizada */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out`}
                        style={{
                          width: `${cat.total > 0 ? percentage : 0}%`,
                          backgroundColor: cat.textColor.includes('text-blue') ? '#3b82f6' : 
                                           cat.textColor.includes('text-emerald') ? '#10b981' : 
                                           cat.textColor.includes('text-amber') ? '#f59e0b' : 
                                           cat.textColor.includes('text-rose') ? '#f43f5e' : 
                                           cat.textColor.includes('text-purple') ? '#a855f7' : 
                                           cat.textColor.includes('text-indigo') ? '#6366f1' : 
                                           cat.textColor.includes('text-orange') ? '#f97316' : '#14b8a6'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma categoria registrada.</p>
            )}
          </div>
        </div>

        {/* Gráfico por Prioridade */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <PieChart size={18} className="text-emerald-600" />
            Tarefas por Prioridade
          </h3>

          <div className="space-y-5">
            {tasksByPriority.map((p) => {
              const maxTotal = Math.max(...tasksByPriority.map(x => x.total), 1);
              const barWidth = (p.total / maxTotal) * 100;
              const completePercentage = p.total > 0 ? (p.completed / p.total) * 100 : 0;

              return (
                <div key={p.key} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 capitalize flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${p.bg}`} />
                      {p.label}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      {p.total} {p.total === 1 ? 'tarefa' : 'tarefas'} ({p.completed} concluídas)
                    </span>
                  </div>
                  
                  {/* Barra empilhada (Total com preenchimento da Conclusão interna) */}
                  <div className={`w-full h-4 ${p.bgLight} rounded-full overflow-hidden border border-slate-200/20 relative`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out`}
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: p.bg.includes('rose') ? '#fca5a5' : p.bg.includes('amber') ? '#fcd34d' : '#93c5fd'
                      }}
                    >
                      {/* Sub-barra de conclusão real */}
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
