import { NavLink } from 'react-router-dom';
import { Home, RefreshCw, Target } from 'lucide-react';

export function ModuleNav() {
  const baseClass = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors';
  const activeClass = 'bg-primary text-primary-foreground';
  const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-muted';

  return (
    <nav className="flex items-center gap-1">
      <NavLink
        to="/home"
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <RefreshCw className="h-4 w-4" />
        <span>Renovações</span>
      </NavLink>
      <NavLink
        to="/prospeccoes"
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <Target className="h-4 w-4" />
        <span>Prospecções</span>
      </NavLink>
    </nav>
  );
}
