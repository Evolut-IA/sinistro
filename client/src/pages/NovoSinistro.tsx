import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { callWebhook } from "@/lib/webhooks";
import { useToastNotification } from "@/components/Toast";
import { validateForm } from "@/lib/validation";

const novoSinistroSchema = z.object({
  segurado_nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  segurado_email: z.string().email("E-mail deve ser válido"),
  segurado_telefone: z.string().min(1, "Telefone é obrigatório"),
  placa: z.string().min(7, "Placa deve ter 7 ou 8 caracteres").max(8, "Placa deve ter 7 ou 8 caracteres"),
  seguradora_nome: z.string().min(1, "Seguradora é obrigatória"),
  tipo_sinistro: z.string().min(1, "Tipo de sinistro deve ser selecionado"),
  resumo: z.string().optional(),
});

type NovoSinistroForm = z.infer<typeof novoSinistroSchema>;

export default function NovoSinistro() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  const form = useForm<NovoSinistroForm>({
    resolver: zodResolver(novoSinistroSchema),
    defaultValues: {
      segurado_nome: "",
      segurado_email: "",
      segurado_telefone: "",
      placa: "",
      seguradora_nome: "",
      tipo_sinistro: "",
      resumo: "",
    },
  });

  const onSubmit = async (data: NovoSinistroForm) => {
    if (!validateForm(data, novoSinistroSchema)) {
      showError("Preencha os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const response = await callWebhook("WH_SINISTRO_CREATE", data);
      if (response?.sinistro_id) {
        showSuccess("Sinistro criado");
        form.reset();
        setLocation(`/detalhe-do-sinistro?id=${response.sinistro_id}`);
      }
    } catch (error) {
      showError("Não foi possível criar o sinistro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setLocation("/dashboard");
  };

  return (
    <div className="cor-fundo-site min-h-screen">
      {/* Header Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient-dark">
            <h1 className="text-4xl font-bold text-white mb-2">Novo Sinistro</h1>
            <p className="text-subtitle-dark text-lg">Informe os dados essenciais para abertura</p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-4 bg-blue-900 border border-blue-700">
            <p className="text-blue-200 text-center">
              <i className="fas fa-info-circle mr-2"></i>
              Prazo de referência de 30 dias corridos a partir da data de aviso
            </p>
          </div>
        </div>
      </section>

      {/* Top Info Image */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <img
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
              alt="Modern car dashboard with technology interface"
              className="rounded-lg mx-auto w-full max-w-2xl h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="rounded-lg p-8 container-gradient-dark">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} data-testid="form-novo-sinistro">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <FormField
                    control={form.control}
                    name="segurado_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">Segurado nome *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
                            className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                            data-testid="input-segurado-nome"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="segurado_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">Segurado e-mail *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                            data-testid="input-segurado-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="segurado_telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">Segurado telefone *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                            data-testid="input-segurado-telefone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">Placa *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABC1234"
                            className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                            data-testid="input-placa"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seguradora_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">Seguradora nome *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da seguradora"
                            className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                            data-testid="input-seguradora-nome"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_sinistro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">Tipo de sinistro *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-tipo-sinistro">
                          <FormControl>
                            <SelectTrigger className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="colisao">Colisão</SelectItem>
                            <SelectItem value="roubo_furto">Roubo/Furto</SelectItem>
                            <SelectItem value="alagamento">Alagamento</SelectItem>
                            <SelectItem value="incendio">Incêndio</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resumo"
                  render={({ field }) => (
                    <FormItem className="mb-8">
                      <FormLabel className="text-white text-sm font-medium">Resumo (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Descreva brevemente o ocorrido..."
                          className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white"
                          data-testid="textarea-resumo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="px-6 py-2 text-subtitle-dark font-medium rounded border border-gray-600"
                    data-testid="button-cancelar"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 btn-gradient text-white font-medium rounded"
                    data-testid="button-criar-sinistro"
                  >
                    {isLoading ? "Enviando..." : "Criar Sinistro"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
