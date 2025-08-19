'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, MapPin, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Função para máscara de CPF
function maskCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

// Função para máscara de telefone (celular brasileiro)
function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .slice(0, 15);
}

export default function EditProfilePage() {
  const { userProfile, loading, isAuthenticated, updateUserProfile } =
    useAuth();
  const router = useRouter();

  // State for form fields
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cpf, setCpf] = useState(''); // NOVO
  const [photoURL, setPhotoURL] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState(''); // NOVO
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for CEP lookup
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/perfil/editar');
    }
  }, [loading, isAuthenticated, router]);

  // Populate form with user data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setCpf(userProfile.cpf || '');
      setPhotoURL(userProfile.photoURL || '');
      setStreet(userProfile.address?.street || '');
      setStreetNumber(
        userProfile.address?.number !== undefined &&
          userProfile.address?.number !== null
          ? String(userProfile.address.number)
          : '',
      );
      setNeighborhood(userProfile.address?.neighborhood || ''); // NOVO
      setCity(userProfile.address?.city || '');
      setState(userProfile.address?.state || '');
      setZipCode(userProfile.address?.zipCode || '');
      setCountry(userProfile.address?.country || '');
    }
  }, [userProfile]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCepLookup = async (cep: string) => {
    if (cep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Erro na resposta da API');
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado.');
        setErrors((prev) => ({ ...prev, zipCode: 'CEP inválido.' }));
      } else {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || ''); // NOVO
        setCity(data.localidade || '');
        setState(data.uf || '');
        setCountry('Brasil');
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.zipCode;
          return newErrors;
        });
        toast.success('Endereço preenchido!');
      }
    } catch (error) {
      toast.error('Não foi possível buscar o CEP.');
    } finally {
      setIsFetchingCep(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!displayName.trim())
      newErrors.displayName = 'Nome de exibição é obrigatório.';
    if (!firstName.trim()) newErrors.firstName = 'Primeiro nome é obrigatório.';
    if (!cpf.trim()) newErrors.cpf = 'CPF é obrigatório.'; // NOVO
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    let newPhotoURL = photoURL;

    try {
      if (imageFile && userProfile) {
        setIsUploading(true);
        const storageRef = ref(storage, `profile_pictures/${userProfile.uid}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        newPhotoURL = await getDownloadURL(snapshot.ref);
        setIsUploading(false);
      }

      const updatedData = {
        displayName: displayName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        cpf: cpf.trim(), // NOVO
        photoURL: newPhotoURL,
        address: {
          street: street.trim(),
          number: streetNumber.trim(),
          neighborhood: neighborhood.trim(), // NOVO
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
        },
      };

      await updateUserProfile(updatedData);
      toast.success('Perfil atualizado com sucesso!');
      router.push('/perfil');
    } catch (error) {
      toast.error('Ocorreu um erro ao atualizar seu perfil.');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-600">
              Atualize suas informações pessoais e de endereço.
            </p>
          </div>

          <div className="space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={imagePreview || photoURL}
                      alt={displayName}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="photoUpload">Foto de Perfil</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="photoUpload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="photoUpload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Enviando...' : 'Alterar Foto'}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG ou WEBP (Máx 2MB).
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayName">Nome de Exibição *</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={errors.displayName ? 'border-red-500' : ''}
                  />
                  {errors.displayName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Primeiro Nome *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(maskCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? 'border-red-500' : ''}
                  />
                  {errors.cpf && (
                    <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Telefone</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  Endereço
                </CardTitle>
                <CardDescription>
                  Digite seu CEP para preenchimento automático do endereço.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <div className="relative">
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => {
                        const cep = e.target.value.replace(/\D/g, '');
                        setZipCode(cep);
                        if (cep.length === 8) {
                          handleCepLookup(cep);
                        }
                      }}
                      maxLength={8}
                      placeholder="Apenas números"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {isFetchingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-500" />
                    )}
                  </div>
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Preenchido automaticamente"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Preenchido automaticamente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="streetNumber">Número</Label>
                    <Input
                      id="streetNumber"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Preenchido automaticamente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Preenchido automaticamente"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Preenchido automaticamente"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.push('/perfil')}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isUploading}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2 text-white" />
                )}
                <p className="text-white">Salvar Alterações</p>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
