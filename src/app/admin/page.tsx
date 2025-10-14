'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, isClient, executeSupabaseOperation } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, LogIn, AlertCircle, Database, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('matheusdemori1@gmail.com')
  const [password, setPassword] = useState('05112004ma')
  const [showPassword, setShowPassword] = useState(false)
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
    
    let isMounted = true
    
    const checkExistingAuth = async () => {
      try {
        // Aguardar um pouco para garantir que as variáveis de ambiente estejam disponíveis
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verificar se o Supabase está configurado
        if (!isSupabaseConfigured()) {
          if (isMounted) {
            setError('Supabase não está configurado. Configure suas variáveis de ambiente.')
            setCheckingAuth(false)
          }
          return
        }

        const supabase = getSupabase()
        if (!supabase) {
          if (isMounted) {
            setError('Erro ao inicializar Supabase')
            setCheckingAuth(false)
          }
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (session) {
          router.push('/admin/dashboard')
          return
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        if (isMounted) {
          setCheckingAuth(false)
        }
      }
    }

    checkExistingAuth()
    
    return () => {
      isMounted = false
    }
  }, [router, mounted])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não está configurado')
      }

      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('Erro ao inicializar Supabase')
      }

      const { data, error: authError } = await executeSupabaseOperation(
        () => supabase.auth.signInWithPassword({ email, password }),
        null
      )

      if (authError || !data) {
        throw new Error(authError?.message || 'Erro na autenticação')
      }

      if (data.user) {
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectAccess = () => {
    // Acesso direto ao dashboard para demonstração
    router.push('/admin/dashboard')
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

  const supabaseConfigured = isSupabaseConfigured()

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
          {!supabaseConfigured && (
            <Alert className="border-orange-500/50 bg-orange-500/10 mb-6">
              <Database className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                Configure sua integração Supabase nas configurações do projeto para usar autenticação completa.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="matheusdemori1@gmail.com"
                required
                className="bg-black/20 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="05112004ma"
                  required
                  className="bg-black/20 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {supabaseConfigured ? (
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
                    Entrar com Supabase
                  </div>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleDirectAccess}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center">
                  <Key className="w-4 h-4 mr-2" />
                  Entrar no Painel Admin
                </div>
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Acesso restrito apenas para administradores
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {supabaseConfigured 
                ? 'Use suas credenciais do Supabase' 
                : 'Clique no botão acima para acessar o painel'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}