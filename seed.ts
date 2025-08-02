import mongoose from 'mongoose';
import ProductModel from '@/models/Product';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://souzalift:UhUGM16n8rTinvPu@vestiario.krbfvdv.mongodb.net/ovestiario?retryWrites=true&w=majority&appName=vestiario';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

const products = [
  // Premier League
  {
    title: 'Camisa Manchester United 24/25',
    slug: generateSlug('Camisa Manchester United 24/25'),
    description: 'Camisa titular original do Manchester United para a temporada 2024/25.',
    image: '/images/manutd.jpg',
    price: 279.90,
    league: 'Premier League',
    team: 'Manchester United',
  },
  {
    title: 'Camisa Arsenal 24/25',
    slug: generateSlug('Camisa Arsenal 24/25'),
    description: 'Camisa titular original do Arsenal com tecido Climalite.',
    image: '/images/arsenal.jpg',
    price: 269.90,
    league: 'Premier League',
    team: 'Arsenal',
  },
  {
    title: 'Camisa Chelsea 24/25',
    slug: generateSlug('Camisa Chelsea 24/25'),
    description: 'Nova camisa titular do Chelsea com escudo bordado.',
    image: '/images/chelsea.jpg',
    price: 259.90,
    league: 'Premier League',
    team: 'Chelsea',
  },
  {
    title: 'Camisa Liverpool 24/25',
    slug: generateSlug('Camisa Liverpool 24/25'),
    description: 'Camisa original Nike do Liverpool, edição 2024/25.',
    image: '/images/liverpool.jpg',
    price: 289.90,
    league: 'Premier League',
    team: 'Liverpool',
  },

  // La Liga
  {
    title: 'Camisa Real Madrid 24/25',
    slug: generateSlug('Camisa Real Madrid 24/25'),
    description: 'Camisa branca tradicional com detalhes dourados.',
    image: '/images/realmadrid.jpg',
    price: 299.90,
    league: 'La Liga',
    team: 'Real Madrid',
  },
  {
    title: 'Camisa Barcelona 24/25',
    slug: generateSlug('Camisa Barcelona 24/25'),
    description: 'Camisa azul-grená original da temporada atual.',
    image: '/images/barcelona.jpg',
    price: 295.90,
    league: 'La Liga',
    team: 'Barcelona',
  },
  {
    title: 'Camisa Atlético de Madrid 24/25',
    slug: generateSlug('Camisa Atlético de Madrid 24/25'),
    description: 'Camisa original com listras vermelhas e brancas.',
    image: '/images/atletico.jpg',
    price: 269.90,
    league: 'La Liga',
    team: 'Atlético de Madrid',
  },
  {
    title: 'Camisa Sevilla 24/25',
    slug: generateSlug('Camisa Sevilla 24/25'),
    description: 'Camisa branca clássica do Sevilla, nova temporada.',
    image: '/images/sevilla.jpg',
    price: 249.90,
    league: 'La Liga',
    team: 'Sevilla',
  },

  // Serie A
  {
    title: 'Camisa Juventus 24/25',
    slug: generateSlug('Camisa Juventus 24/25'),
    description: 'Camisa zebrada original da Juventus com patch da liga.',
    image: '/images/juventus.jpg',
    price: 279.90,
    league: 'Serie A',
    team: 'Juventus',
  },
  {
    title: 'Camisa Milan 24/25',
    slug: generateSlug('Camisa Milan 24/25'),
    description: 'Camisa vermelha e preta com detalhes dourados.',
    image: '/images/milan.jpg',
    price: 289.90,
    league: 'Serie A',
    team: 'Milan',
  },
  {
    title: 'Camisa Inter de Milão 24/25',
    slug: generateSlug('Camisa Inter de Milão 24/25'),
    description: 'Camisa azul e preta com escudo bordado.',
    image: '/images/inter.jpg',
    price: 289.90,
    league: 'Serie A',
    team: 'Inter de Milão',
  },
  {
    title: 'Camisa Napoli 24/25',
    slug: generateSlug('Camisa Napoli 24/25'),
    description: 'Camisa azul do Napoli com patrocínio estampado.',
    image: '/images/napoli.jpg',
    price: 259.90,
    league: 'Serie A',
    team: 'Napoli',
  },

  // Bundesliga
  {
    title: 'Camisa Bayern de Munique 24/25',
    slug: generateSlug('Camisa Bayern de Munique 24/25'),
    description: 'Camisa tradicional vermelha com escudo em destaque.',
    image: '/images/bayern.jpg',
    price: 299.90,
    league: 'Bundesliga',
    team: 'Bayern de Munique',
  },
  {
    title: 'Camisa Borussia Dortmund 24/25',
    slug: generateSlug('Camisa Borussia Dortmund 24/25'),
    description: 'Camisa amarela com detalhes pretos.',
    image: '/images/dortmund.jpg',
    price: 279.90,
    league: 'Bundesliga',
    team: 'Borussia Dortmund',
  },
  {
    title: 'Camisa RB Leipzig 24/25',
    slug: generateSlug('Camisa RB Leipzig 24/25'),
    description: 'Camisa branca com detalhes em vermelho e cinza.',
    image: '/images/leipzig.jpg',
    price: 249.90,
    league: 'Bundesliga',
    team: 'RB Leipzig',
  },
  {
    title: 'Camisa Bayer Leverkusen 24/25',
    slug: generateSlug('Camisa Bayer Leverkusen 24/25'),
    description: 'Camisa vermelha do atual campeão da Bundesliga.',
    image: '/images/leverkusen.jpg',
    price: 269.90,
    league: 'Bundesliga',
    team: 'Bayer Leverkusen',
  },

  // Brasileirão
  {
    title: 'Camisa Flamengo 24/25',
    slug: generateSlug('Camisa Flamengo 24/25'),
    description: 'Camisa rubro-negra original Adidas.',
    image: '/images/flamengo.jpg',
    price: 249.90,
    league: 'Brasileirão',
    team: 'Flamengo',
  },
  {
    title: 'Camisa Palmeiras 24/25',
    slug: generateSlug('Camisa Palmeiras 24/25'),
    description: 'Camisa verde escura do atual campeão.',
    image: '/images/palmeiras.jpg',
    price: 259.90,
    league: 'Brasileirão',
    team: 'Palmeiras',
  },
  {
    title: 'Camisa Corinthians 24/25',
    slug: generateSlug('Camisa Corinthians 24/25'),
    description: 'Camisa branca com detalhes pretos, versão 2024/25.',
    image: '/images/corinthians.jpg',
    price: 249.90,
    league: 'Brasileirão',
    team: 'Corinthians',
  },
  {
    title: 'Camisa São Paulo 24/25',
    slug: generateSlug('Camisa São Paulo 24/25'),
    description: 'Camisa tricolor do São Paulo FC.',
    image: '/images/saopaulo.jpg',
    price: 249.90,
    league: 'Brasileirão',
    team: 'São Paulo',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing products
    await ProductModel.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert new products
    await ProductModel.insertMany(products);
    console.log('✅ Seed de produtos inserido com sucesso!');
    console.log(`📊 Total products inserted: ${products.length}`);

    process.exit();
  } catch (error) {
    console.error('Erro ao inserir seed:', error);
    process.exit(1);
  }
}

seed();
