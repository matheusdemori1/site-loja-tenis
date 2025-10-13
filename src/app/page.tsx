'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, ChevronLeft, ChevronRight, Settings, Plus, Edit, Trash2, Save, X, Upload, Eye, EyeOff } from 'lucide-react';
import { getSupabase, isClient } from '@/lib/supabase';

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
  
  // Estados do Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'products' | 'categories' | 'brands' | 'slides'>('products');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Aguardar hidratação do cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Produtos exemplo para demonstração
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Nike Air Max 270',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      brand: 'Nike',
      category: 'running',
      description: 'Tênis de corrida com tecnologia Air Max para máximo conforto e performance.',
      colors: ['Preto', 'Branco', 'Vermelho'],
      color_images: {
        'Preto': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        'Branco': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'Vermelho': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
      }
    },
    {
      id: '2',
      name: 'Adidas Ultraboost 22',
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      brand: 'Adidas',
      category: 'running',
      description: 'Tênis premium com tecnologia Boost para energia infinita em cada passada.',
      colors: ['Branco', 'Preto', 'Laranja'],
      color_images: {
        'Branco': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'Preto': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        'Laranja': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
      }
    },
    {
      id: '3',
      name: 'Puma RS-X',
      image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      brand: 'Puma',
      category: 'casual',
      description: 'Tênis casual com design futurista e conforto excepcional para o dia a dia.',
      colors: ['Laranja', 'Preto', 'Vermelho'],
      color_images: {
        'Laranja': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
        'Preto': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        'Vermelho': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
      }
    },
    {
      id: '4',
      name: 'New Balance 990v5',
      image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
      brand: 'New Balance',
      category: 'lifestyle',
      description: 'Tênis lifestyle premium com qualidade superior e design atemporal.',
      colors: ['Preto', 'Vermelho', 'Laranja'],
      color_images: {
        'Preto': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
        'Vermelho': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        'Laranja': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
      }
    }
  ];

  const sampleCategories: Category[] = [
    { id: '1', name: 'Running', slug: 'running' },
    { id: '2', name: 'Casual', slug: 'casual' },
    { id: '3', name: 'Lifestyle', slug: 'lifestyle' },
    { id: '4', name: 'Basketball', slug: 'basketball' }
  ];

  const sampleBrands: Brand[] = [
    { id: '1', name: 'Nike', slug: 'nike' },
    { id: '2', name: 'Adidas', slug: 'adidas' },
    { id: '3', name: 'Puma', slug: 'puma' },
    { id: '4', name: 'New Balance', slug: 'new-balance' }
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

  // Função memoizada para buscar dados
  const fetchData = useCallback(async () => {
    if (!mounted || !isClient()) {
      return;
    }

    try {
      setLoading(true);
      
      // Tentar buscar dados do Supabase com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const supabase = getSupabase();
      
      if (!supabase) {
        throw new Error('Supabase não disponível');
      }

      const dataPromise = Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('brands').select('*').order('name'),
        supabase.from('hero_slides').select('*').order('order_index')
      ]);

      const results = await Promise.race([dataPromise, timeoutPromise]) as any[];
      
      const [productsResult, categoriesResult, brandsResult, heroSlidesResult] = results;

      // Se não houver dados no Supabase, usar dados exemplo
      setProducts(productsResult?.data && productsResult.data.length > 0 ? productsResult.data : sampleProducts);
      setCategories(categoriesResult?.data && categoriesResult.data.length > 0 ? categoriesResult.data : sampleCategories);
      setBrands(brandsResult?.data && brandsResult.data.length > 0 ? brandsResult.data : sampleBrands);
      setHeroSlides(heroSlidesResult?.data && heroSlidesResult.data.length > 0 ? heroSlidesResult.data : defaultHeroSlides);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, usar dados exemplo
      setProducts(sampleProducts);
      setCategories(sampleCategories);
      setBrands(sampleBrands);
      setHeroSlides(defaultHeroSlides);
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  // Effect para carregar dados apenas após hidratação
  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

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

  // Funções Admin
  const handleSaveItem = async (item: any, type: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.warn('Supabase não configurado - salvando localmente');
        // Salvar localmente para demonstração
        if (type === 'products') {
          if (editingItem?.id) {
            setProducts(prev => prev.map(p => p.id === editingItem.id ? { ...item, id: editingItem.id } : p));
          } else {
            setProducts(prev => [...prev, { ...item, id: Date.now().toString() }]);
          }
        } else if (type === 'categories') {
          if (editingItem?.id) {
            setCategories(prev => prev.map(c => c.id === editingItem.id ? { ...item, id: editingItem.id } : c));
          } else {
            setCategories(prev => [...prev, { ...item, id: Date.now().toString() }]);
          }
        } else if (type === 'brands') {
          if (editingItem?.id) {
            setBrands(prev => prev.map(b => b.id === editingItem.id ? { ...item, id: editingItem.id } : b));
          } else {
            setBrands(prev => [...prev, { ...item, id: Date.now().toString() }]);
          }
        } else if (type === 'slides') {
          if (editingItem?.id) {
            setHeroSlides(prev => prev.map(s => s.id === editingItem.id ? { ...item, id: editingItem.id } : s));
          } else {
            setHeroSlides(prev => [...prev, { ...item, id: Date.now().toString() }]);
          }
        }
        setEditingItem(null);
        setShowAddForm(false);
        return;
      }

      let result;
      if (editingItem?.id) {
        // Atualizar
        result = await supabase.from(type).update(item).eq('id', editingItem.id);
      } else {
        // Criar
        result = await supabase.from(type).insert([item]);
      }

      if (result.error) {
        console.error('Erro ao salvar:', result.error);
        alert('Erro ao salvar item');
        return;
      }

      // Recarregar dados
      await fetchData();
      setEditingItem(null);
      setShowAddForm(false);
      alert('Item salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      alert('Erro ao salvar item');
    }
  };

  const handleDeleteItem = async (id: string, type: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.warn('Supabase não configurado - removendo localmente');
        // Remover localmente para demonstração
        if (type === 'products') {
          setProducts(prev => prev.filter(p => p.id !== id));
        } else if (type === 'categories') {
          setCategories(prev => prev.filter(c => c.id !== id));
        } else if (type === 'brands') {
          setBrands(prev => prev.filter(b => b.id !== id));
        } else if (type === 'slides') {
          setHeroSlides(prev => prev.filter(s => s.id !== id));
        }
        return;
      }

      const result = await supabase.from(type).delete().eq('id', id);

      if (result.error) {
        console.error('Erro ao excluir:', result.error);
        alert('Erro ao excluir item');
        return;
      }

      // Recarregar dados
      await fetchData();
      alert('Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item');
    }
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
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

            {/* User Icon & Admin Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
              <User className="w-8 h-8 text-gray-300 hover:text-white cursor-pointer transition-colors p-1 hover:bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      {showAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-red-500/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Painel Administrativo
              </h2>
              <button
                onClick={() => setShowAdmin(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-black/40 border-r border-red-500/20 p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'products', label: 'Produtos', icon: '📦' },
                    { id: 'categories', label: 'Categorias', icon: '📂' },
                    { id: 'brands', label: 'Marcas', icon: '🏷️' },
                    { id: 'slides', label: 'Slides Hero', icon: '🖼️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                        adminTab === tab.id
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {adminTab === 'products' && 'Gerenciar Produtos'}
                    {adminTab === 'categories' && 'Gerenciar Categorias'}
                    {adminTab === 'brands' && 'Gerenciar Marcas'}
                    {adminTab === 'slides' && 'Gerenciar Slides Hero'}
                  </h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>

                {/* Products Tab */}
                {adminTab === 'products' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-black/30 rounded-lg p-4 border border-red-500/20">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-white mb-2">{product.name}</h4>
                        <p className="text-gray-300 text-sm mb-2">{product.brand}</p>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(product)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteItem(product.id, 'products')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Categories Tab */}
                {adminTab === 'categories' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-black/30 rounded-lg p-4 border border-red-500/20">
                        <h4 className="font-semibold text-white mb-2">{category.name}</h4>
                        <p className="text-gray-300 text-sm mb-3">Slug: {category.slug}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(category)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteItem(category.id, 'categories')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Brands Tab */}
                {adminTab === 'brands' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brands.map((brand) => (
                      <div key={brand.id} className="bg-black/30 rounded-lg p-4 border border-red-500/20">
                        <h4 className="font-semibold text-white mb-2">{brand.name}</h4>
                        <p className="text-gray-300 text-sm mb-3">Slug: {brand.slug}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(brand)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteItem(brand.id, 'brands')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Slides Tab */}
                {adminTab === 'slides' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {heroSlides.map((slide, index) => (
                      <div key={slide.id || index} className="bg-black/30 rounded-lg p-4 border border-red-500/20">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-white mb-2">{slide.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{slide.subtitle}</p>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{slide.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(slide)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteItem(slide.id || index.toString(), 'hero_slides')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Editar' : 'Adicionar'} {
                    adminTab === 'products' ? 'Produto' :
                    adminTab === 'categories' ? 'Categoria' :
                    adminTab === 'brands' ? 'Marca' : 'Slide'
                  }
                </h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddForm(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <AdminForm
                type={adminTab}
                item={editingItem}
                onSave={(item) => handleSaveItem(item, adminTab === 'slides' ? 'hero_slides' : adminTab)}
                onCancel={() => {
                  setEditingItem(null);
                  setShowAddForm(false);
                }}
                categories={categories}
                brands={brands}
              />
            </div>
          </div>
        </div>
      )}

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
                <p className="text-gray-500">Tente ajustar os filtros ou buscar por outros termos</p>
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

// Componente de formulário admin
function AdminForm({ 
  type, 
  item, 
  onSave, 
  onCancel, 
  categories, 
  brands 
}: { 
  type: string;
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
  categories: Category[];
  brands: Brand[];
}) {
  const [formData, setFormData] = useState(item || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (type === 'products') {
      if (!formData.name || !formData.brand || !formData.category || !formData.image_url) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }
      // Processar cores
      if (formData.colors && typeof formData.colors === 'string') {
        formData.colors = formData.colors.split(',').map((c: string) => c.trim());
      }
    } else if (type === 'categories' || type === 'brands') {
      if (!formData.name) {
        alert('Nome é obrigatório');
        return;
      }
      if (!formData.slug) {
        formData.slug = formData.name.toLowerCase().replace(/\s+/g, '-');
      }
    } else if (type === 'slides') {
      if (!formData.title || !formData.subtitle || !formData.image) {
        alert('Preencha todos os campos obrigatórios');
        return;
      }
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'products' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL da Imagem *</label>
            <input
              type="url"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
              <select
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Selecione uma marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria *</label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cores (separadas por vírgula)</label>
            <input
              type="text"
              value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors || ''}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Ex: Preto, Branco, Vermelho"
            />
          </div>
        </>
      )}

      {(type === 'categories' || type === 'brands') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Será gerado automaticamente se vazio"
            />
          </div>
        </>
      )}

      {type === 'slides' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subtítulo *</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL da Imagem *</label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
        </>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}