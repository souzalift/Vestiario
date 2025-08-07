'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  CreditCard,
  ArrowRight,
  Download,
  Share2,
  Home,
  ShoppingBag,
} from 'lucide-react';

interface OrderDetails {
  orderNumber: string;
  items: any[];
  total: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
}

export default function SucessoPedidoPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      try {
        // Tentar carregar do localStorage primeiro (dados mais completos)
        const lastOrder = localStorage.getItem('lastOrder');
        if (lastOrder) {
          const orderData = JSON.parse(lastOrder);
          if (orderData.orderNumber === orderNumber) {
            setOrderDetails({
              orderNumber: orderData.orderNumber,
              items: orderData.items,
              total: orderData.total,
              customerInfo: orderData.customerInfo,
              shippingAddress: orderData.shippingAddress,
              createdAt: new Date().toISOString(),
            });
            localStorage.removeItem('lastOrder'); // Limpar após uso
            setLoading(false);
            return;
          }
        }

        // Se não encontrar no localStorage, buscar da API pública
        const response = await fetch(`/api/orders/public/${orderNumber}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.order);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderNumber]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.number}${
      address.complement ? `, ${address.complement}` : ''
    } - ${address.neighborhood}, ${address.city}/${address.state} - CEP: ${
      address.zipCode
    }`;
  };

  if (loading) {
    return <SucessoSkeleton />;
  }

  if (!orderNumber) {
    return <SucessoError message="Número do pedido não encontrado" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de Sucesso */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pedido Realizado com Sucesso!
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Obrigado pela sua compra! Seu pedido foi processado e você
              receberá uma confirmação por email em breve.
            </p>
          </div>

          {/* Informações do Pedido */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pedido #{orderNumber}
                </h2>
                <p className="text-sm text-gray-600">
                  Realizado em{' '}
                  {new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Pedido #${orderNumber}`,
                        text: `Meu pedido O Vestiário #${orderNumber}`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
              </div>
            </div>

            {/* Status do Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">
                    Pedido Confirmado
                  </p>
                  <p className="text-xs text-green-700">Agora mesmo</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Pagamento</p>
                  <p className="text-xs text-blue-700">Processando</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Preparação</p>
                  <p className="text-xs text-gray-700">Em breve</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Envio</p>
                  <p className="text-xs text-gray-700">Em breve</p>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            {orderDetails && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Itens do Pedido
                </h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Tamanho: {item.size} • Quantidade: {item.quantity}
                        </p>
                        {item.customization?.name && (
                          <p className="text-sm text-gray-600">
                            Nome: {item.customization.name}
                          </p>
                        )}
                        {item.customization?.number && (
                          <p className="text-sm text-gray-600">
                            Número: {item.customization.number}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} cada
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo de Valores */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {formatPrice(
                        orderDetails.items.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Frete</span>
                    <span className="text-green-600 font-medium">Grátis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {formatPrice(orderDetails.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informações de Entrega */}
          {orderDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Endereço de Entrega
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {orderDetails.customerInfo.name}
                  </p>
                  <p>{formatAddress(orderDetails.shippingAddress)}</p>
                  <p>Telefone: {orderDetails.customerInfo.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Previsão de Entrega
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">5 a 10 dias úteis</p>
                  <p>
                    Estimativa:{' '}
                    {new Date(
                      Date.now() + 10 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    Você receberá o código de rastreamento por email assim que o
                    pedido for enviado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Próximos Passos */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">
              O que acontece agora?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Confirmação por Email
                  </h4>
                  <p className="text-sm text-gray-600">
                    Você receberá um email com todos os detalhes do seu pedido.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Preparação do Pedido
                  </h4>
                  <p className="text-sm text-gray-600">
                    Nossa equipe irá separar e embalar seus produtos com
                    cuidado.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Envio e Rastreamento
                  </h4>
                  <p className="text-sm text-gray-600">
                    Você receberá o código de rastreamento para acompanhar a
                    entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-800 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors">
                <Home className="w-4 h-4" />
                Voltar à Loja
              </button>
            </Link>
            <Link href="/perfil/pedidos">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                <ShoppingBag className="w-4 h-4" />
                Meus Pedidos
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Loading Skeleton
function SucessoSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="w-64 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="w-96 h-6 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="bg-white rounded-2xl p-6 mb-8">
            <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componente de Erro
function SucessoError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ops!</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link href="/">
              <button className="bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium">
                Voltar à Loja
              </button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
