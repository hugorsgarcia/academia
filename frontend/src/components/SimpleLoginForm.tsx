"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function SimpleLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar mensagens anteriores
    setError(null);
    setSuccess(null);
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      let result;
      const contentType = response.headers.get('content-type');
      
      // Verificar se a resposta é JSON
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Se não for JSON, é provavelmente um erro 500 retornando HTML
        const textResponse = await response.text();
        console.error('Resposta não-JSON do servidor:', textResponse);
        throw new Error('Erro interno do servidor. Tente novamente.');
      }

      if (!response.ok) {
        // Se houver erros de validação, mostrá-los
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((err: any) => err.msg).join('\n• ');
          throw new Error(`Erros de validação:\n• ${errorMessages}`);
        }
        throw new Error(result.message || 'Email ou senha incorretos');
      }

      // Use the auth context to login
      login(result.data.token, result.data.user);

      setSuccess("Login realizado com sucesso! Redirecionando...");
      
      // Redirect based on user type
      const userRole = result.data.user.role;
      if (userRole === 'student') {
        router.push('/aluno');
      } else if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      setError(error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro no login
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <pre className="whitespace-pre-wrap font-sans">{error}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {success}
              </h3>
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu.email@exemplo.com"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Sua senha"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>

      <div className="text-sm text-center space-y-2">
        <div>
          <a href="#" className="text-blue-600 hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
        <div>
          <span className="text-gray-600">Não tem uma conta? </span>
          <a href="/register" className="font-medium text-blue-600 hover:underline">
            Criar conta
          </a>
        </div>
      </div>
    </form>
  );
}