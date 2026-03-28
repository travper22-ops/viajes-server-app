/**
 * CalendarDemoPage — Showcase del calendario de marketing
 * Ruta: /calendario-demo
 */
import { useState } from 'react'
import { Sun, Flame } from 'lucide-react'
import { Header, MobileNav, Footer, PageBanner } from '../components/layout'
import TravelDatePicker from '../components/ui/TravelDatePicker'
import { getMonthSummary } from '../data/specialDates'

const TYPES = [
  { key: 'offer',      icon: <i className="fa fa-tag"/>,      label: 'Oferta Flash',    color: '#059669', bg: '#d1fae5', border: '#6ee7b7', desc: 'Descuentos especiales de duración limitada. Ideal para reservas anticipadas.' },
  { key: 'holiday',    icon: <i className="fa fa-star"/>,      label: 'Festivo Nacional', color: '#e11d48', bg: '#ffe4e6', border: '#fda4af', desc: 'Días festivos nacionales. Alta demanda, reserva con antelación.' },
  { key: 'highSeason', icon: <Sun size={18}/>,       label: 'Temporada Alta',   color: '#4f46e5', bg: '#e0e7ff', border: '#a5b4fc', desc: 'Períodos de mayor afluencia turística. Precios más elevados.' },
  { key: 'event',      icon: <Flame size={18}/>,     label: 'Evento Especial',  color: '#d97706', bg: '#fef3c7', border: '#fde68a', desc: 'Ferias, festivales y eventos turísticos relevantes.' },
]

// Resumen de marzo-agosto 2026 (meses actuales)
const MONTHS_PREVIEW = [2,3,4,5,6,7].map(m => {
  const s = getMonthSummary(2026, m)
  return { month: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'][m], ...s }
})

export default function CalendarDemoPage() {
  const [single,  setSingle]  = useState(null)
  const [rangeS,  setRangeS]  = useState(null)
  const [rangeE,  setRangeE]  = useState(null)

  return (
    <div id="body">
      <MobileNav/>
      <Header/>
      <PageBanner
        title="Calendario de Marketing Turístico"
        subtitle="Visualización de ofertas, festivos, temporadas y eventos especiales"
        breadcrumbs={[{to:'/',icon:'fa-home',label:'Inicio'},{label:'Demo Calendario'}]}
      />

      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {/* Intro */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-start gap-5">
          <i className="fa fa-info-circle"/>
          <div>
            <h2 className="text-xl font-bold font-poppins mb-2">¿Cómo funciona el calendario?</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              Nuestro sistema colorea cada día del calendario según su categoría turística,
              permitiendo a los viajeros identificar de un vistazo las mejores fechas para reservar.
              Los chips en la cabecera de cada mes resumen el contenido sin necesidad de abrirlo.
            </p>
            <div className="flex flex-wrap gap-3">
              {TYPES.map(t => (
                <span key={t.key} className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                  <span style={{color: t.color}}>{t.icon}</span> {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tipos de fechas */}
        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-5 flex items-center gap-2">
          <CalendarDays size={20} className="text-primary"/> Tipos de fechas especiales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {TYPES.map(t => (
            <div key={t.key} className="rounded-xl border-2 p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: t.border, background: t.bg }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: t.color }}>
                {t.icon}
                <span className="font-bold text-sm font-poppins">{t.label}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: t.color, opacity: 0.85 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Resumen por mes */}
        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa fa-star"/> Resumen Mar – Ago 2026
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
          {MONTHS_PREVIEW.map(m => (
            <div key={m.month} className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-primary hover:shadow-sm transition-all">
              <div className="font-bold text-gray-700 font-poppins mb-2 text-sm">{m.month}</div>
              <div className="space-y-1 text-xs">
                {m.offers > 0      && <div className="bg-emerald-50 text-emerald-700 rounded px-1 py-0.5">{m.offers} oferta{m.offers>1?'s':''}</div>}
                {m.events > 0      && <div className="bg-amber-50 text-amber-700 rounded px-1 py-0.5">{m.events} evento{m.events>1?'s':''}</div>}
                {m.holidays > 0    && <div className="bg-red-50 text-red-700 rounded px-1 py-0.5">{m.holidays} festivo{m.holidays>1?'s':''}</div>}
                {m.highSeasonDays > 0 && <div className="bg-indigo-50 text-indigo-700 rounded px-1 py-0.5">T.Alta</div>}
                {!m.offers && !m.events && !m.holidays && !m.highSeasonDays && (
                  <div className="text-gray-300 text-xs">—</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Demos interactivos */}
        <h2 className="text-xl font-bold font-poppins text-gray-800 mb-6">
          <i className="fa fa-calendar-days"/> Demos interactivos
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* Demo 1: Fecha única */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-700 font-poppins mb-1">Selección de fecha única</h3>
            <p className="text-xs text-gray-400 mb-4">Usado en formularios de bus, traslado, etc.</p>
            <TravelDatePicker
              mode="single"
              label="Fecha de viaje"
              value={single}
              onChange={setSingle}
              placeholder="¿Cuándo viajas?"
            />
            {single && (
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                Fecha seleccionada: <strong className="text-primary">{single.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</strong>
              </div>
            )}
          </div>

          {/* Demo 2: Rango de fechas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-700 font-poppins mb-1">Selección de rango ida + vuelta</h3>
            <p className="text-xs text-gray-400 mb-4">Usado en vuelos, hoteles, paquetes vacaciones.</p>
            <TravelDatePicker
              mode="range"
              label="Salida"
              labelEnd="Regreso"
              value={rangeS}
              valueEnd={rangeE}
              onChange={setRangeS}
              onChangeEnd={setRangeE}
              placeholder="Fecha de salida"
              placeholderEnd="Fecha de regreso"
            />
            {rangeS && rangeE && (
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                <div>Salida: <strong className="text-primary">{rangeS.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</strong></div>
                <div>Regreso: <strong className="text-primary">{rangeE.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</strong></div>
                <div>Duración: <strong className="text-primary">{Math.round((rangeE-rangeS)/86400000)} noches</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* Nota técnica */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
          <h3 className="font-bold text-gray-800 mb-2 font-poppins"><i className="fa fa-folder-open text-primary mr-2"/>Estructura técnica</h3>
          <p className="mb-2">Las fechas especiales se gestionan en <code className="bg-gray-200 px-1 rounded text-xs">src/data/specialDates.js</code> con tres tipos de datos:</p>
          <ul className="space-y-1 text-xs list-none ml-2">
            <li>• <code className="bg-gray-200 px-1 rounded">RECURRING_HOLIDAYS</code> — Festivos que se repiten cada año (clave MM-DD)</li>
            <li>• <code className="bg-gray-200 px-1 rounded">HIGH_SEASON_RANGES</code> — Rangos de temporada alta</li>
            <li>• <code className="bg-gray-200 px-1 rounded">SPECIFIC_OFFERS</code> / <code className="bg-gray-200 px-1 rounded">SPECIFIC_EVENTS</code> — Fechas exactas con año</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">En Fase 2, estas fechas se cargarán dinámicamente desde la API de backend según el destino seleccionado.</p>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
