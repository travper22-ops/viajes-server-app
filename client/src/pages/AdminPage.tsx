// ============================================
// PÁGINA DE ADMINISTRACIÓN
// Panel de control para gestionar caché y contenido
// ============================================

import React from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
}