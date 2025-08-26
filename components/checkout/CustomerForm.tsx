// components/checkout/CustomerForm.tsx
import { Dispatch, SetStateAction } from 'react';

export interface CustomerFormProps {
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    document: string;
  };
  setCustomerData: Dispatch<
    SetStateAction<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      document: string;
    }>
  >;
}

export function CustomerForm({
  customerData,
  setCustomerData,
}: CustomerFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dados do Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={customerData.firstName}
          onChange={(e) =>
            setCustomerData({ ...customerData, firstName: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Sobrenome"
          value={customerData.lastName}
          onChange={(e) =>
            setCustomerData({ ...customerData, lastName: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={customerData.email}
          onChange={(e) =>
            setCustomerData({ ...customerData, email: e.target.value })
          }
          className="border p-2 rounded w-full md:col-span-2"
        />
        <input
          type="tel"
          placeholder="Telefone"
          value={customerData.phone}
          onChange={(e) =>
            setCustomerData({ ...customerData, phone: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="CPF"
          value={customerData.document}
          onChange={(e) =>
            setCustomerData({ ...customerData, document: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>
    </div>
  );
}

export default CustomerForm;
