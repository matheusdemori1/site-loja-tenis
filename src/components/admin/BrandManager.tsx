'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, Brand } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Tag, AlertCircle } from 'lucide-react'

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
      if (!isSupabaseConfigured()) {
        setError('Supabase não está configurado')
        return
      }

      const supabase = getSupabase()
      if (!supabase) {
        setError('Erro ao inicializar Supabase')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      setBrands(data || [])
      setError('')
    } catch (error: any) {
      console.error('Erro ao carregar marcas:', error)
      setError(error.message || 'Erro ao carregar marcas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não está configurado')
      }

      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('Erro ao inicializar Supabase')
      }

      if (editingBrand) {
        // Atualizar marca existente
        const { error } = await supabase
          .from('brands')
          .update({
            name: formData.name
          })
          .eq('id', editingBrand.id)

        if (error) throw error
      } else {
        // Criar nova marca
        const { error } = await supabase
          .from('brands')
          .insert([{
            name: formData.name
          }])

        if (error) throw error
      }

      // Resetar formulário
      setFormData({ name: '' })
      setShowForm(false)
      setEditingBrand(null)
      
      // Recarregar dados
      await loadBrands()
      onStatsUpdate()
      
    } catch (error: any) {
      console.error('Erro ao salvar marca:', error)
      setError(error.message || 'Erro ao salvar marca')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta marca?')) return

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não está configurado')
      }

      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('Erro ao inicializar Supabase')
      }

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadBrands()
      onStatsUpdate()
    } catch (error: any) {
      console.error('Erro ao excluir marca:', error)
      setError(error.message || 'Erro ao excluir marca')
    }
  }

  const resetForm = () => {
    setFormData({ name: '' })
    setShowForm(false)
    setEditingBrand(null)
    setError('')
  }

  if (loading && brands.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Carregando marcas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Gerenciar Marcas</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Marca
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              {editingBrand ? 'Editar Marca' : 'Nova Marca'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Nome da Marca
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nike, Adidas, Puma..."
                  required
                  className="bg-black/20 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {loading ? 'Salvando...' : editingBrand ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="bg-black/30 backdrop-blur-md border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="font-medium text-white">{brand.name}</h3>
                    <p className="text-sm text-gray-400">
                      Criada em {new Date(brand.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(brand)}
                    className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(brand.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {brands.length === 0 && !loading && (
        <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
          <CardContent className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma marca encontrada</h3>
            <p className="text-gray-400 mb-4">Comece criando sua primeira marca</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Marca
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}