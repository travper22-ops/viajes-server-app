/**
 * ForgotForm — formulario de recuperación de contraseña
 *
 * Props:
 *   onSubmit: function({ email })
 *   loginTo : string
 */
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ForgotFormProps {
  onSubmit?: (data: { email: string }) => void;
  loginTo?: string;
}

export default function ForgotForm({ onSubmit, loginTo = '/login' }: ForgotFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
    };
    onSubmit?.(data);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md mx-auto">
      <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-2 text-center">Recuperar Contraseña</h2>
      <p className="text-gray-500 text-sm text-center mb-6">
        Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input label="Correo electrónico" name="email" type="email" icon="fa-envelope" required />
        </div>
        <Button type="submit" fullWidth size="lg">Enviar Enlace de Recuperación</Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        <Link to={loginTo} className="text-primary hover:underline">← Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}
