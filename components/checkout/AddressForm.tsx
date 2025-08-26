// components/checkout/AddressForm.tsx
import { Dispatch, SetStateAction } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  fetchAddressByCep?: (cep: string) => void;
}

export function AddressForm({
  deliveryAddress,
  setDeliveryAddress,
  fetchAddressByCep,
}: AddressFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço de Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              type="text"
              placeholder="CEP"
              value={deliveryAddress.zipCode}
              onChange={(e) => {
                const value = e.target.value;
                setDeliveryAddress({ ...deliveryAddress, zipCode: value });
                if (
                  fetchAddressByCep &&
                  value.replace(/\D/g, '').length === 8
                ) {
                  fetchAddressByCep(value);
                }
              }}
              className="w-full"
              autoComplete="postal-code"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              type="text"
              placeholder="Rua"
              value={deliveryAddress.street}
              onChange={(e) =>
                setDeliveryAddress({
                  ...deliveryAddress,
                  street: e.target.value,
                })
              }
              className="w-full"
              autoComplete="address-line1"
            />
          </div>
          <div>
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              type="text"
              placeholder="Número"
              value={deliveryAddress.number}
              onChange={(e) =>
                setDeliveryAddress({
                  ...deliveryAddress,
                  number: e.target.value,
                })
              }
              className="w-full"
              autoComplete="address-line2"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              type="text"
              placeholder="Complemento"
              value={deliveryAddress.complement}
              onChange={(e) =>
                setDeliveryAddress({
                  ...deliveryAddress,
                  complement: e.target.value,
                })
              }
              className="w-full"
              autoComplete="address-line3"
            />
          </div>
          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              type="text"
              placeholder="Bairro"
              value={deliveryAddress.neighborhood}
              onChange={(e) =>
                setDeliveryAddress({
                  ...deliveryAddress,
                  neighborhood: e.target.value,
                })
              }
              className="w-full"
              autoComplete="address-level2"
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              type="text"
              placeholder="Cidade"
              value={deliveryAddress.city}
              onChange={(e) =>
                setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
              }
              className="w-full"
              autoComplete="address-level2"
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              type="text"
              placeholder="Estado"
              value={deliveryAddress.state}
              onChange={(e) =>
                setDeliveryAddress({
                  ...deliveryAddress,
                  state: e.target.value,
                })
              }
              className="w-full"
              autoComplete="address-level1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default AddressForm;
