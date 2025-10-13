'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, AlertCircle, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Aguardar hidratação do cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const checkExistingAuth = async () => {
      try {
        // Simular verificação de autenticação
        await new Promise(resolve => setTimeout(resolve, 500))
        setCheckingAuth(false)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setCheckingAuth(false)
      }
    }

    checkExistingAuth()
  }, [mounted])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simular login bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/admin/dashboard')
    } catch (error: any) {
      console.error('Erro no login:', error)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Não renderizar nada até a hidratação
  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">
            {!mounted ? 'Carregando...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-md border-red-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            NOVITA
          </CardTitle>
          <p className="text-gray-300">Painel Administrativo</p>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500/50 bg-green-500/10 mb-6">
            <Database className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Sistema funcionando com dados de demonstração. Clique em "Entrar" para acessar o painel.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar no Painel Admin
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Acesso ao painel administrativo
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Sistema de demonstração - clique para acessar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}