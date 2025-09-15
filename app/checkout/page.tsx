'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { generateOrderNumber } from '@/services/orders';
import { fetchAddressFromCep } from '@/utils/viacep';
import {
  CustomerForm,
  OrderSummary,
  TermsAndPrivacy,
  AddressForm,
} from '@/components/checkout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Interfaces
interface DeliveryAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items: cartItems,
    cartCount,
    subtotal,
    totalCustomizationFee,
    shippingPrice,
    totalPrice,
    discountAmount,
    clearCart,
  } = useCart();
  const { userProfile, loading: authLoading, updateUserProfile } = useAuth();

  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
  });
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [ignoreCartEmptyRedirect, setIgnoreCartEmptyRedirect] = useState(false);

  const errorRef = useRef<HTMLDivElement | null>(null);

  // Proteção de rota: redireciona se não estiver logado
  useEffect(() => {
    if (!authLoading && !userProfile?.uid) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  }, [authLoading, userProfile, router]);

  // Preenchimento automático dos dados
  useEffect(() => {
    if (!authLoading && userProfile) {
      setCustomerData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phoneNumber || '',
        document: userProfile.cpf || '',
        birthDate: userProfile.birthDate || '',
      });
      if (userProfile.address) {
        setDeliveryAddress({
          zipCode: userProfile.address.zipCode || '',
          street: userProfile.address.street || '',
          number: userProfile.address.number || '',
          complement: userProfile.address.complement || '',
          neighborhood: userProfile.address.neighborhood || '',
          city: userProfile.address.city || '',
          state: userProfile.address.state || '',
        });
      }
      setTimeout(() => {
        toast.info('Seus dados foram preenchidos automaticamente.');
      }, 500);
    }
  }, [userProfile, authLoading]);

  // Verifica se o carrinho está vazio
  useEffect(() => {
    setIsClient(true);
    if (cartCount === 0 && !ignoreCartEmptyRedirect) {
      toast.error('Seu carrinho está vazio!');
      router.push('/');
    }
  }, [cartCount, router, ignoreCartEmptyRedirect]);

  const validateForm = () => {
    const errors: string[] = [];
    if (!customerData.firstName.trim()) errors.push('Nome é obrigatório');
    if (!customerData.lastName.trim()) errors.push('Sobrenome é obrigatório');
    if (!customerData.email.trim()) errors.push('Email é obrigatório');
    if (!customerData.phone.trim()) errors.push('Telefone é obrigatório');
    if (!customerData.document.trim()) errors.push('CPF é obrigatório');
    if (!deliveryAddress.zipCode.trim()) errors.push('CEP é obrigatório');
    if (!deliveryAddress.street.trim()) errors.push('Rua é obrigatória');
    if (!deliveryAddress.number.trim()) errors.push('Número é obrigatório');
    if (!deliveryAddress.neighborhood.trim())
      errors.push('Bairro é obrigatório');
    if (!deliveryAddress.city.trim()) errors.push('Cidade é obrigatória');
    if (!deliveryAddress.state.trim()) errors.push('Estado é obrigatório');
    if (!acceptedTerms) errors.push('Aceite os termos de uso');
    if (!acceptedPrivacy) errors.push('Aceite a política de privacidade');
    return errors;
  };

  const processPayment = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      errorRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!userProfile?.uid) {
      toast.error('Usuário não autenticado.');
      return;
    }

    setProcessingPayment(true);

    try {
      await updateUserProfile({
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phoneNumber: customerData.phone,
        cpf: customerData.document,
        address: deliveryAddress,
        birthDate: customerData.birthDate,
      });

      const orderPayload = {
        userId: userProfile.uid,
        customer: customerData,
        address: deliveryAddress,
        notes: orderNotes,
        items: cartItems,
        subtotal,
        totalCustomizationFee,
        shippingPrice,
        totalPrice,
        status: 'pending',
        orderNumber: generateOrderNumber(),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido');

      if (data.init_point) {
        setIgnoreCartEmptyRedirect(true);
        clearCart();
        window.location.href = data.init_point;
      } else {
        toast.error('Não foi possível iniciar o pagamento.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  async function handleFetchAddressByCep(cep: string) {
    try {
      const data = await fetchAddressFromCep(cep);
      setDeliveryAddress((prev) => ({
        ...prev,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      }));
    } catch {
      toast.error('CEP inválido ou não encontrado.');
    }
  }

  if (!isClient || cartCount === 0 || authLoading || !userProfile?.uid) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pt-16 sm:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Finalizar Compra
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Revise seus dados e finalize seu pedido
              </p>
            </div>
            <Link
              href="/carrinho"
              aria-label="Voltar ao carrinho"
              className="w-full sm:w-auto inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Carrinho
            </Link>
          </div>

          {/* ALERTA DE ERROS */}
          {formErrors.length > 0 && (
            <div ref={errorRef} className="mb-6">
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 flex items-start gap-2 shadow-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Verifique os campos abaixo:</p>
                  <ul className="list-disc ml-5 mt-1 text-sm space-y-0.5">
                    {formErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <CustomerForm
                customerData={customerData}
                setCustomerData={setCustomerData}
              />
              <AddressForm
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                fetchAddressByCep={handleFetchAddressByCep}
              />
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Observações do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    placeholder="Alguma informação especial sobre a entrega..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded p-2 mt-1 text-sm sm:text-base"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {orderNotes.length}/500 caracteres
                  </p>
                </CardContent>
              </Card>
              <TermsAndPrivacy
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                acceptedPrivacy={acceptedPrivacy}
                setAcceptedPrivacy={setAcceptedPrivacy}
              />
            </div>

            {/* Resumo do Pedido */}
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              discountAmount={discountAmount}
              totalCustomizationFee={totalCustomizationFee}
              shippingPrice={shippingPrice}
              totalPrice={totalPrice}
              processingPayment={processingPayment}
              onPay={processPayment}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
