/**
 * CommentList — lista de comentarios de un artículo
 * CommentForm  — formulario para añadir comentario
 */

export function CommentList({ comments = [] }) {
  return (
    <div className="space-y-4">
      {comments.map((c, i) => (
        <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {c.avatar
              ? <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.style.display='none' }}/>
              : <i className="fa fa-user-circle-o text-primary text-xl"/>
            }
          </div>
          <div>
            <div className="flex gap-3 items-baseline mb-1">
              <span className="font-semibold text-gray-800 text-sm">{c.author}</span>
              <span className="text-gray-400 text-xs">{c.date}</span>
            </div>
            <p className="text-gray-600 text-sm">{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function CommentForm({ onSubmit }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-8">
      <h4 className="font-bold font-poppins text-gray-800 mb-4">
        <i className="fa fa-comment text-primary mr-2"/>Deja un Comentario
      </h4>
      <form onSubmit={e => {
        e.preventDefault()
        const fd = new FormData(e.target)
        onSubmit?.({ name: fd.get('name'), email: fd.get('email'), text: fd.get('text') })
        e.target.reset()
      }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Nombre</label>
            <input name="name" type="text"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Tu nombre" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Correo</label>
            <input name="email" type="email"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="tu@correo.com" required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 uppercase mb-1">Comentario</label>
          <textarea name="text" rows={4}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="Escribe tu comentario..." required />
        </div>
        <button type="submit"
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded text-sm transition-colors flex items-center gap-2">
          <i className="fa fa-paper-plane"/>Publicar Comentario
        </button>
      </form>
    </div>
  )
}
