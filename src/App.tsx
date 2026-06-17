/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import Entries from './pages/Entries'
import Budget from './pages/Budget'
import Reports from './pages/Reports'
import CategoriesTree from './pages/CategoriesTree'
import Balances from './pages/Balances'
import Analysis from './pages/Analysis'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children as React.ReactElement
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/lancamentos" element={<Entries />} />
            <Route path="/orcamento" element={<Budget />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/categorias" element={<CategoriesTree />} />
            <Route path="/saldos" element={<Balances />} />
            <Route path="/analise-fechamento" element={<Analysis />} />
            {/* ADD ALL CUSTOM ROUTES MUST BE ADDED HERE */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
