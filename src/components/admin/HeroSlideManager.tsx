'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Image, ArrowUp, ArrowDown } from 'lucide-react'

interface HeroSlide {
  id?: string
  title: string
  subtitle: string
  description: string
  image: string
  order_index: number
}

interface HeroSlideManagerProps {
  onStatsUpdate: () => void
}

export default function HeroSlideManager({ onStatsUpdate }: HeroSlideManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: ''
  })

  useEffect(() => {
    loadSlides()
  }, [])

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index')

      if (error) throw error
      setSlides(data || [])
    } catch (error) {
      console.error('Erro ao carregar slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: ''
    })
    setEditingSlide(null)
  }

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      image: slide.image
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const slideData = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        image: formData.image,
        order_index: editingSlide ? editingSlide.order_index : slides.length
      }

      if (editingSlide) {
        // Atualizar slide
        const { error } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', editingSlide.id)

        if (error) throw error
      } else {
        // Criar novo slide
        const { error } = await supabase
          .from('hero_slides')
          .insert(slideData)

        if (error) throw error
      }

      setIsDialogOpen(false)
      resetForm()
      loadSlides()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao salvar slide:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este slide?')) return

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadSlides()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao deletar slide:', error)
    }
  }

  const moveSlide = async (slideId: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slideId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= slides.length) return

    try {
      // Trocar order_index dos slides
      const slide1 = slides[currentIndex]
      const slide2 = slides[newIndex]

      await supabase
        .from('hero_slides')
        .update({ order_index: slide2.order_index })
        .eq('id', slide1.id)

      await supabase
        .from('hero_slides')
        .update({ order_index: slide1.order_index })
        .eq('id', slide2.id)

      loadSlides()
    } catch (error) {
      console.error('Erro ao mover slide:', error)
    }
  }

  if (loading) {
    return <div className="text-white">Carregando slides...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Slides do Carousel</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-black/90 border-red-500/30 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingSlide ? 'Editar Slide' : 'Novo Slide'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Título Principal</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="Ex: NOVITA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-white">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="bg-black/30 border-red-500/30 text-white"
                    placeholder="Ex: COLLECTION 2024"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-black/30 border-red-500/30 text-white"
                  placeholder="Descrição do slide..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-white">URL da Imagem</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="bg-black/30 border-red-500/30 text-white"
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {editingSlide ? 'Atualizar' : 'Criar'} Slide
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Slides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="bg-black/30 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg">
                    {slide.title}
                  </CardTitle>
                  <p className="text-red-400 font-medium">{slide.subtitle}</p>
                  <p className="text-gray-300 text-sm mt-2">{slide.description}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => moveSlide(slide.id!, 'up')}
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => moveSlide(slide.id!, 'down')}
                      variant="outline"
                      size="sm"
                      disabled={index === slides.length - 1}
                      className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(slide)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(slide.id!)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=200&fit=crop'
                  }}
                />
              </div>
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-400">Posição: {index + 1}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum slide cadastrado</h3>
          <p className="text-gray-500">Clique em "Novo Slide" para começar.</p>
        </div>
      )}
    </div>
  )
}