'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  image_url: string;
  brand: string;
  category: string;
  description: string;
  colors: string[];
  color_images?: { [key: string]: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  order_index?: number;
  is_active?: boolean;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});
  const [mounted, setMounted] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);

  // Aguardar hidratação do cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Categorias e marcas padrão
  const defaultCategories: Category[] = [
    { id: '1', name: 'Running', slug: 'running' },
    { id: '2', name: 'Casual', slug: 'casual' },
    { id: '3', name: 'Lifestyle', slug: 'lifestyle' },
    { id: '4', name: 'Basketball', slug: 'basketball' }
  ];

  const defaultBrands: Brand[] = [
    { id: '1', name: 'Nike', slug: 'nike' },
    { id: '2', name: 'Adidas', slug: 'adidas' },
    { id: '3', name: 'Puma', slug: 'puma' },
    { id: '4', name: 'New Balance', slug: 'new-balance' },
    { id: '5', name: 'Converse', slug: 'converse' }
  ];

  const defaultHeroSlides: HeroSlide[] = [
    {
      title: "NOVITA",
      subtitle: "COLLECTION 2024",
      description: "Descubra nossa coleção exclusiva de tênis premium",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop"
    },
    {
      title: "PERFORMANCE",
      subtitle: "MÁXIMA",
      description: "Tênis de alta performance para atletas exigentes",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=600&fit=crop"
    },
    {
      title: "ESTILO",
      subtitle: "INCOMPARÁVEL",
      description: "Design moderno e conforto para o seu dia a dia",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&h=600&fit=crop"
    }
  ];

  // Função para carregar dados do Supabase
  const loadData = useCallback(async () => {
    if (!mounted) return;

    try {
      setLoading(true);
      
      // Carregar produtos do Supabase (inicialmente vazio)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.warn('Produtos não encontrados, usando lista vazia:', productsError);
        setProducts([]);
      } else {
        setProducts(productsData || []);
      }

      // Carregar categorias do Supabase ou usar padrão
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.warn('Categorias não encontradas, usando padrão:', categoriesError);
        setCategories(defaultCategories);
      } else {
        setCategories(categoriesData?.length ? categoriesData : defaultCategories);
      }

      // Carregar marcas do Supabase ou usar padrão
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (brandsError) {
        console.warn('Marcas não encontradas, usando padrão:', brandsError);
        setBrands(defaultBrands);
      } else {
        setBrands(brandsData?.length ? brandsData : defaultBrands);
      }

      // Carregar slides do Supabase ou usar padrão
      const { data: slidesData, error: slidesError } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (slidesError) {
        console.warn('Slides não encontrados, usando padrão:', slidesError);
        setHeroSlides(defaultHeroSlides);
      } else {
        setHeroSlides(slidesData?.length ? slidesData : defaultHeroSlides);
      }
      
      console.log('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      // Garantir que sempre temos dados padrão
      setProducts([]);
      setCategories(defaultCategories);
      setBrands(defaultBrands);
      setHeroSlides(defaultHeroSlides);
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  // Effect para carregar dados apenas após hidratação
  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, loadData]);

  // Effect para carousel com cleanup adequado
  useEffect(() => {
    if (heroSlides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'todas' || product.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const handleWhatsApp = (product: Product, selectedColor?: string) => {
    const color = selectedColor || selectedColors[product.id] || 'A definir';
    const message = `Olá! Tenho interesse no produto:\\n\\n📦 *${product.name}*\\n🎨 Cor: ${color}\\n🏷️ Marca: ${product.brand}\\n\\nGostaria de mais informações!`;

    const whatsappNumber = "5518981100463";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleColorChange = (productId: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }));
  };

  const getProductImage = (product: Product) => {
    const selectedColor = selectedColors[product.id];
    if (selectedColor && product.color_images && product.color_images[selectedColor]) {
      return product.color_images[selectedColor];
    }
    return product.image_url;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleAdminClick = () => {
    window.location.href = '/admin';
  };

  // Função para mostrar botão admin com cliques múltiplos
  const handleLogoClick = () => {
    setShowAdminButton(prev => !prev);
  };

  // Não renderizar nada até a hidratação
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 text-white">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 
                onClick={handleLogoClick}
                className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent cursor-pointer select-none"
              >
                NOVITA
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar tênis, marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/30 backdrop-blur-md border border-red-500/30 rounded-full pl-12 pr-6 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>

            {/* User Icon & Admin Button (Hidden) */}
            <div className="flex items-center gap-4">
              {showAdminButton && (
                <button
                  onClick={handleAdminClick}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 opacity-70 hover:opacity-100"
                >
                  <Settings className="w-3 h-3" />
                  Admin
                </button>
              )}
              <User className="w-8 h-8 text-gray-300 hover:text-white cursor-pointer transition-colors p-1 hover:bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide]?.image || defaultHeroSlides[0].image}
            alt="Hero"
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-red-900/50 to-orange-900/30"></div>
        </div>
        
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h2 className="text-6xl md:text-7xl font-bold mb-4 leading-tight">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {heroSlides[currentSlide]?.title || defaultHeroSlides[0].title}
                </span>
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                {heroSlides[currentSlide]?.subtitle || defaultHeroSlides[0].subtitle}
              </h3>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                {heroSlides[currentSlide]?.description || defaultHeroSlides[0].description}
              </p>
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Explorar Coleção
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Categorias
            </h2>
            <p className="text-gray-300 text-lg">Encontre o tênis perfeito para cada ocasião</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`p-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'todos'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                  : 'bg-black/30 backdrop-blur-sm text-gray-300 hover:bg-black/50 border border-red-500/30'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`p-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.slug
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl'
                    : 'bg-black/30 backdrop-blur-sm text-gray-300 hover:bg-black/50 border border-red-500/30'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Brand Filters */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-6 text-white">Marcas</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedBrand('todas')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedBrand === 'todas'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-black/30 backdrop-blur-sm text-gray-300 hover:bg-black/50 border border-orange-500/30'
                }`}
              >
                Todas
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.slug)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedBrand === brand.slug
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                      : 'bg-black/30 backdrop-blur-sm text-gray-300 hover:bg-black/50 border border-orange-500/30'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Nossos Produtos
            </h2>
            <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-red-500/30">
              <p className="text-gray-300">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-12 border border-red-500/20">
                <p className="text-gray-400 text-xl mb-4">Nenhum produto encontrado</p>
                <p className="text-gray-500">
                  {products.length === 0 
                    ? 'Aguarde enquanto o administrador adiciona os primeiros produtos'
                    : 'Tente ajustar os filtros ou buscar por outros termos'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl border border-red-500/20 hover:border-red-500/40">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="text-xs font-bold text-red-400 bg-red-400/20 px-3 py-1 rounded-full border border-red-400/30">
                        {product.brand}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-3 text-white group-hover:text-red-400 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-400 mb-3 font-medium">Cores disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => handleColorChange(product.id, color)}
                              className={`text-xs px-3 py-1 rounded-full border transition-all duration-300 ${
                                selectedColors[product.id] === color
                                  ? 'bg-red-500 text-white border-red-500'
                                  : 'bg-black/30 text-gray-200 border-red-500/30 hover:bg-red-500/20 hover:border-red-500'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleWhatsApp(product, selectedColors[product.id])}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Chamar no WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-md border-t border-red-500/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
                NOVITA
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Sua loja premium de tênis esportivos. Qualidade, estilo e performance em cada produto.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white font-bold">@</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Categorias</h4>
              <ul className="space-y-3 text-gray-300">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <a href="#" className="hover:text-red-400 transition-colors">{category.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Contato</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">📱</span>
                  (18) 98110-0463
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✉️</span>
                  contato@novita.com
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">📍</span>
                  São Paulo, SP
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-red-500/20 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 Novita. Todos os direitos reservados. | Design moderno e responsivo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}