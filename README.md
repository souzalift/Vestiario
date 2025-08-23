# O Vestiário - E-commerce de Camisas Tailandesas

Bem-vindo ao repositório do "O Vestiário", uma loja virtual especializada em camisas de futebol de alta qualidade. Este projeto foi desenvolvido com uma stack moderna para oferecer uma experiência de compra fluida e uma gestão eficiente da loja.

## 🚀 Funcionalidades

O projeto é dividido em duas grandes áreas de funcionalidade: a loja para o cliente e o painel administrativo.

### Funcionalidades para o Cliente

- **Catálogo de Produtos:** Navegação por uma galeria de produtos com busca e filtros por ligas e times.
- **Detalhes do Produto:** Página dedicada para cada camisa com múltiplos ângulos, descrição, seleção de tamanho e opção de personalização/page.tsx].
- **Carrinho de Compras:** Sistema completo para adicionar, remover e gerenciar itens. Inclui cálculo de frete dinâmâmico com frete grátis para 4 ou mais produtos.
- **Checkout Seguro:** Processo de finalização de compra integrado com o Mercado Pago, aceitando PIX, Boleto e Cartão de Crédito.
- **Autenticação de Usuário:** Login com e-mail/senha ou Google, com recuperação de senha e área de perfil para gerenciar dados e pedidos.
- **Rastreamento de Pedido:** Página para consulta de status de entrega com o código do pedido.

### Funcionalidades do Painel Administrativo

- **Dashboard de Métricas:** Visualize rapidamente o faturamento, número de pedidos e ticket médio.
- **Gerenciamento de Produtos:** Crie, edite e remova produtos com facilidade. Inclui upload de imagens para o Firebase Storage/edit/page.tsx, souzalift/vestiario/Vestiario-bdbf59bc3fea67289d23d59137383d8815671bb9/components/ImageUpload.tsx].
- **Gerenciamento de Pedidos:** Acompanhe, visualize e edite o status de todos os pedidos dos clientes/edit/page.tsx].
- **Gerenciamento de Usuários:** Gerencie permissões de usuários (admin/usuário) na plataforma.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**

  - [**Next.js**](https://nextjs.org/) (versão 14.2.32)
  - [**React**](https://react.dev/)
  - [**TypeScript**](https://www.typescriptlang.org/)
  - [**Tailwind CSS**](https://tailwindcss.com/)
  - [**Shadcn/UI**](https://ui.shadcn.com/) para componentes de interface.

- **Backend & Banco de Dados:**

  - [**Firebase**](https://firebase.google.com/): Firestore, Firebase Auth e Firebase Storage.

- **Pagamentos:**
  - [**Mercado Pago**](https://www.mercadopago.com.br/) para processamento de pagamentos.

---

## 📁 Estrutura de Diretórios

- `app/`: Contém as páginas da aplicação, API routes e layouts do Next.js.
- `components/`: Componentes React reutilizáveis, como o `Header`, `Footer` e `ProductCard`.
- `contexts/`: Contextos do React para gerenciamento de estado global (autenticação, carrinho e favoritos).
- `hooks/`: Hooks personalizados para lógica específica, como gerenciamento de permissões de admin.
- `lib/`: Arquivos de configuração e utilitários, como a inicialização do Firebase e funções de ajuda.
- `services/`: Lógica de negócios para comunicação com o Firestore, separada dos componentes.
- `public/`: Ativos estáticos, como imagens e ícones.

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
