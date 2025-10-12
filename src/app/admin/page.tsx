'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true;
    
    const checkExistingAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return;
        
        if (session) {
          router.push('/admin/dashboard')
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        if (mounted) {
          setCheckingAuth(false)
        }
      }
    }

    checkExistingAuth()
    
    return () => {
      mounted = false;
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Verificando autenticação...</p>
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
                placeholder="seu@email.com"
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
                  placeholder="Sua senha"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Acesso restrito apenas para administradores
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}