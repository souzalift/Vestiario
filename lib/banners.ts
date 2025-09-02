// lib/banners.ts

// Define a estrutura de um banner
export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string; // Call to Action text
  link: string;
  gradient: string;
}

// Exporta a lista de banners para ser usada na página inicial
export const siteBanners: Banner[] = [
  {
    id: 1,
    title: 'Lançamentos Épicos 2025/26',
    subtitle: 'Qualidade Tailandesa Premium',
    description: 'Vista a paixão da nova temporada com a mesma qualidade dos uniformes oficiais, por um preço que cabe no seu bolso.',
    image: '/banners/banner1.png', // Certifique-se que esta imagem existe na sua pasta /public
    cta: 'Ver Coleção Completa',
    link: '/#produtos',
    gradient: 'from-black/70 via-black/50 to-transparent',
  },
  // Pode adicionar mais banners aqui no futuro
  // {
  //   id: 2,
  //   title: 'Camisas Históricas',
  //   ...
  // },
];
