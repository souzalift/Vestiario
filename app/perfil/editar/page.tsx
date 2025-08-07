'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Camera,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import Image from 'next/image';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  primaryEmailAddress: string;
  primaryPhoneNumber: string;
}

interface Address {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function EditarPerfilPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('pessoal');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form data states
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    primaryEmailAddress: '',
    primaryPhoneNumber: '',
  });

  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Redirect se não estiver logado
  if (isLoaded && !user) {
    redirect('/login');
  }

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        primaryEmailAddress: user.primaryEmailAddress?.emailAddress || '',
        primaryPhoneNumber: user.primaryPhoneNumber?.phoneNumber || '',
      });

      // Carregar endereço do usuário (se existir)
      loadUserAddress();
    }
  }, [user]);

  const loadUserAddress = async () => {
    try {
      const response = await fetch('/api/user/address');
      if (response.ok) {
        const addressData = await response.json();
        if (addressData.address) {
          setAddress(addressData.address);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereço:', error);
    }
  };

  // Handlers
  const handleFormDataChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // CEP lookup
  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    handleAddressChange('zipCode', cleanCep);

    if (cleanCep.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`,
        );
        const data = await response.json();

        if (!data.erro) {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Submit handlers
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Preparar atualizações usando apenas parâmetros válidos do Clerk
      const updates: any = {};

      if (formData.firstName !== user?.firstName) {
        updates.firstName = formData.firstName;
      }

      // Remover lastName - usar apenas firstName
      // O Clerk automaticamente separará o nome completo

      if (formData.username && formData.username !== user?.username) {
        updates.username = formData.username;
      }

      // Atualizar informações básicas
      if (Object.keys(updates).length > 0) {
        await user?.update(updates);
      }

      // Upload de imagem se selecionada
      if (imageFile) {
        await user?.setProfileImage({ file: imageFile });
        setImageFile(null);
        setImagePreview(null);
      }

      // Atualizar telefone separadamente se mudou
      if (
        formData.primaryPhoneNumber &&
        formData.primaryPhoneNumber !== user?.primaryPhoneNumber?.phoneNumber
      ) {
        try {
          await user?.createPhoneNumber({
            phoneNumber: formData.primaryPhoneNumber,
          });
        } catch (phoneError) {
          console.log('Erro ao atualizar telefone:', phoneError);
          // Telefone pode já existir ou ser inválido, não interromper o fluxo
        }
      }

      setMessage({
        type: 'success',
        text: 'Informações pessoais atualizadas com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      setMessage({
        type: 'error',
        text:
          error.errors?.[0]?.message ||
          error.message ||
          'Erro ao atualizar informações',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Endereço atualizado com sucesso!',
        });
      } else {
        throw new Error('Erro ao salvar endereço');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao atualizar endereço',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'A nova senha deve ter pelo menos 8 caracteres',
      });
      setLoading(false);
      return;
    }

    try {
      await user?.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setMessage({
        type: 'error',
        text:
          error.errors?.[0]?.message ||
          error.message ||
          'Erro ao alterar senha',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/perfil"
              className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao perfil
            </Link>

            <h1 className="text-3xl font-bold text-primary-900">
              Editar Perfil
            </h1>
            <p className="text-gray-600 mt-1">
              Atualize suas informações pessoais e configurações
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'pessoal', name: 'Informações Pessoais', icon: User },
                { id: 'endereco', name: 'Endereço', icon: MapPin },
                { id: 'senha', name: 'Senha', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-800 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm">
            {activeTab === 'pessoal' && (
              <PersonalInfoForm
                user={user}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                imagePreview={imagePreview}
                onSubmit={handlePersonalInfoSubmit}
                loading={loading}
              />
            )}

            {activeTab === 'endereco' && (
              <AddressForm
                address={address}
                onAddressChange={handleAddressChange}
                onCepChange={handleCepChange}
                onSubmit={handleAddressSubmit}
                loading={loading}
              />
            )}

            {activeTab === 'senha' && (
              <PasswordForm
                passwordData={passwordData}
                onPasswordChange={handlePasswordChange}
                showPasswords={showPasswords}
                setShowPasswords={setShowPasswords}
                onSubmit={handlePasswordSubmit}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Personal Info Form Component
function PersonalInfoForm({
  user,
  formData,
  onFormDataChange,
  onImageChange,
  onImageRemove,
  imagePreview,
  onSubmit,
  loading,
}: any) {
  return (
    <form onSubmit={onSubmit} className="p-8">
      <h2 className="text-2xl font-bold text-primary-900 mb-6">
        Informações Pessoais
      </h2>

      {/* Profile Image */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Foto do Perfil
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {imagePreview ? (
                <Image
                  width={96}
                  height={96}
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : user?.imageUrl ? (
                <Image
                  width={96}
                  height={96}
                  src={user.imageUrl}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-medium cursor-pointer transition-colors"
            >
              <Camera className="w-4 h-4" />
              Alterar Foto
            </label>
            <p className="text-sm text-gray-500 mt-2">PNG, JPG até 10MB</p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onFormDataChange('firstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            placeholder="Digite seu nome completo"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            O Clerk gerenciará automaticamente nome e sobrenome
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome de Usuário
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => onFormDataChange('username', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            placeholder="Escolha um nome de usuário"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.primaryEmailAddress}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              disabled
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Para alterar o e-mail, use as configurações do Clerk
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.primaryPhoneNumber}
              onChange={(e) =>
                onFormDataChange('primaryPhoneNumber', e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Formato: (11) 99999-9999 ou +5511999999999
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-800 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}

// Address Form Component
function AddressForm({
  address,
  onAddressChange,
  onCepChange,
  onSubmit,
  loading,
}: any) {
  return (
    <form onSubmit={onSubmit} className="p-8">
      <h2 className="text-2xl font-bold text-primary-900 mb-6">Endereço</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP *
          </label>
          <input
            type="text"
            value={address.zipCode}
            onChange={(e) => onCepChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            placeholder="00000-000"
            maxLength={8}
            required
          />
        </div>

        <div></div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rua *
          </label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onAddressChange('street', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número *
          </label>
          <input
            type="text"
            value={address.number}
            onChange={(e) => onAddressChange('number', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complemento
          </label>
          <input
            type="text"
            value={address.complement}
            onChange={(e) => onAddressChange('complement', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            placeholder="Apartamento, bloco, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro *
          </label>
          <input
            type="text"
            value={address.neighborhood}
            onChange={(e) => onAddressChange('neighborhood', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade *
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            value={address.state}
            onChange={(e) => onAddressChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
            required
          >
            <option value="">Selecione...</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-800 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {loading ? 'Salvando...' : 'Salvar Endereço'}
      </button>
    </form>
  );
}

// Password Form Component
function PasswordForm({
  passwordData,
  onPasswordChange,
  showPasswords,
  setShowPasswords,
  onSubmit,
  loading,
}: any) {
  return (
    <form onSubmit={onSubmit} className="p-8">
      <h2 className="text-2xl font-bold text-primary-900 mb-6">
        Alterar Senha
      </h2>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha Atual *
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) =>
                onPasswordChange('currentPassword', e.target.value)
              }
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords(
                  (prev: {
                    current: boolean;
                    new: boolean;
                    confirm: boolean;
                  }) => ({
                    ...prev,
                    current: !prev.current,
                  }),
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova Senha *
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => onPasswordChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords(
                  (prev: {
                    current: boolean;
                    new: boolean;
                    confirm: boolean;
                  }) => ({ ...prev, new: !prev.new }),
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nova Senha *
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                onPasswordChange('confirmPassword', e.target.value)
              }
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords(
                  (prev: {
                    current: boolean;
                    new: boolean;
                    confirm: boolean;
                  }) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }),
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-800 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Shield className="w-4 h-4" />
        )}
        {loading ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </form>
  );
}

// Loading Skeleton
function EditProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-200 rounded-2xl h-16 animate-pulse mb-8"></div>
          <div className="bg-gray-200 rounded-2xl h-16 animate-pulse mb-8"></div>
          <div className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
