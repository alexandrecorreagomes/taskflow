import React, { useState } from 'react';
import { Plus, Trash2, X, FolderPlus, Info } from 'lucide-react';
import { type Category, type ColorOption, PRESET_COLORS } from '../services/db';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, colorOpt: ColorOption) => void | Promise<void>;
  onDeleteCategory: (id: string) => void | Promise<void>;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<ColorOption>(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da categoria não pode estar vazio.');
      return;
    }
    
    // Evita duplicados
    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      setError('Já existe uma categoria com este nome.');
      return;
    }

    onAddCategory(name.trim(), selectedColor);
    setName('');
    setError('');
  };

  // Categoria inicial/padrão não pode ser excluída
  const isDefaultCategory = (id: string) => {
    return ['cat-trabalho', 'cat-pessoal', 'cat-estudos'].includes(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FolderPlus size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Gerenciar Categorias
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Nova Categoria Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Criar Nova Categoria
            </h4>
            
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
                placeholder="Ex: Finanças, Compras, Saúde..."
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-sm transition-all"
              />
              {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error}</p>}
            </div>

            {/* Seletor de Cores */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500">
                Selecione uma Cor
              </label>
              <div className="grid grid-cols-4 xs:grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-slate-800 scale-110 shadow-sm' 
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview da Categoria */}
            <div className="pt-2">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                Visualização do Tag:
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${selectedColor.bg} ${selectedColor.text} ${selectedColor.border}`}>
                {name.trim() || 'Nova Categoria'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25"
            >
              <Plus size={16} />
              Adicionar Categoria
            </button>
          </form>

          {/* Listagem de Categorias Existentes */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Categorias Ativas
            </h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isDefault = isDefaultCategory(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 group"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${cat.color} ${cat.textColor} ${cat.borderColor}`}>
                      {cat.name}
                    </span>
                    
                    {isDefault ? (
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-md border border-slate-200/50 flex items-center gap-1">
                        <Info size={10} />
                        Padrão
                      </span>
                    ) : (
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Excluir categoria"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
