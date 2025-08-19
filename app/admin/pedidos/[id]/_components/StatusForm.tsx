'use client';

import { useState } from 'react';

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

export function StatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleStatusChange}
      className="flex items-center gap-2 mt-2"
    >
      <select
        className="border rounded px-2 py-1 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={loading}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Atualizar'}
      </button>
      {success && (
        <span className="text-green-600 text-xs">Status atualizado!</span>
      )}
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </form>
  );
}
