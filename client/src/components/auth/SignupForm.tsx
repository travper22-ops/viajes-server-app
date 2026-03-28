/**
 * SignupForm — formulario de registro
 *
 * Props:
 *   onSubmit : function(formData)
 *   loginTo  : string  (ruta login)
 */
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface SignupFormProps {
  onSubmit?: (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    phone?: string;
  }) => void;
  loginTo?: string;
}

export default function SignupForm({ onSubmit, loginTo = '/login' }: SignupFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string || undefined,
    };
    onSubmit?.(data);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md mx-auto">
      <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-6 text-center">Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre" name="firstName" icon="fa-user" required />
            <Input label="Apellidos" name="lastName" icon="fa-user" required />
          </div>
          <Input label="Correo electrónico" name="email" type="email" icon="fa-envelope" required />
          <Input label="Contraseña" name="password" type="password" icon="fa-lock" required />
          <Input label="Repetir contraseña" name="password2" type="password" icon="fa-lock" required />
          <Input label="Teléfono (opcional)" name="phone" type="tel" icon="fa-phone" />
        </div>

        <label className="flex flex-col sm:flex-row sm:items-start gap-2 text-xs text-gray-500 mb-4 cursor-pointer">
          <input type="checkbox" className="mt-0.5" required />
          Acepto los <a href="#!" className="text-primary hover:underline mx-0.5">Términos y Condiciones</a>
          y la <a href="#!" className="text-primary hover:underline mx-0.5">Política de Privacidad</a>
        </label>

        <Button type="submit" fullWidth size="lg">Crear Cuenta</Button>
      </form>

      {/* Botones sociales */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">O regístrate con</span></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button 
          type="button"
          className="flex items-center justify-center gap-3 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          style={{ background: '#fff !important' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Google</span>
        </button>
        <button 
          type="button"
          className="flex items-center justify-center gap-3 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          style={{ background: '#fff !important' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link to={loginTo} className="text-primary font-semibold hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
