'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  X,
  Upload,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface FormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
}

interface Address {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Preferences {
  newsletter: boolean;
  notifications: boolean;
  favoriteTeams: string[];
}

export default function EditarPerfilPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    userProfile,
    updateUserProfile,
    loading: profileLoading,
  } = useUserProfile();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoal');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form data states
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
  });

  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState<Preferences>({
    newsletter: true,
    notifications: true,
    favoriteTeams: [],
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Redirect se não estiver logado
  useEffect(() => {
    if (!profileLoading && !isAuthenticated) {
      toast.error('Você precisa estar logado para acessar esta página');
      router.push('/login');
    }
  }, [isAuthenticated, profileLoading, router]);

  // Carregar dados do usuário quando disponível
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        displayName: userProfile.displayName || '',
        phoneNumber: userProfile.phoneNumber || '',
      });

      setAddress({
        street: userProfile.address?.street || '',
        number: (userProfile.address as any)?.number || '',
        complement: (userProfile.address as any)?.complement || '',
        neighborhood: (userProfile.address as any)?.neighborhood || '',
        city: userProfile.address?.city || '',
        state: userProfile.address?.state || '',
        zipCode: userProfile.address?.zipCode || '',
        country: userProfile.address?.country || 'Brasil',
      });

      setPreferences({
        newsletter: userProfile.preferences?.newsletter ?? true,
        notifications: userProfile.preferences?.notifications ?? true,
        favoriteTeams: userProfile.preferences?.favoriteTeams || [],
      });
    }
  }, [userProfile]);

  // Handlers
  const handleFormDataChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: keyof Preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }

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

  // CEP lookup usando ViaCEP
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
          toast.success('CEP encontrado!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP');
      }
    }
  };

  // Upload de imagem para Firebase Storage (simulado)
  const uploadImage = async (file: File): Promise<string> => {
    // Aqui você implementaria o upload real para Firebase Storage
    // Por enquanto, vamos simular com base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Submit handlers
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📝 Atualizando informações pessoais...');

      // Preparar dados para atualização
      const updates: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName:
          formData.displayName ||
          `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phoneNumber,
      };

      // Upload de imagem se selecionada
      if (imageFile) {
        console.log('📷 Fazendo upload da imagem...');
        const photoURL = await uploadImage(imageFile);
        updates.photoURL = photoURL;

        // Atualizar também no Firebase Auth
        if (user) {
          await updateProfile(user, { photoURL });
        }
      }

      // Atualizar perfil
      await updateUserProfile(updates);

      // Atualizar displayName no Firebase Auth se mudou
      if (user && updates.displayName !== user.displayName) {
        await updateProfile(user, { displayName: updates.displayName });
      }

      setImageFile(null);
      setImagePreview(null);
      toast.success('Informações pessoais atualizadas com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar informações:', error);
      toast.error(error.message || 'Erro ao atualizar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🏠 Atualizando endereço...');

      await updateUserProfile({
        address: {
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        },
      });

      toast.success('Endereço atualizado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar endereço:', error);
      toast.error(error.message || 'Erro ao atualizar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (!user || !user.email) {
      toast.error('Usuário não encontrado');
      setLoading(false);
      return;
    }

    try {
      console.log('🔒 Alterando senha...');

      // Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword,
      );

      await reauthenticateWithCredential(user, credential);

      // Atualizar senha
      await updatePassword(user, passwordData.newPassword);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Senha alterada com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);

      if (error.code === 'auth/wrong-password') {
        toast.error('Senha atual incorreta');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A nova senha é muito fraca');
      } else {
        toast.error(
          'Erro ao alterar senha: ' + (error.message || 'Erro desconhecido'),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('⚙️ Atualizando preferências...');

      await updateUserProfile({
        preferences: {
          newsletter: preferences.newsletter,
          notifications: preferences.notifications,
          favoriteTeams: preferences.favoriteTeams,
        },
      });

      toast.success('Preferências atualizadas com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar preferências:', error);
      toast.error(error.message || 'Erro ao atualizar preferências');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (profileLoading || !isAuthenticated) {
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
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao perfil
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-600 mt-1">
              Atualize suas informações pessoais e configurações
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'pessoal', name: 'Informações Pessoais', icon: User },
                { id: 'endereco', name: 'Endereço', icon: MapPin },
                { id: 'senha', name: 'Senha', icon: Shield },
                { id: 'preferencias', name: 'Preferências', icon: AlertCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white shadow-lg'
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
                userProfile={userProfile}
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

            {activeTab === 'preferencias' && (
              <PreferencesForm
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                onSubmit={handlePreferencesSubmit}
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
  userProfile,
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Informações Pessoais
      </h2>

      {/* Profile Image */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Foto do Perfil
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {imagePreview ? (
                <Image
                  width={96}
                  height={96}
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : userProfile?.photoURL ? (
                <Image
                  width={96}
                  height={96}
                  src={userProfile.photoURL}
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
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer transition-colors"
            >
              <Camera className="w-4 h-4" />
              Alterar Foto
            </label>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG ou WEBP até 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onFormDataChange('firstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="Digite seu nome"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sobrenome *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onFormDataChange('lastName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="Digite seu sobrenome"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome de Exibição
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => onFormDataChange('displayName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="Como você quer ser chamado?"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se vazio, será usado "Nome + Sobrenome"
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={userProfile?.email || user?.email || ''}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              disabled
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Para alterar o e-mail, entre em contato com o suporte
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => onFormDataChange('phoneNumber', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-gray-900 mb-3">Status da Conta</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {user?.emailVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  E-mail verificado
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  E-mail não verificado
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Membro desde{' '}
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt.toDate()).getFullYear()
                : new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Endereço</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP *
          </label>
          <input
            type="text"
            value={address.zipCode}
            onChange={(e) => onCepChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="00000-000"
            maxLength={8}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Digite o CEP para preenchimento automático
          </p>
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="Nome da rua"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="123"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="Nome do bairro"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
            placeholder="Nome da cidade"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
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
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Alterar Senha</h2>

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
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
              placeholder="Digite sua senha atual"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords((prev: any) => ({
                  ...prev,
                  current: !prev.current,
                }))
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
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
              placeholder="Digite sua nova senha"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords((prev: any) => ({
                  ...prev,
                  new: !prev.new,
                }))
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
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
              placeholder="Confirme sua nova senha"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords((prev: any) => ({
                  ...prev,
                  confirm: !prev.confirm,
                }))
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

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Importante</span>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          Após alterar a senha, você será desconectado de todos os dispositivos.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
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

// Preferences Form Component
function PreferencesForm({
  preferences,
  onPreferenceChange,
  onSubmit,
  loading,
}: any) {
  const teams = [
    'Flamengo',
    'Corinthians',
    'Palmeiras',
    'São Paulo',
    'Santos',
    'Vasco',
    'Grêmio',
    'Internacional',
    'Cruzeiro',
    'Atlético-MG',
    'Botafogo',
    'Fluminense',
  ];

  return (
    <form onSubmit={onSubmit} className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferências</h2>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Comunicação
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={(e) =>
                  onPreferenceChange('newsletter', e.target.checked)
                }
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <div>
                <span className="font-medium text-gray-900">Newsletter</span>
                <p className="text-sm text-gray-600">
                  Receber ofertas e novidades por e-mail
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) =>
                  onPreferenceChange('notifications', e.target.checked)
                }
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <div>
                <span className="font-medium text-gray-900">Notificações</span>
                <p className="text-sm text-gray-600">
                  Receber notificações sobre pedidos e atualizações
                </p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Times Favoritos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {teams.map((team) => (
              <label key={team} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.favoriteTeams.includes(team)}
                  onChange={(e) => {
                    const newTeams = e.target.checked
                      ? [...preferences.favoriteTeams, team]
                      : preferences.favoriteTeams.filter(
                          (t: string) => t !== team,
                        );
                    onPreferenceChange('favoriteTeams', newTeams);
                  }}
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <span className="text-sm text-gray-900">{team}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selecionando seus times favoritos, você receberá ofertas
            personalizadas
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {loading ? 'Salvando...' : 'Salvar Preferências'}
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
          <div className="space-y-4 mb-8">
            <div className="bg-gray-200 rounded h-6 w-32 animate-pulse"></div>
            <div className="bg-gray-200 rounded h-8 w-64 animate-pulse"></div>
            <div className="bg-gray-200 rounded h-4 w-96 animate-pulse"></div>
          </div>
          <div className="bg-gray-200 rounded-2xl h-16 animate-pulse mb-8"></div>
          <div className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
