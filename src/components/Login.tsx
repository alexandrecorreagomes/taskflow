import React, { useState } from 'react';
import { CheckSquare, Mail, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup';

interface LoginProps {
  onLogin: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos. Verifique e tente novamente.',
  'Email not confirmed': 'Confirme seu email antes de entrar. Verifique sua caixa de entrada.',
  'User already registered': 'Este email já está cadastrado. Tente fazer login.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Formato de email inválido.',
  'signup is disabled': 'Cadastro desabilitado. Entre em contato com o administrador.',
};

function translateError(message: string): string {
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) return value;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos para continuar.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError(translateError(authError.message)); return; }
        onLogin();
      } else {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) { setError(translateError(authError.message)); return; }
        setSuccessMsg('Conta criada! Verifique seu email para confirmar e depois faça login.');
        setMode('login');
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Card central */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Cabeçalho do card */}
        <div className="bg-emerald-600 px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
            <CheckSquare size={24} className="text-white stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-white">TaskFlow</h1>
          <p className="text-emerald-100 text-sm mt-1">
            {isLogin ? 'Entre na sua conta para continuar' : 'Crie sua conta gratuitamente'}
          </p>
        </div>

        {/* Corpo do formulário */}
        <div className="px-8 py-7">

          {/* Toggle Entrar / Criar conta */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { resetForm(); setMode('login'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isLogin
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn size={14} />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setMode('signup'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus size={14} />
              Criar conta
            </button>
          </div>

          {/* Mensagem de sucesso */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-emerald-700 text-sm font-medium leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">
                  Senha
                </label>
                {!isLogin && (
                  <span className="text-slate-400 text-xs">Mín. 6 caracteres</span>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={isLogin ? 'Sua senha' : 'Crie uma senha segura'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-rose-600 text-xs font-medium">{error}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 group shadow-sm hover:shadow-md hover:shadow-emerald-600/15 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {isLogin ? 'Entrar na conta' : 'Criar conta'}
                  <ArrowRight size={15} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link alternativo */}
          <p className="mt-5 text-center text-sm text-slate-400">
            {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => { resetForm(); setMode(isLogin ? 'signup' : 'login'); }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
            >
              {isLogin ? 'Criar conta grátis' : 'Fazer login'}
            </button>
          </p>
        </div>

        {/* Rodapé do card */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            🔒 Seus dados são armazenados com segurança no Supabase
          </p>
        </div>
      </div>

      {/* Assinatura abaixo do card */}
      <p className="mt-6 text-xs text-slate-400">
        TaskFlow &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
};
