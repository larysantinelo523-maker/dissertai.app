import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function DashboardLayout() {
  const location = useLocation();
  const { sidebarCollapsed } = useAppStore();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard/nova-redacao': return 'Nova Redação';
      case '/dashboard/minhas-redacoes': return 'Minhas Redações';
      case '/dashboard/configuracoes': return 'Configurações';
      default: return location.pathname.startsWith('/dashboard/minhas-redacoes')
        ? 'Detalhes da Correção'
        : 'Painel';
    }
  };

  // On mobile the sidebar is hidden (display:none), so zero margin.
  // On desktop, animate between collapsed (80px) and expanded (240px).
  const marginLeft = isMobile ? 0 : sidebarCollapsed ? 80 : 240;

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      {/* Desktop sidebar — hidden on mobile via its own hidden md:flex class */}
      <Sidebar />

      <motion.main
        initial={false}
        animate={{ marginLeft }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-w-0"
      >
        {/* Top header */}
        <header className="h-14 md:h-16 px-4 md:px-8 border-b border-border flex justify-between items-center bg-white shrink-0">
          <h2 className="text-base md:text-lg font-semibold text-text-primary">
            {getPageTitle()}
          </h2>
          {/* Mobile Avatar Shortcut */}
          <Link to="/dashboard/configuracoes" className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-bg border border-border overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-text-secondary" />
            )}
          </Link>
        </header>

        {/* Page content — extra bottom padding on mobile so content isn't hidden behind BottomNav */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>
      </motion.main>

      {/* Mobile-only bottom navigation tab bar */}
      <BottomNav />
    </div>
  );
}
