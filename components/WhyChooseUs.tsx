// components/WhyChooseUs.tsx
import { Award, DollarSign, Truck, Shield, Star, Check } from 'lucide-react';

const features = [
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Qualidade AAA+ Garantida',
    description:
      'Utilizamos os mesmos tecidos e tecnologias das camisas oficiais, garantindo conforto e durabilidade.',
    color: 'bg-green-100 text-green-800',
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: 'Preço Justo e Acessível',
    description:
      'A mesma qualidade premium sem os custos de licenciamento. É paixão que cabe no seu bolso.',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'Entrega Rápida e Segura',
    description:
      'Receba as suas novas camisas em todo o Brasil com rastreamento completo e frete grátis a partir de 4 peças.',
    color: 'bg-amber-100 text-amber-800',
  },
];

export default function WhyChooseUs() {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-heading text-primary-900 mb-4 uppercase tracking-wider">
            Por Que Escolher O Vestiário?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A sua paixão pelo futebol merece a melhor qualidade, sem custar uma
            fortuna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 bg-gray-50 rounded-2xl group transition-all duration-300 hover:bg-gray-900 hover:text-white"
            >
              <div
                className={`inline-flex items-center justify-center w-20 h-20 ${feature.color} rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold font-heading text-primary-900 mb-4 group-hover:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
