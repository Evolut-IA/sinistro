import { useToast } from "@/hooks/use-toast";

export function useToastNotification() {
  const { toast } = useToast();

  const showSuccess = (message: string) => {
    toast({
      title: "Sucesso",
      description: message,
      variant: "default",
    });
  };

  const showError = (message: string) => {
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    });
  };

  return { showSuccess, showError };
}
