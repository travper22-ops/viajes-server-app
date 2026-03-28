/**
 * JobApplyForm — formulario de candidatura a un empleo
 *
 * Props:
 *   onSubmit: function(formData)
 */
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function JobApplyForm({ onSubmit }) {
  return (
    <div id="applyNow" className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4">
        <i className="fa fa-paper-plane text-primary mr-2" /> Inscríbete Ahora
      </h2>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit?.(Object.fromEntries(new FormData(e.target)))
          e.target.reset()
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre completo" name="name"  required />
          <Input label="Correo electrónico" name="email" type="email" required />
          <Input label="Teléfono" name="phone" type="tel" />
          <Input label="LinkedIn (opcional)" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." />
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">Carta de presentación</label>
            <textarea
              name="cover"
              rows={4}
              placeholder="Cuéntanos por qué eres el candidato/a ideal..."
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">Currículum (PDF)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
              <i className="fa fa-cloud-upload text-3xl text-gray-300 mb-2 block" />
              <p className="text-sm text-gray-500">
                Arrastra tu CV aquí o <span className="text-primary">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF hasta 5MB</p>
            </div>
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-4">
          Enviar Candidatura
        </Button>
      </form>
    </div>
  )
}
