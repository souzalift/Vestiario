// components/checkout/AddressForm.tsx
import { Dispatch, SetStateAction } from 'react';

export interface AddressFormProps {
  deliveryAddress: {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  setDeliveryAddress: Dispatch<
    SetStateAction<{
      zipCode: string;
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
    }>
  >;
  fetchAddressByCep?: (cep: string) => void; // opcional, se você quiser chamar a função de CEP aqui
}

export function AddressForm({
  deliveryAddress,
  setDeliveryAddress,
  fetchAddressByCep,
}: AddressFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="CEP"
          value={deliveryAddress.zipCode}
          onChange={(e) => {
            const value = e.target.value;
            setDeliveryAddress({ ...deliveryAddress, zipCode: value });
            if (fetchAddressByCep && value.replace(/\D/g, '').length === 8) {
              fetchAddressByCep(value);
            }
          }}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Rua"
          value={deliveryAddress.street}
          onChange={(e) =>
            setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
          }
          className="border p-2 rounded w-full md:col-span-2"
        />
        <input
          type="text"
          placeholder="Número"
          value={deliveryAddress.number}
          onChange={(e) =>
            setDeliveryAddress({ ...deliveryAddress, number: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Complemento"
          value={deliveryAddress.complement}
          onChange={(e) =>
            setDeliveryAddress({
              ...deliveryAddress,
              complement: e.target.value,
            })
          }
          className="border p-2 rounded w-full md:col-span-2"
        />
        <input
          type="text"
          placeholder="Bairro"
          value={deliveryAddress.neighborhood}
          onChange={(e) =>
            setDeliveryAddress({
              ...deliveryAddress,
              neighborhood: e.target.value,
            })
          }
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Cidade"
          value={deliveryAddress.city}
          onChange={(e) =>
            setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Estado"
          value={deliveryAddress.state}
          onChange={(e) =>
            setDeliveryAddress({ ...deliveryAddress, state: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>
    </div>
  );
}
export default AddressForm;
