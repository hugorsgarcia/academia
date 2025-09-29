
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
});

interface LoginFormProps {
  userType: 'student' | 'admin';
  onLoginSuccessRedirectPath?: string;
}

export function LoginForm({ userType, onLoginSuccessRedirectPath }: LoginFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate API call for login
    console.log("Login attempt:", values, "User type:", userType);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success
    toast({
      title: "Login Bem-Sucedido!",
      description: `Bem-vindo(a) de volta.`,
    });
    form.reset();

    let redirectPath = onLoginSuccessRedirectPath;
    if (!redirectPath) {
      if (userType === 'student') {
        redirectPath = '/aluno/dashboard';
      } else if (userType === 'admin') {
        redirectPath = '/admin/dashboard'; // Default admin path if not specified
      }
    }

    if (redirectPath) {
      router.push(redirectPath);
    } else {
      // Fallback or error handling if redirectPath is still undefined
      console.error("Redirect path is undefined");
      router.push('/');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Sua senha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
        {userType === 'student' && (
           <div className="text-sm text-center">
            <Link href="#" className="font-medium text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        )}
      </form>
    </Form>
  );
}
