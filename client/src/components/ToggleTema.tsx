import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ToggleTema() {
  const [isSolActive, setIsSolActive] = useState(false);

  useEffect(() => {
    // Aplicar tema inicial (Lua por padrão)
    if (isSolActive) {
      document.documentElement.classList.add('tema-sol');
    } else {
      document.documentElement.classList.remove('tema-sol');
    }
  }, [isSolActive]);

  const toggleTema = () => {
    setIsSolActive(prev => !prev);
  };

  return (
    <button
      onClick={toggleTema}
      className="flex items-center space-x-2 px-3 py-2 rounded"
      data-testid="button-toggle-tema"
    >
      {isSolActive ? (
        <Sun className="cor-icone-botoes" size={20} />
      ) : (
        <Moon className="cor-icone-botoes" size={20} />
      )}
      <span className="cor-titulo text-sm font-medium">Tema</span>
    </button>
  );
}