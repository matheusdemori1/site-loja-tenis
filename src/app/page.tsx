'use client';

import { useState, useEffect, useCallback } from 'react';
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
      title: "SUPERE",
      subtitle: "SEUS LIMITES",
      description: "Encontre o equipamento perfeito para elevar sua performance ao próximo nível",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop"
    },
    {
      title: "FORÇA",
      subtitle: "E DETERMINAÇÃO",
      description: "Conquiste seus objetivos com equipamentos de alta qualidade e tecnologia avançada",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop"
    },
    {
      title: "PERFORMANCE",
      subtitle: "MÁXIMA",
      description: "Velocidade, resistência e estilo em cada movimento da sua jornada esportiva",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=600&fit=crop"
    }
  ];

  // Função para embaralhar array de forma inteligente
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Função para carregar dados do Supabase
  const loadData = useCallback(async () => {
    if (!mounted) return;

    try {
      setLoading(true);
      
      // Carregar produtos do Supabase
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (productsError) {
        console.warn('Produtos não encontrados no banco:', productsError.message);
        setProducts([]);
      } else {
        console.log(`✅ ${productsData?.length || 0} produtos carregados do banco`);
        // Embaralhar produtos de forma inteligente ao invés de mostrar os últimos primeiro
        const shuffledProducts = shuffleArray(productsData || []);
        setProducts(shuffledProducts);
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
    }, 4000);

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

  // Não renderizar nada até a hidratação
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black text-lg">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-black text-black">
                NOVITA
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative h-[75vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide]?.image || heroSlides[currentSlide]?.image_url || defaultHeroSlides[0].image}
            alt="Hero"
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <h2 className="text-7xl md:text-8xl font-black mb-6 leading-tight text-white">
                {heroSlides[currentSlide]?.title || defaultHeroSlides[0].title}
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-8 text-white/90">
                {heroSlides[currentSlide]?.subtitle || defaultHeroSlides[0].subtitle}
              </h3>
              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl">
                {heroSlides[currentSlide]?.description || defaultHeroSlides[0].description}
              </p>
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Explorar Coleção
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 text-black">
              Categorias
            </h2>
            <p className="text-gray-600 text-xl">Encontre o equipamento perfeito para cada modalidade</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`p-8 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'todos'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`p-8 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.slug
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Brand Filters */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-8 text-black">Marcas</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedBrand('todas')}
                className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                  selectedBrand === 'todas'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                Todas
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.slug)}
                  className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                    selectedBrand === brand.slug
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100 border-2 border-gray-200'
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
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-5xl font-black text-black">
              Nossa Coleção
            </h2>
            <div className="bg-gray-100 px-6 py-3 rounded-full">
              <p className="text-gray-700 font-medium">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-50 rounded-3xl p-16">
                <p className="text-gray-600 text-2xl mb-6 font-semibold">Nenhum produto encontrado</p>
                <p className="text-gray-500 text-lg">
                  {products.length === 0 
                    ? 'Aguarde enquanto o administrador adiciona os primeiros produtos'
                    : 'Tente ajustar os filtros ou buscar por outros termos'
                  }
                </p>
                {products.length === 0 && (
                  <div className="mt-8">
                    <p className="text-sm text-gray-400 mb-2">Para adicionar produtos de exemplo:</p>
                    <p className="text-xs text-gray-500">Consulte o arquivo DADOS_EXEMPLO.md na raiz do projeto</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-3xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-gray-100">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                        {product.brand}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-4 text-black">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price */}
                    {product.price && (
                      <div className="mb-6">
                        <p className="text-2xl font-bold text-black">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    )}
                    
                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-3 font-medium">Cores disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => handleColorChange(product.id, color)}
                              className={`text-xs px-4 py-2 rounded-full border transition-all duration-300 ${
                                selectedColors[product.id] === color
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105"
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
      <footer className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-4xl font-black text-white mb-6">
                NOVITA
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
                Sua loja premium de equipamentos esportivos. Qualidade, estilo e performance em cada produto.
              </p>
              <div className="flex space-x-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-black font-bold text-lg">f</span>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-black font-bold text-lg">@</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-8 text-xl">Categorias</h4>
              <ul className="space-y-4 text-gray-300">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(category.slug);
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors text-left font-medium"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              &copy; 2024 Novita. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}