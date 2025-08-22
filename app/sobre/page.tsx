// app/sobre-nos/page.tsx
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história e a paixão do O Vestiário pelo futebol.',
};

export default function SobreNosPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">
            A Nossa História
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Mais que uma Loja, uma Paixão
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
            O Vestiário nasceu da paixão que une milhões de pessoas: o amor pelo
            futebol. Somos um ponto de encontro para adeptos que, como nós,
            vibram a cada golo e carregam o orgulho do seu clube no peito.
          </p>
        </div>

        <div className="mt-16 bg-gray-50 p-8 rounded-2xl border border-gray-200">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
            A Nossa Missão
          </h2>
          <p className="text-gray-600 leading-7">
            A nossa missão é simples: oferecer acesso a camisas de futebol
            tailandesas da mais alta qualidade, com um acabamento impecável que
            honra as cores e os emblemas que tanto amamos. Sabemos que a camisa
            de um clube é uma segunda pele, um símbolo de identidade e pertença.
            Por isso, cada peça que selecionamos é produzida com os melhores
            materiais, garantindo conforto, durabilidade e um visual idêntico ao
            que os seus ídolos usam em campo.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Qualidade e Confiança
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-center text-gray-600 leading-7">
            Entendemos a importância da confiança. É por isso que somos
            transparentes sobre a origem dos nossos produtos e garantimos um
            processo de compra seguro, com um atendimento ao cliente sempre
            pronto para ajudar. No Vestiário, você não compra apenas uma camisa,
            você investe numa experiência.
          </p>
          <p className="mt-6 text-center text-lg font-semibold text-gray-800">
            Junte-se à nossa comunidade e vista a sua paixão. Bem-vindo ao
            Vestiário.
          </p>
        </div>
      </div>
    </div>
  );
}
