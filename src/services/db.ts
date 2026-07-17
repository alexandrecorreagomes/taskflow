import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
}

export type Priority = 'alta' | 'média' | 'baixa';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string;
  priority: Priority;
  dueDate: string;
  userId: string;
  createdAt: string;
}

export interface ColorOption {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  hex: string;
}

export const PRESET_COLORS: ColorOption[] = [
  { id: 'blue',   name: 'Azul',    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   hex: '#dbeafe' },
  { id: 'green',  name: 'Verde',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#d1fae5' },
  { id: 'yellow', name: 'Amarelo', bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  hex: '#fef3c7' },
  { id: 'rose',   name: 'Rosa',    bg: 'bg-rose-50',    text: 'text-rose-700',   border: 'border-rose-200',   hex: '#ffe4e6' },
  { id: 'purple', name: 'Roxo',    bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', hex: '#f3e8ff' },
  { id: 'indigo', name: 'Índigo',  bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200', hex: '#e0e7ff' },
  { id: 'orange', name: 'Laranja', bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', hex: '#ffedd5' },
  { id: 'teal',   name: 'Ciano',   bg: 'bg-teal-50',    text: 'text-teal-700',  border: 'border-teal-200',   hex: '#ccfbf1' },
];

const DEFAULT_CATEGORIES: { name: string; color: string; textColor: string; borderColor: string }[] = [
  { name: 'Trabalho', color: 'bg-blue-50',    textColor: 'text-blue-700',    borderColor: 'border-blue-200' },
  { name: 'Pessoal',  color: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { name: 'Estudos',  color: 'bg-amber-50',   textColor: 'text-amber-700',   borderColor: 'border-amber-200' },
];

const generateId = (): string => Math.random().toString(36).substring(2, 9);

/** Obtém o UUID do usuário autenticado atual. Lança erro se não houver sessão. */
async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado.');
  return user.id;
}

// --- Mapeamento banco → TypeScript ---

function rowToCategory(row: Record<string, string>): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    textColor: row.text_color,
    borderColor: row.border_color,
  };
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    completed: row.completed as boolean,
    categoryId: (row.category_id as string) ?? '',
    priority: row.priority as Priority,
    dueDate: (row.due_date as string) ?? '',
    userId: row.user_id as string,
    createdAt: row.created_at as string,
  };
}

export const db = {
  // ─── CATEGORIAS ───────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }

    // Primeiro acesso: insere categorias padrão
    if (!data || data.length === 0) {
      return await this.seedDefaultCategories();
    }

    return (data as Record<string, string>[]).map(rowToCategory);
  },

  async seedDefaultCategories(): Promise<Category[]> {
    const userId = await getCurrentUserId();

    const rows = DEFAULT_CATEGORIES.map((cat) => ({
      id: `cat-${generateId()}`,
      user_id: userId,
      name: cat.name,
      color: cat.color,
      text_color: cat.textColor,
      border_color: cat.borderColor,
    }));

    const { data, error } = await supabase
      .from('categories')
      .insert(rows)
      .select();

    if (error) {
      console.error('Erro ao inserir categorias padrão:', error);
      return [];
    }

    return (data as Record<string, string>[]).map(rowToCategory);
  },

  async addCategory(name: string, colorOpt: ColorOption): Promise<Category> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: `cat-${generateId()}`,
        user_id: userId,
        name: name.trim(),
        color: colorOpt.bg,
        text_color: colorOpt.text,
        border_color: colorOpt.border,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }

    return rowToCategory(data as Record<string, string>);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  },

  // ─── TAREFAS ──────────────────────────────────────────────────────────────

  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }

    return (data as Record<string, unknown>[]).map(rowToTask);
  },

  async createTask(
    taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>
  ): Promise<Task> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: `task-${generateId()}`,
        user_id: userId,
        title: taskData.title,
        completed: false,
        category_id: taskData.categoryId,
        priority: taskData.priority,
        due_date: taskData.dueDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }

    return rowToTask(data as Record<string, unknown>);
  },

  async updateTask(
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Task> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title     !== undefined) dbUpdates.title       = updates.title;
    if (updates.completed !== undefined) dbUpdates.completed   = updates.completed;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.priority  !== undefined) dbUpdates.priority    = updates.priority;
    if (updates.dueDate   !== undefined) dbUpdates.due_date    = updates.dueDate;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }

    return rowToTask(data as Record<string, unknown>);
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  },
};
