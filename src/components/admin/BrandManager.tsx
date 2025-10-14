'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, executeSupabaseOperation, Brand } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Tag, AlertCircle, Database } from 'lucide-react'

interface BrandManagerProps {
  onStatsUpdate: () => void
}

export default function BrandManager({ onStatsUpdate }: BrandManagerProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const result = await executeSupabaseOperation(
        () => getSupabase().from('brands').select('*').order('name'),
        []
      )

      setBrands(result.data || [])
      setError('')
    } catch (error: any) {
      console.error('Erro ao carregar marcas:', error)
      setError('Erro ao carregar marcas: ' + error.message)
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-')
      const brandData = {
        name: formData.name,
        slug: slug
      }

      if (editingBrand) {
        await executeSupabaseOperation(
          () => getSupabase().from('brands').update(brandData).eq('id', editingBrand.id),
          null
        )
      } else {
        await executeSupabaseOperation(
          () => getSupabase().from('brands').insert([brandData]),
          null
        )
      }

      await loadBrands()
      onStatsUpdate()
      setShowForm(false)
      resetForm()
    } catch (error: any) {
      console.error('Erro ao salvar marca:', error)
      setError('Erro ao salvar marca: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta marca?')) return

    try {
      await executeSupabaseOperation(
        () => getSupabase().from('brands').delete().eq('id', id),
        null
      )

      await loadBrands()
      onStatsUpdate()
    } catch (error: any) {
      console.error('Erro ao excluir marca:', error)
      setError('Erro ao excluir marca: ' + error.message)
    }
  }

  const openEditForm = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({ name: brand.name })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingBrand(null)
    setFormData({ name: '' })
    setError('')
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardContent className="p-6">
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <Database className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              Configure sua integração Supabase nas configurações do projeto para gerenciar marcas.
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
            <span className="text-gray-300">Carregando marcas...</span>
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
              <Tag className="w-5 h-5 mr-2 text-orange-400" />
              Gerenciar Marcas
            </CardTitle>
            <Button 
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Marca
            </Button>
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

          {showForm && (
            <Card className="bg-black/20 border-red-500/10 mb-6">
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Nome da Marca</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Nike, Adidas..."
                      required
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="border-gray-500 text-gray-300 hover:bg-gray-500/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      {editingBrand ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {brands.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma marca encontrada</p>
              <p className="text-gray-500 text-sm">Clique em "Nova Marca" para começar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {brands.map((brand) => (
                <Card key={brand.id} className="bg-black/20 border-red-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{brand.name}</h3>
                        <p className="text-gray-400 text-sm">Slug: {brand.slug}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(brand)}
                          className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(brand.id)}
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