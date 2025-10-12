'use client'

import { useState, useEffect } from 'react'
import { supabase, Brand } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

interface BrandManagerProps {
  onStatsUpdate: () => void
}

export default function BrandManager({ onStatsUpdate }: BrandManagerProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('Erro ao carregar marcas:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '' })
    setEditingBrand(null)
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({ name: brand.name })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingBrand) {
        // Atualizar marca
        const { error } = await supabase
          .from('brands')
          .update({ name: formData.name })
          .eq('id', editingBrand.id)

        if (error) throw error
      } else {
        // Criar nova marca
        const { error } = await supabase
          .from('brands')
          .insert({ name: formData.name })

        if (error) throw error
      }

      setIsDialogOpen(false)
      resetForm()
      loadBrands()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao salvar marca:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta marca?')) return

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadBrands()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao deletar marca:', error)
    }
  }

  if (loading) {
    return <div className="text-white">Carregando marcas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Marcas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-black/90 border-red-500/30 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingBrand ? 'Editar Marca' : 'Nova Marca'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome da Marca</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-black/30 border-red-500/30 text-white"
                  placeholder="Ex: Nike, Adidas, Puma"
                  required
                />
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
                  {editingBrand ? 'Atualizar' : 'Criar'} Marca
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <Card key={brand.id} className="bg-black/30 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-red-400" />
                  {brand.name}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(brand)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(brand.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhuma marca cadastrada</h3>
          <p className="text-gray-500">Clique em "Nova Marca" para começar.</p>
        </div>
      )}
    </div>
  )
}