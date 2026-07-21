import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from './ui/Base';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-bg/80 backdrop-blur-md border-b border-border py-3 md:py-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
          <BookOpen className="text-accent group-hover:scale-105 transition-transform shrink-0" size={20} />
          <span className="text-lg md:text-2xl font-bold tracking-tight text-accent">Disserta.ai</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/login">
            <Button variant="ghost" className="px-2 md:px-4 text-xs md:text-sm whitespace-nowrap">Entrar</Button>
          </Link>
          <Link to="/cadastro" className="relative btn-heartbeat inline-block">
            <Button className="relative px-3 md:px-6 text-xs md:text-sm whitespace-nowrap">Começar grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
