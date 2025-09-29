
"use client";

import { SimpleLoginForm } from '@/components/SimpleLoginForm';
import Link from 'next/link';

export default function AlunoLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Área do Aluno
          </h1>
          <p className="text-gray-600">
            Acesse sua conta para ver treinos e horários
          </p>
        </div>

        <SimpleLoginForm />

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <span>Não tem uma conta? </span>
            <Link href="/register" className="text-blue-600 hover:underline">
              Cadastre-se aqui
            </Link>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
