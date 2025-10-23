'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Star, Zap, Award } from 'lucide-react';
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
  price?: number;
  is_active?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image_url?: string;
  image?: string;
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
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Aguardar hidratação do cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Categorias e marcas padrão (fallback)
  const defaultCategories: Category[] = [
    { id: '1', name: 'Running', slug: 'running', description: 'Tênis para corrida' },
    { id: '2', name: 'Casual', slug: 'casual', description: 'Tênis casuais' },
    { id: '3', name: 'Lifestyle', slug: 'lifestyle', description: 'Tênis lifestyle' },
    { id: '4', name: 'Basketball', slug: 'basketball', description: 'Tênis de basquete' }
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
      subtitle: "JUST DO IT",
      description: "Descubra a nova coleção de tênis premium com tecnologia de ponta e design revolucionário",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&h=900&fit=crop&q=80"
    },
    {
      title: "NOVITA",
      subtitle: "PERFORMANCE MÁXIMA",
      description: "Tênis desenvolvidos para atletas que buscam o máximo desempenho em cada passada",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1600&h=900&fit=crop&q=80"
    },
    {
      title: "NOVITA",
      subtitle: "ESTILO URBANO",
      description: "A fusão perfeita entre conforto, tecnologia e design para o seu dia a dia",
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1600&h=900&fit=crop&q=80"
    }
  ];

  // Função para buscar produtos no banco de dados
  const searchProducts = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`)
        .order('name');

      if (error) {
        console.error('Erro na busca:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect para busca em tempo real
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchProducts]);

  // Função para carregar dados do Supabase
  const loadData = useCallback(async () => {
    if (!mounted) return;

    try {
      setLoading(true);
      
      // Carregar produtos do Supabase
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.warn('Produtos não encontrados no banco:', productsError.message);
        setProducts([]);
      } else {
        console.log(`✅ ${productsData?.length || 0} produtos carregados do banco`);
        setProducts(productsData || []);
      }

      // Carregar categorias do Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.warn('Categorias não encontradas no banco, usando padrão:', categoriesError.message);
        setCategories(defaultCategories);
      } else {
        const dbCategories = categoriesData || [];
        console.log(`✅ ${dbCategories.length} categorias carregadas do banco`);
        setCategories(dbCategories.length > 0 ? dbCategories : defaultCategories);
      }

      // Carregar marcas do Supabase
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (brandsError) {
        console.warn('Marcas não encontradas no banco, usando padrão:', brandsError.message);
        setBrands(defaultBrands);
      } else {
        const dbBrands = brandsData || [];
        console.log(`✅ ${dbBrands.length} marcas carregadas do banco`);
        setBrands(dbBrands.length > 0 ? dbBrands : defaultBrands);
      }

      // Carregar slides do Supabase
      const { data: slidesData, error: slidesError } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (slidesError) {
        console.warn('Slides não encontrados no banco, usando padrão:', slidesError.message);
        setHeroSlides(defaultHeroSlides);
      } else {
        const dbSlides = slidesData || [];
        console.log(`✅ ${dbSlides.length} slides carregados do banco`);
        // Mapear image_url para image para compatibilidade
        const mappedSlides = dbSlides.map(slide => ({
          ...slide,
          image: slide.image_url || slide.image
        }));
        setHeroSlides(mappedSlides.length > 0 ? mappedSlides : defaultHeroSlides);
      }
      
      console.log('✅ Carregamento de dados concluído');
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
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Filtrar produtos com base nos filtros selecionados
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
    const price = product.price ? `💰 Preço: R$ ${product.price.toFixed(2).replace('.', ',')}` : '';
    const message = `Olá! Tenho interesse no produto:\\n\\n📦 *${product.name}*\\n🎨 Cor: ${color}\\n🏷️ Marca: ${product.brand}\\n${price}\\n\\nGostaria de mais informações!`;

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

  // Não renderizar nada até a hidratação
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-500 text-lg font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-500 text-lg font-bold">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-md border-b border-red-900/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 
                className="text-5xl font-black cursor-pointer select-none transform hover:scale-105 transition-all duration-300"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.3))'
                }}
              >
                NOVITA
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 relative">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  isSearching ? 'text-red-500 animate-pulse' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-full pl-12 pr-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all hover:bg-gray-800/50 focus:bg-gray-900/70 backdrop-blur-sm"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  </div>
                )}
              </div>

              {/* Dropdown de Resultados da Busca */}
              {searchTerm && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
                      Buscando...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="p-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">
                          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {searchResults.slice(0, 5).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSearchTerm('');
                            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-800 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{product.name}</h4>
                              <p className="text-sm text-gray-400">{product.brand} • {product.category}</p>
                              {product.price && (
                                <p className="text-sm text-red-500 font-medium">
                                  R$ {product.price.toFixed(2).replace('.', ',')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {searchResults.length > 5 && (
                        <div className="p-3 text-center border-t border-gray-700">
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                          >
                            Ver todos os {searchResults.length} resultados
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      <p>Nenhum produto encontrado para "{searchTerm}"</p>
                      <p className="text-sm mt-1">Tente buscar por outras palavras-chave</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Espaço reservado */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide]?.image || heroSlides[currentSlide]?.image_url || defaultHeroSlides[0].image}
            alt="Hero"
            className="w-full h-full object-cover transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-4xl">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-1 bg-red-500"></div>
                  <span className="text-red-500 font-bold text-lg tracking-wider">PREMIUM COLLECTION</span>
                </div>
              </div>
              
              <h2 
                className="text-8xl md:text-9xl lg:text-[12rem] font-black mb-8 leading-none text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.05em',
                  fontWeight: '900',
                  textShadow: '0 0 40px rgba(0,0,0,0.8)'
                }}
              >
                {heroSlides[currentSlide]?.title || defaultHeroSlides[0].title}
              </h2>
              
              <h3 className="text-3xl md:text-4xl font-black mb-8 text-red-500 tracking-wider">
                {heroSlides[currentSlide]?.subtitle || defaultHeroSlides[0].subtitle}
              </h3>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl font-light">
                {heroSlides[currentSlide]?.description || defaultHeroSlides[0].description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-red-600 hover:border-red-500 uppercase tracking-wider"
                >
                  Comprar Agora
                </button>
                <button 
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white hover:bg-white hover:text-black px-12 py-5 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-105 uppercase tracking-wider"
                >
                  Explorar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-red-600/80 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-red-600/80 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                  index === currentSlide 
                    ? 'bg-red-500 border-red-500 scale-125' 
                    : 'bg-transparent border-white/60 hover:border-red-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-8 text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-px h-16 bg-white/30"></div>
            <span className="text-sm font-medium rotate-90 origin-left">SCROLL</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">PERFORMANCE</h3>
              <p className="text-gray-400 leading-relaxed">Tecnologia de ponta para máximo desempenho em cada movimento</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">QUALIDADE</h3>
              <p className="text-gray-400 leading-relaxed">Materiais premium selecionados para durabilidade excepcional</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">ESTILO</h3>
              <p className="text-gray-400 leading-relaxed">Design inovador que combina funcionalidade e estética moderna</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-1 bg-red-500"></div>
              <span className="text-red-500 font-bold text-lg tracking-wider">CATEGORIAS</span>
              <div className="w-12 h-1 bg-red-500"></div>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-8 text-white">
              ENCONTRE SEU
              <br />
              <span className="text-red-500">ESTILO</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">Descubra a categoria perfeita para cada momento da sua vida</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`p-8 font-black text-lg transition-all duration-300 transform hover:scale-105 border-2 rounded-2xl ${
                selectedCategory === 'todos'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xl shadow-red-600/20'
                  : 'bg-transparent text-white hover:bg-red-600/10 border-white/20 hover:border-red-600'
              }`}
            >
              TODOS
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`p-8 font-black text-lg transition-all duration-300 transform hover:scale-105 border-2 rounded-2xl ${
                  selectedCategory === category.slug
                    ? 'bg-red-600 text-white border-red-600 shadow-2xl shadow-red-600/20'
                    : 'bg-transparent text-white hover:bg-red-600/10 border-white/20 hover:border-red-600'
                }`}
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Brand Filters */}
          <div className="text-center">
            <h3 className="text-4xl font-black mb-12 text-white">MARCAS</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedBrand('todas')}
                className={`px-10 py-4 font-black transition-all duration-300 border-2 rounded-2xl ${
                  selectedBrand === 'todas'
                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                    : 'bg-transparent text-white hover:bg-red-600/10 border-white/20 hover:border-red-600'
                }`}
              >
                TODAS
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.slug)}
                  className={`px-10 py-4 font-black transition-all duration-300 border-2 rounded-2xl ${
                    selectedBrand === brand.slug
                      ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                      : 'bg-transparent text-white hover:bg-red-600/10 border-white/20 hover:border-red-600'
                  }`}
                >
                  {brand.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-20">
            <div>
              <h2 className="text-6xl font-black text-white mb-4">
                PRODUTOS
              </h2>
              <div className="w-24 h-1 bg-red-500"></div>
            </div>
            <div className="bg-red-600 px-8 py-4 border-2 border-red-600 rounded-2xl">
              <p className="text-white font-black text-lg">
                {filteredProducts.length} PRODUTO{filteredProducts.length !== 1 ? 'S' : ''}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="bg-gray-800 border-2 border-gray-700 p-20 rounded-3xl">
                <p className="text-white text-3xl mb-6 font-black">NENHUM PRODUTO ENCONTRADO</p>
                <p className="text-gray-400 text-xl">
                  {products.length === 0 
                    ? 'Aguarde enquanto o administrador adiciona os primeiros produtos'
                    : 'Tente ajustar os filtros ou buscar por outros termos'
                  }
                </p>
                {products.length === 0 && (
                  <div className="mt-12">
                    <p className="text-sm text-gray-500 mb-2">Para adicionar produtos de exemplo:</p>
                    <p className="text-xs text-gray-600">Consulte o arquivo DADOS_EXEMPLO.md na raiz do projeto</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-gray-800 border-2 border-gray-700 overflow-hidden hover:transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:border-red-600 rounded-3xl">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/20 transition-all duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-black text-white bg-red-600 px-3 py-1 border border-red-500 rounded-full">
                        {product.brand.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="font-black text-2xl mb-4 text-white group-hover:text-red-500 transition-colors">
                      {product.name.toUpperCase()}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price */}
                    {product.price && (
                      <div className="mb-6">
                        <p className="text-3xl font-black text-red-500">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    )}
                    
                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-8">
                        <p className="text-sm text-gray-400 mb-4 font-black">CORES DISPONÍVEIS:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => handleColorChange(product.id, color)}
                              className={`text-xs px-4 py-2 border-2 transition-all duration-300 font-black rounded-full ${
                                selectedColors[product.id] === color
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-transparent text-gray-300 border-gray-600 hover:bg-red-600/10 hover:border-red-600'
                              }`}
                            >
                              {color.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleWhatsApp(product, selectedColors[product.id])}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-5 px-6 font-black transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-green-600 hover:border-green-500 rounded-2xl"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      CHAMAR NO WHATSAPP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-900/20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <h3 
                className="text-5xl font-black text-white mb-8"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                NOVITA
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-lg">
                Sua loja premium de tênis esportivos. Qualidade, estilo e performance em cada produto.
              </p>
              <div className="flex space-x-6">
                <a 
                  href="https://www.instagram.com/novita_modas?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-red-600 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform font-black text-xl border-2 border-red-600 hover:border-red-500 rounded-2xl"
                >
                  @
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-white mb-10 text-xl">CATEGORIAS</h4>
              <ul className="space-y-6 text-gray-400">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(category.slug);
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-red-500 transition-colors text-left font-medium"
                    >
                      {category.name.toUpperCase()}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-white mb-10 text-xl">CONTATO</h4>
              <ul className="space-y-6 text-gray-400">
                <li className="flex items-center gap-4">
                  <span className="text-green-500 text-xl">📱</span>
                  <span className="font-medium">(18) 98110-0463</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-yellow-500 text-xl">📍</span>
                  <span className="font-medium">Pauliceia - SP</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-20 pt-12 text-center">
            <p className="text-gray-500 font-medium text-lg">
              &copy; 2024 NOVITA. TODOS OS DIREITOS RESERVADOS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}