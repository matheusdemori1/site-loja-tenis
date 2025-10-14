'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, executeSupabaseOperation, Category } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Layers, AlertCircle, Database } from 'lucide-react'

interface CategoryManagerProps {
  onStatsUpdate: () => void
}

export default function CategoryManager({ onStatsUpdate }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const result = await executeSupabaseOperation(
        () => getSupabase().from('categories').select('*').order('name'),
        []
      )

      setCategories(result.data || [])
      setError('')
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error)
      setError('Erro ao carregar categorias: ' + error.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-')
      const categoryData = {
        name: formData.name,
        slug: slug
      }

      if (editingCategory) {
        await executeSupabaseOperation(
          () => getSupabase().from('categories').update(categoryData).eq('id', editingCategory.id),
          null
        )
      } else {
        await executeSupabaseOperation(
          () => getSupabase().from('categories').insert([categoryData]),
          null
        )
      }

      await loadCategories()
      onStatsUpdate()
      setShowForm(false)
      resetForm()
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error)
      setError('Erro ao salvar categoria: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await executeSupabaseOperation(
        () => getSupabase().from('categories').delete().eq('id', id),
        null
      )

      await loadCategories()
      onStatsUpdate()
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error)
      setError('Erro ao excluir categoria: ' + error.message)
    }
  }

  const openEditForm = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingCategory(null)
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
              Configure sua integração Supabase nas configurações do projeto para gerenciar categorias.
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
            <span className="text-gray-300">Carregando categorias...</span>
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
              <Layers className="w-5 h-5 mr-2 text-red-400" />
              Gerenciar Categorias
            </CardTitle>
            <Button 
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
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
                    <Label htmlFor="name" className="text-gray-300">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Running, Casual..."
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
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      {editingCategory ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma categoria encontrada</p>
              <p className="text-gray-500 text-sm">Clique em "Nova Categoria" para começar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="bg-black/20 border-red-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{category.name}</h3>
                        <p className="text-gray-400 text-sm">Slug: {category.slug}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(category)}
                          className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
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