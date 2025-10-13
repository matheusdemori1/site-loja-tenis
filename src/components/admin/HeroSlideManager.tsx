'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, HeroSlide } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown,
  AlertCircle,
  Database
} from 'lucide-react'

interface HeroSlideManagerProps {
  onStatsUpdate?: () => void
}

export default function HeroSlideManager({ onStatsUpdate }: HeroSlideManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    is_active: true
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = getSupabase()

  useEffect(() => {
    loadSlides()
  }, [])

  const loadSlides = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        setError('Supabase não está configurado')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setSlides(data || [])
      setError('')
    } catch (error: any) {
      console.error('Erro ao carregar slides:', error)
      setError('Erro ao carregar slides: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não está configurado')
      }

      if (editingSlide) {
        // Atualizar slide existente
        const { error: updateError } = await supabase
          .from('hero_slides')
          .update({
            title: formData.title,
            subtitle: formData.subtitle,
            image_url: formData.image_url,
            is_active: formData.is_active
          })
          .eq('id', editingSlide.id)

        if (updateError) throw updateError
      } else {
        // Criar novo slide
        const nextOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) + 1 : 1

        const { error: insertError } = await supabase
          .from('hero_slides')
          .insert([{
            title: formData.title,
            subtitle: formData.subtitle,
            image_url: formData.image_url,
            is_active: formData.is_active,
            order_index: nextOrder
          }])

        if (insertError) throw insertError
      }

      await loadSlides()
      onStatsUpdate?.()
      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error('Erro ao salvar slide:', error)
      setError('Erro ao salvar slide: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este slide?')) return

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não está configurado')
      }

      const { error: deleteError } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await loadSlides()
      onStatsUpdate?.()
    } catch (error: any) {
      console.error('Erro ao excluir slide:', error)
      setError('Erro ao excluir slide: ' + error.message)
    }
  }

  const handleMoveSlide = async (slideId: string, direction: 'up' | 'down') => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não está configurado')
      }

      const currentSlide = slides.find(s => s.id === slideId)
      if (!currentSlide) return

      const currentIndex = slides.findIndex(s => s.id === slideId)
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (targetIndex < 0 || targetIndex >= slides.length) return

      const targetSlide = slides[targetIndex]

      // Trocar order_index dos slides
      await supabase
        .from('hero_slides')
        .update({ order_index: targetSlide.order_index })
        .eq('id', currentSlide.id)

      await supabase
        .from('hero_slides')
        .update({ order_index: currentSlide.order_index })
        .eq('id', targetSlide.id)

      await loadSlides()
    } catch (error: any) {
      console.error('Erro ao mover slide:', error)
      setError('Erro ao mover slide: ' + error.message)
    }
  }

  const openEditDialog = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      image_url: slide.image_url,
      is_active: slide.is_active
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingSlide(null)
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      is_active: true
    })
    setError('')
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardContent className="p-6">
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <Database className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              Configure sua integração Supabase nas configurações do projeto para gerenciar slides do carousel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-300">Carregando slides...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-red-400" />
              Gerenciar Slides do Carousel
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Slide
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-md border-red-500/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingSlide ? 'Editar Slide' : 'Novo Slide'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título do slide"
                      required
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle" className="text-gray-300">Subtítulo</Label>
                    <Textarea
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Subtítulo do slide"
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-gray-300">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                      required
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="text-gray-300">Slide ativo</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="border-gray-500 text-gray-300 hover:bg-gray-500/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      {submitting ? 'Salvando...' : editingSlide ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 mb-4">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {slides.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum slide encontrado</p>
              <p className="text-gray-500 text-sm">Clique em "Novo Slide" para começar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide, index) => (
                <Card key={slide.id} className="bg-black/20 border-red-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {slide.image_url ? (
                            <img 
                              src={slide.image_url} 
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{slide.title}</h3>
                          <p className="text-gray-400 text-sm">{slide.subtitle}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              slide.is_active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {slide.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="text-gray-500 text-xs">
                              Ordem: {slide.order_index}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveSlide(slide.id, 'up')}
                          disabled={index === 0}
                          className="border-gray-500 text-gray-300 hover:bg-gray-500/10"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveSlide(slide.id, 'down')}
                          disabled={index === slides.length - 1}
                          className="border-gray-500 text-gray-300 hover:bg-gray-500/10"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(slide)}
                          className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(slide.id)}
                          className="border-red-500 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}