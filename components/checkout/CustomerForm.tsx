// components/checkout/CustomerForm.tsx
import { Dispatch, SetStateAction } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CustomerFormProps {
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    document: string;
    birthDate: string;
  };
  setCustomerData: Dispatch<
    SetStateAction<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      document: string;
      birthDate: string;
    }>
  >;
}

export function CustomerForm({
  customerData,
  setCustomerData,
}: CustomerFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Nome"
              value={customerData.firstName}
              onChange={(e) =>
                setCustomerData({
                  ...customerData,
                  firstName: e.target.value,
                })
              }
              className="w-full"
              autoComplete="given-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Sobrenome"
              value={customerData.lastName}
              onChange={(e) =>
                setCustomerData({
                  ...customerData,
                  lastName: e.target.value,
                })
              }
              className="w-full"
              autoComplete="family-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={customerData.email}
              onChange={(e) =>
                setCustomerData({
                  ...customerData,
                  email: e.target.value,
                })
              }
              className="w-full"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              placeholder="Data de Nascimento"
              value={customerData.birthDate}
              onChange={(e) =>
                setCustomerData({
                  ...customerData,
                  birthDate: e.target.value,
                })
              }
              className="w-full"
              autoComplete="bday"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Telefone"
              value={customerData.phone}
              onChange={(e) =>
                setCustomerData({
                  ...customerData,
                  phone: e.target.value,
                })
              }
              className="w-full"
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="document">CPF</Label>
            <Input
              id="document"
              type="text"
              placeholder="CPF"
              value={customerData.document}
              onChange={(e) =>
                setCustomerData({
                  ...customerData,
                  document: e.target.value,
                })
              }
              className="w-full"
              autoComplete="off"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerForm;
