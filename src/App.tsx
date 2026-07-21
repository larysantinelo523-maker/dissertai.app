import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { NovaRedacao } from './pages/NovaRedacao';
import { Historico } from './pages/Historico';
import { DetalheRedacao } from './pages/DetalheRedacao';
import { Configuracoes } from './pages/Configuracoes';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { SignupQuiz } from './pages/SignupQuiz';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();

  if (loading) return null; // handled by ProtectedRoute
  if (role !== 'admin') {
    return <Navigate to="/dashboard/nova-redacao" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<SignupQuiz />} />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/nova-redacao" replace />} />
            <Route path="nova-redacao" element={<NovaRedacao />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="minhas-redacoes" element={<Historico />} />
            <Route path="minhas-redacoes/:id" element={<DetalheRedacao />} />
            <Route 
              path="admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
