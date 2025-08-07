'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface OrdersParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useOrders(params: OrdersParams = {}) {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    shipped: 0,
    processing: 0,
    pending: 0,
    cancelled: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/orders?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const data = await response.json();
      setOrders(data.orders);
      setStats(data.stats);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, params.status, params.search, params.page, params.limit]);

  return {
    orders,
    stats,
    pagination,
    loading,
    error,
    refetch: fetchOrders
  };
}

export function useOrder(orderId: string) {
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido não encontrado');
        }
        throw new Error('Erro ao buscar pedido');
      }

      const data = await response.json();
      setOrder(data.order);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [user, orderId]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder
  };
}