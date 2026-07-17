import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import { db, type Task, type Category, type ColorOption } from './services/db';
import { Login } from './components/Login';
import { Navbar, type TabId } from './components/Navbar';
import { TaskTab } from './components/TaskTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { CalendarTab } from './components/CalendarTab';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true); // aguarda verificação inicial
  const [activeTab, setActiveTab] = useState<TabId>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Monitora o estado de autenticação do Supabase
  useEffect(() => {
    // Verifica a sessão atual ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    // Escuta mudanças de sessão (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega os dados quando o usuário muda
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setCategories([]);
      return;
    }

    const loadData = async () => {
      setDataLoading(true);
      try {
        const [userTasks, userCategories] = await Promise.all([
          db.getTasks(),
          db.getCategories(),
        ]);
        setTasks(userTasks);
        setCategories(userCategories);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('tasks');
  };

  // --- Ações CRUD de Tarefas ---
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => {
    if (!user) return;
    try {
      const newTask = await db.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    if (!user) return;
    try {
      const updatedTask = await db.updateTask(id, { completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    try {
      await db.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
    }
  };

  // --- Ações CRUD de Categorias ---
  const handleAddCategory = async (name: string, colorOpt: ColorOption) => {
    if (!user) return;
    try {
      const newCat = await db.addCategory(name, colorOpt);
      setCategories((prev) => [...prev, newCat]);
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    try {
      await db.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
    }
  };

  // Tela de carregamento enquanto verifica sessão
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // Tela de login (não autenticado)
  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  // Tela de carregamento dos dados
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Cabeçalho Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={user.email ?? 'Usuário'}
        onLogout={handleLogout}
      />

      {/* Conteúdo Principal baseando-se na aba ativa */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-2">
        {activeTab === 'tasks' && (
          <TaskTab
            tasks={tasks}
            categories={categories}
            onCreateTask={handleCreateTask}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            tasks={tasks}
            categories={categories}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      {/* Footer minimalista */}
      <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-xs text-slate-400 font-medium mt-auto">
        TaskFlow App &copy; {new Date().getFullYear()} &bull; Desenvolvido com React, Tailwind CSS e TypeScript.
      </footer>
    </div>
  );
}

export default App;
