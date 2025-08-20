import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/dashboard" && (location === "/" || location === "/dashboard")) return true;
    return location === path;
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Fixed Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 container-gradient-dark">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center rounded btn-gradient">
                <Shield className="text-white text-xl" size={24} data-testid="logo-icon" />
              </div>
              <span className="text-white text-xl font-semibold">Gestão de Sinistros</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex space-x-8">
              <Link href="/dashboard" data-testid="nav-dashboard">
                <span className={`font-medium px-4 py-2 rounded ${
                  isActive("/dashboard") ? "text-white" : "text-subtitle-dark"
                }`}>
                  Dashboard
                </span>
              </Link>
              <Link href="/novo-sinistro" data-testid="nav-novo-sinistro">
                <span className={`font-medium px-4 py-2 rounded ${
                  isActive("/novo-sinistro") ? "text-white" : "text-subtitle-dark"
                }`}>
                  Novo Sinistro
                </span>
              </Link>
              <Link href="/detalhe-do-sinistro" data-testid="nav-detalhe-do-sinistro">
                <span className={`font-medium px-4 py-2 rounded ${
                  isActive("/detalhe-do-sinistro") ? "text-white" : "text-subtitle-dark"
                }`}>
                  Detalhe do Sinistro
                </span>
              </Link>
              <Link href="/relatorios" data-testid="nav-relatorios">
                <span className={`font-medium px-4 py-2 rounded ${
                  isActive("/relatorios") ? "text-white" : "text-subtitle-dark"
                }`}>
                  Relatórios
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark py-4 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-subtitle-dark text-sm">Gestão de Sinistros • 2025</p>
        </div>
      </footer>
    </div>
  );
}
