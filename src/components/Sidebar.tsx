import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, Files, Settings, LogOut, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from './ui/Base';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { user, role } = useAuth();

  const navItems = [
    { label: 'Nova Redação', icon: PlusCircle, href: '/dashboard/nova-redacao' },
    { label: 'Minhas Redações', icon: Files, href: '/dashboard/minhas-redacoes' },
    { label: 'Configurações', icon: Settings, href: '/dashboard/configuracoes' },
  ];

  const adminItems = [
    { label: 'Admin — Bancas', icon: ShieldCheck, href: '/dashboard/admin' },
  ];

  const handleLogout = async () => {
    localStorage.removeItem('temp_auth');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   (user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user?.user_metadata?.last_name || ''}`.trim() : null);
  const userInitial = userName ? userName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');
  const userDisplayName = userName || (user?.email ? user.email.split('@')[0] : 'Usuário');

  return (
    <motion.aside 
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full bg-sidebar-bg border-r border-border flex flex-col hidden md:flex z-50 overflow-hidden"
    >
      {/* Header */}
      <div className={cn(
        "p-6 flex items-center gap-3 transition-all duration-300",
        sidebarCollapsed ? "justify-center" : "justify-start"
      )}>
        <motion.div
           layout
           className="shrink-0"
        >
          <BookOpen className="text-accent" size={24} />
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-semibold tracking-tight text-accent whitespace-nowrap"
            >
              Disserta.ai
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center transition-all duration-300 cursor-pointer text-sm font-medium relative group h-12',
                isActive 
                  ? 'bg-accent-light text-accent' 
                  : 'text-text-secondary hover:bg-accent-light/50',
                sidebarCollapsed ? 'justify-center' : 'px-6'
              )}
            >
              <item.icon size={18} className={cn(sidebarCollapsed ? '' : 'mr-3', isActive ? 'text-accent' : 'text-text-muted')} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !sidebarCollapsed && (
                <div className="absolute left-0 top-0 h-full w-1 bg-accent" />
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-text-primary text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin nav (condicional) */}
      {role === 'admin' && (
        <div className="px-3 pb-2">
          {!sidebarCollapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted px-3 mb-1">Admin</p>
          )}
          {adminItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center transition-all duration-300 cursor-pointer text-sm font-medium relative group h-10 rounded-lg',
                  isActive
                    ? 'bg-accent-light text-accent'
                    : 'text-text-secondary hover:bg-accent-light/50',
                  sidebarCollapsed ? 'justify-center' : 'px-3'
                )}
              >
                <item.icon size={17} className={cn(sidebarCollapsed ? '' : 'mr-3', isActive ? 'text-accent' : 'text-text-muted')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap text-xs"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-text-primary text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer / User */}
      <div className={cn(
        "p-4 mt-auto border-t border-border flex flex-col gap-4",
        sidebarCollapsed ? "items-center" : "px-6"
      )}>
        <div className={cn("flex items-center gap-3", sidebarCollapsed ? "justify-center" : "")}>
          {user?.user_metadata?.avatar_url ? (
            <div className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center overflow-hidden shrink-0">
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userInitial}
            </div>
          )}
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-sm overflow-hidden flex flex-col"
            >
              <p className="text-[10px] text-text-muted truncate">Bem-vindo(a),</p>
              <p className="font-medium text-text-primary truncate">{userDisplayName}</p>
            </motion.div>
          )}
        </div>
        
        <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-2" : "justify-between")}>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-text-muted hover:text-accent p-1.5 rounded-md hover:bg-accent/10 transition-colors"
            title={sidebarCollapsed ? "Expandir" : "Recolher"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-text-secondary hover:text-danger p-1.5 rounded-md hover:bg-danger/10 transition-colors"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
