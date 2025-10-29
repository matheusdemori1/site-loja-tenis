# 🏪 Novita - E-commerce de Tênis Esportivos

Site moderno de e-commerce especializado em tênis esportivos com painel administrativo completo.

## 🚀 Funcionalidades

### 🛍️ Loja Online
- **Design Moderno**: Interface escura e profissional inspirada nas melhores lojas de tênis
- **Catálogo Completo**: Visualização de produtos com filtros por marca e categoria
- **Busca Inteligente**: Barra de pesquisa para encontrar produtos rapidamente
- **Hero Carousel**: Seção principal com slides promocionais automáticos
- **WhatsApp Integration**: Botão direto para contato via WhatsApp com informações do produto
- **Responsivo**: Funciona perfeitamente em mobile, tablet e desktop

### 🔧 Painel Administrativo
- **Login Seguro**: Sistema de autenticação com Supabase Auth
- **Gerenciamento de Produtos**: CRUD completo para produtos
- **Gerenciamento de Marcas**: Adicionar, editar e remover marcas
- **Gerenciamento de Categorias**: Controle total das categorias
- **Dashboard**: Estatísticas em tempo real
- **Múltiplas Cores**: Sistema para adicionar várias cores por produto
- **Upload de Imagens**: Suporte para imagens de produtos

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

## 📦 Configuração

### 1. Configurar Supabase

1. **Conecte sua conta Supabase**:
   - Vá em Configurações do Projeto → Integrações
   - Clique em "Conectar Supabase"
   - Autorize a integração

2. **Execute os scripts SQL**:
   ```sql
   -- 1. Execute database-setup.sql no SQL Editor
   -- 2. Execute sample-products.sql no SQL Editor  
   -- 3. Execute create-admin-user.sql no SQL Editor
   ```

### 2. Credenciais de Admin

**Login do Painel**: `/admin`
- **Email**: admin@novita.com
- **Senha**: admin123

### 3. Configurar WhatsApp

Edite o número do WhatsApp em `src/lib/supabase.ts`:
```typescript
const whatsappNumber = "5511999999999"; // Substitua pelo seu número
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx          # Login do admin
│   │   └── dashboard/
│   │       └── page.tsx      # Dashboard principal
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página inicial (loja)
├── components/
│   └── admin/                # Componentes do admin
├── lib/
│   └── supabase.ts          # Configuração do Supabase
└── ...
```

## 🗄️ Estrutura do Banco

### Tabelas Principais
- **products**: Produtos com cores, tamanhos e estoque
- **brands**: Marcas dos produtos
- **categories**: Categorias de produtos
- **auth.users**: Usuários administrativos

### Relacionamentos
- Produtos → Marcas (string reference)
- Produtos → Categorias (string reference)
- Suporte a múltiplas cores e tamanhos por produto

## 🎨 Design System

### Cores Principais
- **Primary**: Orange (#F97316)
- **Secondary**: Green (#16A34A)
- **Background**: Black/Gray-900
- **Text**: White/Gray-100
- **Cards**: Gray-800/Gray-900

### Componentes
- **Cards de Produto**: Hover effects, badges, botões WhatsApp
- **Filtros**: Botões interativos por categoria e marca
- **Hero Section**: Carousel automático com indicadores
- **Header**: Logo, navegação, busca e ícones

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Grid Responsivo**: 1-2-3-4 colunas conforme tela
- **Navegação Mobile**: Menu adaptativo

## 🔒 Segurança

- **RLS Habilitado**: Row Level Security no Supabase
- **Autenticação**: Supabase Auth com JWT
- **Políticas Permissivas**: Para desenvolvimento (ajuste para produção)
- **Validação**: Frontend e backend

## 🚀 Deploy

O projeto está pronto para deploy no Vercel:

1. **Push para GitHub**
2. **Conecte no Vercel**
3. **Configure as variáveis de ambiente** (automático com integração)
4. **Deploy!**

## 📞 Suporte

Para dúvidas ou suporte:
- **WhatsApp**: Configurado no sistema
- **Email**: admin@novita.com
- **GitHub**: Issues no repositório

---

**Desenvolvido com ❤️ para a Novita**