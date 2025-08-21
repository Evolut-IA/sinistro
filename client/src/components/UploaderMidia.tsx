import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, FileImage, File } from "lucide-react";

interface ArquivoUpload {
  id: string;
  file: File;
  preview?: string;
  tipo: string;
}

interface UploaderMidiaProps {
  claimId?: string;
  onUpload: (files: ArquivoUpload[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  maxFiles?: number;
}

export default function UploaderMidia({ 
  claimId, 
  onUpload, 
  isLoading, 
  disabled = false,
  maxFiles = 10 
}: UploaderMidiaProps) {
  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (arquivos.length + files.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const novosArquivos: ArquivoUpload[] = files.map(file => {
      const arquivo: ArquivoUpload = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        tipo: file.type.startsWith('image/') ? 'foto_danos' : 'documento'
      };

      // Gerar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          arquivo.preview = e.target?.result as string;
          setArquivos(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      return arquivo;
    });

    setArquivos(prev => [...prev, ...novosArquivos]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeArquivo = (id: string) => {
    setArquivos(prev => prev.filter(arquivo => arquivo.id !== id));
  };

  const handleUpload = () => {
    if (arquivos.length > 0) {
      onUpload(arquivos);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="rounded-lg p-6 container-gradient">
      <h3 className="cor-titulo font-semibold text-lg mb-6">
        {claimId ? "Enviar Documentos e Mídias" : "Anexos Iniciais"}
      </h3>

      {/* Upload Area */}
      <div className="mb-6">
        <Label className="cor-titulo text-sm font-medium mb-2">
          Selecionar Arquivos (Fotos, Documentos)
        </Label>
        <div 
          className="rounded-lg p-8 text-center transition-colors cursor-pointer container-gradient no-outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="cor-titulo mb-2">Clique para selecionar arquivos</p>
          <p className="cor-subtitulo text-sm">
            Imagens (JPG, PNG, GIF) e documentos (PDF, DOC, DOCX)
          </p>
          <p className="cor-subtitulo text-xs mt-2">
            Máximo: {maxFiles} arquivos • 10MB por arquivo
          </p>
        </div>
        
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Lista de Arquivos */}
      {arquivos.length > 0 && (
        <div className="mb-6">
          <h4 className="cor-titulo font-medium mb-3">
            Arquivos Selecionados ({arquivos.length})
          </h4>
          <div className="space-y-2">
            {arquivos.map((arquivo) => (
              <div 
                key={arquivo.id}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg no-outline"
              >
                {/* Preview ou Ícone */}
                <div className="flex-shrink-0">
                  {arquivo.preview ? (
                    <img 
                      src={arquivo.preview} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : arquivo.file.type.startsWith('image/') ? (
                    <FileImage className="w-12 h-12 text-blue-400" />
                  ) : (
                    <File className="w-12 h-12 text-green-400" />
                  )}
                </div>

                {/* Info do Arquivo */}
                <div className="flex-grow min-w-0">
                  <p className="cor-titulo text-sm font-medium truncate">
                    {arquivo.file.name}
                  </p>
                  <p className="cor-subtitulo text-xs">
                    {formatFileSize(arquivo.file.size)} • {arquivo.tipo}
                  </p>
                </div>

                {/* Botão Remover */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArquivo(arquivo.id)}
                  className="text-red-400 hover:text-red-300"
                  disabled={disabled}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de Upload */}
      {arquivos.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={isLoading || disabled || arquivos.length === 0}
            className="btn-gradient text-white font-medium rounded px-8"
            data-testid="BtnEnviarMidia"
          >
            {isLoading ? "Enviando..." : `Enviar ${arquivos.length} arquivo${arquivos.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}

      {/* Status */}
      {claimId && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
          <p className="cor-subtitulo text-sm">
            ℹ️ Após o envio, você poderá ir para a página de detalhes do sinistro.
          </p>
        </div>
      )}
    </div>
  );
}
