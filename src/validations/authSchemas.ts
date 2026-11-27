// Importa o Zod para validação de schemas
import { z } from 'zod';

// Schema de validação do formulário de login
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

// Tipo inferido do schema de login
export type LoginFormData = z.infer<typeof loginSchema>;

// Schema de validação do formulário de cadastro (com validações de igualdade e obrigatoriedade)
export const registerSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
    cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
    userType: z.enum(['student', 'professional']).nullable(),
    settings: z.object({
      currency: z.enum(['BRL', 'USD', 'EUR']),
      profitMargin: z
        .number({ error: 'Informe a margem de lucro' })
        .min(0, 'O valor não pode ser negativo')
        .max(100, 'O valor não pode ser maior que 100%'),
      taxRate: z
        .number({ error: 'Informe a alíquota de impostos' })
        .min(0, 'O valor não pode ser negativo')
        .max(100, 'O valor não pode ser maior que 100%'),
      cardFee: z
        .number({ error: 'Informe a taxa de cartão' })
        .min(0, 'O valor não pode ser negativo')
        .max(100, 'O valor não pode ser maior que 100%'),
    }),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    passwordConfirmation: z.string().min(8, 'Confirme sua senha'),
    termsAccepted: z.boolean().refine((accepted) => accepted, 'Aceite os Termos de Uso para continuar'),
    privacyPolicyAccepted: z.boolean().refine((accepted) => accepted, 'Aceite a Política de Privacidade para continuar'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  })
  .refine((data) => data.userType !== null, {
    message: 'Selecione um tipo de usuário',
    path: ['userType'],
  });

// Tipo inferido do schema de cadastro
export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema de validação do formulário de recuperação de senha
export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// Tipo inferido do schema de recuperação de senha
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Schema de validação do formulário de redefinição de senha (com validação de igualdade)
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    passwordConfirmation: z.string().min(8, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  });

// Tipo inferido do schema de redefinição de senha
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
