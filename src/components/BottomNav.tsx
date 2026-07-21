import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Files, Settings } from 'lucide-react';
import { cn } from './ui/Base';

const NAV_ITEMS = [
  { label: 'Nova Redação', icon: PlusCircle, href: '/dashboard/nova-redacao' },
  { label: 'Minhas Redações', icon: Files, href: '/dashboard/minhas-redacoes' },
  { label: 'Configurações', icon: Settings, href: '/dashboard/configuracoes' },
];

/**
 * BottomNav — visible only on mobile (md:hidden).
 * Provides tab-bar navigation equivalent to the desktop sidebar.
 */
export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === '/dashboard/minhas-redacoes' &&
              location.pathname.startsWith('/dashboard/minhas-redacoes'));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150 relative',
                isActive
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              )}
              aria-label={item.label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
              )}
              <item.icon
                size={22}
                className={cn(
                  'transition-transform duration-150',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn(
                'text-[10px] font-semibold leading-none transition-all',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {item.label === 'Minhas Redações' ? 'Redações' : item.label === 'Nova Redação' ? 'Nova' : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
