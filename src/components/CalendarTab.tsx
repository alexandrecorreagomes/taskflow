import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import type { Task, Category } from '../services/db';

interface CalendarTabProps {
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (id: string, completed: boolean) => void | Promise<void>;
  onDeleteTask: (id: string) => void | Promise<void>;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onDeleteTask,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper para obter dias no mês
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  // Helper para obter o dia da semana do primeiro dia do mês (0 = Domingo)
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Navegar meses
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Agrupa tarefas por data (formato YYYY-MM-DD)
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (task.dueDate) {
      if (!acc[task.dueDate]) acc[task.dueDate] = [];
      acc[task.dueDate].push(task);
    }
    return acc;
  }, {});

  // Gera a lista de células do calendário (dias)
  const renderDays = () => {
    const dayCells: React.ReactNode[] = [];

    // Dias vazios do mês anterior
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      const prevMonthDate = new Date(year, month - 1, prevDay);
      const prevDateStr = prevMonthDate.toISOString().split('T')[0];
      dayCells.push(
        <button
          key={`prev-${prevDay}`}
          onClick={() => setSelectedDateStr(prevDateStr)}
          className="h-16 border border-slate-100 bg-slate-50/30 text-slate-400 text-left p-1.5 align-top relative opacity-40 hover:opacity-75 transition-all text-xs sm:text-sm cursor-pointer"
        >
          <span>{prevDay}</span>
          {renderDotsForDate(prevDateStr)}
        </button>
      );
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Ajusta timezone local para obter a string YYYY-MM-DD correta
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      const dateStr = localDate.toISOString().split('T')[0];

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      
      const isSelected = selectedDateStr === dateStr;

      dayCells.push(
        <button
          key={`current-${day}`}
          onClick={() => setSelectedDateStr(dateStr)}
          className={`h-16 border border-slate-100 text-left p-1.5 align-top relative transition-all text-xs sm:text-sm flex flex-col justify-between cursor-pointer ${
            isSelected
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/10 z-10'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <span className={`font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
            isToday 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
              : 'text-slate-700'
          }`}>
            {day}
          </span>
          {renderDotsForDate(dateStr)}
        </button>
      );
    }

    // Dias vazios do próximo mês
    const totalCellsUsed = firstDayIndex + daysInMonth;
    const remainingCells = totalCellsUsed % 7 === 0 ? 0 : 7 - (totalCellsUsed % 7);
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDate = new Date(year, month + 1, day);
      const nextDateStr = nextMonthDate.toISOString().split('T')[0];
      dayCells.push(
        <button
          key={`next-${day}`}
          onClick={() => setSelectedDateStr(nextDateStr)}
          className="h-16 border border-slate-100 bg-slate-50/30 text-slate-400 text-left p-1.5 align-top relative opacity-40 hover:opacity-75 transition-all text-xs sm:text-sm cursor-pointer"
        >
          <span>{day}</span>
          {renderDotsForDate(nextDateStr)}
        </button>
      );
    }

    return dayCells;
  };

  // Renderiza pontinhos de prioridade de tarefas no dia específico
  const renderDotsForDate = (dateStr: string) => {
    const dayTasks = tasksByDate[dateStr] || [];
    if (dayTasks.length === 0) return null;

    // Classifica por prioridade para mostrar os pontos coloridos
    return (
      <div className="flex gap-1 overflow-x-hidden pt-1 max-w-full">
        {dayTasks.slice(0, 3).map((task) => {
          const colorClass = 
            task.completed ? 'bg-slate-300' :
            task.priority === 'alta' ? 'bg-rose-500' :
            task.priority === 'média' ? 'bg-amber-500' : 'bg-blue-500';
          return (
            <div
              key={task.id}
              className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
              title={task.title}
            />
          );
        })}
        {dayTasks.length > 3 && (
          <span className="text-[8px] text-slate-400 font-bold leading-none">
            +{dayTasks.length - 3}
          </span>
        )}
      </div>
    );
  };

  // Formata a data selecionada por extenso para a listagem de detalhes
  const formatSelectedDate = () => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const selectedTasks = tasksByDate[selectedDateStr] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendário Mensal */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-6">
          
          {/* Header do Calendário */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon size={20} className="text-emerald-600" />
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-1 bg-slate-50 p-1 border border-slate-200/50 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-800 shadow-sm shadow-transparent hover:shadow-slate-200/20 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-0.5 text-xs font-semibold hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-800 shadow-sm shadow-transparent hover:shadow-slate-200/20 cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-800 shadow-sm shadow-transparent hover:shadow-slate-200/20 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Células de Dias */}
          <div className="grid grid-cols-7 rounded-xl overflow-hidden border border-slate-100">
            {renderDays()}
          </div>
        </div>

        {/* Detalhes do Dia Selecionado */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-4 min-h-[300px] flex flex-col">
            <div>
              <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
                Compromissos do Dia
              </h3>
              <p className="font-bold text-slate-800 text-sm mt-1 capitalize leading-snug">
                {formatSelectedDate()}
              </p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
              {selectedTasks.length > 0 ? (
                selectedTasks.map((task) => {
                  const cat = categories.find((c) => c.id === task.categoryId);
                  
                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Inline custom check */}
                        <button
                          onClick={() => onToggleComplete(task.id, !task.completed)}
                          className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-emerald-500 bg-white'
                          }`}
                        >
                          {task.completed && <CheckCircle2 size={12} className="stroke-[3]" />}
                        </button>
                        
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold text-slate-700 truncate ${
                            task.completed ? 'line-through text-slate-400' : ''
                          }`}>
                            {task.title}
                          </p>
                          <div className="flex gap-1.5 mt-1 items-center">
                            {cat && (
                              <span className={`inline-block px-1.5 py-0.2 rounded-md text-[8px] font-bold border ${cat.color} ${cat.textColor} ${cat.borderColor}`}>
                                {cat.name}
                              </span>
                            )}
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              task.priority === 'alta' ? 'text-rose-600' :
                              task.priority === 'média' ? 'text-amber-600' : 'text-blue-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botão de Excluir */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Excluir tarefa"
                      >
                        <Circle size={4} className="fill-current text-slate-300 group-hover:hidden" />
                        <span className="hidden group-hover:block text-[10px] font-bold text-rose-600">Excluir</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2">
                  <CalendarIcon size={24} className="text-slate-300 stroke-[1.5]" />
                  <p className="text-xs text-slate-400 font-medium">Nenhuma tarefa agendada para este dia.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
