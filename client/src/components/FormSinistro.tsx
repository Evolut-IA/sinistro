import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  placa: z.string().min(7, "Placa é obrigatória"),
  cpf_segurado: z.string().min(11, "CPF é obrigatório"),
  data_evento: z.string().min(1, "Data do evento é obrigatória"),
  local_evento_cidade: z.string().min(1, "Cidade é obrigatória"),
  local_evento_uf: z.string().min(2, "UF é obrigatória"),
  tipo_sinistro: z.string().min(1, "Tipo de sinistro é obrigatório"),
  resumo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormSinistroProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export default function FormSinistro({ onSubmit, isLoading }: FormSinistroProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange"
  });

  const watchedValues = watch();

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  return (
    <div className="rounded-lg p-6 container-gradient">
      <h3 className="cor-titulo font-semibold text-lg mb-6">Dados do Sinistro</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placa - Obrigatório */}
          <div>
            <Label className="cor-titulo text-sm font-medium mb-2">
              Placa do Veículo <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("placa")}
              placeholder="ABC1D23"
              className="w-full px-3 py-2 rounded input-themed no-outline"
              data-testid="input-placa"
            />
            {errors.placa && (
              <p className="text-red-400 text-sm mt-1">{errors.placa.message}</p>
            )}
          </div>

          {/* CPF Segurado - Obrigatório */}
          <div>
            <Label className="cor-titulo text-sm font-medium mb-2">
              CPF do Segurado <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("cpf_segurado")}
              placeholder="12345678901"
              className="w-full px-3 py-2 rounded input-themed no-outline"
              data-testid="input-cpf-segurado"
            />
            {errors.cpf_segurado && (
              <p className="text-red-400 text-sm mt-1">{errors.cpf_segurado.message}</p>
            )}
          </div>

          {/* Data do Evento - Obrigatório */}
          <div>
            <Label className="cor-titulo text-sm font-medium mb-2">
              Data do Evento <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("data_evento")}
              type="datetime-local"
              className="w-full px-3 py-2 rounded input-themed no-outline"
              data-testid="input-data-evento"
            />
            {errors.data_evento && (
              <p className="text-red-400 text-sm mt-1">{errors.data_evento.message}</p>
            )}
          </div>

          {/* Tipo Sinistro - Obrigatório */}
          <div>
            <Label className="cor-titulo text-sm font-medium mb-2">
              Tipo de Sinistro <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={watchedValues.tipo_sinistro || ""} 
              onValueChange={(value) => handleSelectChange("tipo_sinistro", value)}
            >
              <SelectTrigger className="w-full px-3 py-2 rounded input-themed no-outline" data-testid="select-tipo-sinistro">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colisao">Colisão</SelectItem>
                <SelectItem value="roubo">Roubo</SelectItem>
                <SelectItem value="furto">Furto</SelectItem>
                <SelectItem value="incendio">Incêndio</SelectItem>
                <SelectItem value="vandalismo">Vandalismo</SelectItem>
                <SelectItem value="fenomeno_natural">Fenômeno Natural</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_sinistro && (
              <p className="text-red-400 text-sm mt-1">{errors.tipo_sinistro.message}</p>
            )}
          </div>

          {/* Cidade - Obrigatório */}
          <div>
            <Label className="cor-titulo text-sm font-medium mb-2">
              Cidade do Evento <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("local_evento_cidade")}
              placeholder="São Paulo"
              className="w-full px-3 py-2 rounded input-themed no-outline"
              data-testid="input-cidade"
            />
            {errors.local_evento_cidade && (
              <p className="text-red-400 text-sm mt-1">{errors.local_evento_cidade.message}</p>
            )}
          </div>

          {/* UF - Obrigatório */}
          <div>
            <Label className="cor-titulo text-sm font-medium mb-2">
              UF <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={watchedValues.local_evento_uf || ""} 
              onValueChange={(value) => handleSelectChange("local_evento_uf", value)}
            >
              <SelectTrigger className="w-full px-3 py-2 rounded input-themed no-outline" data-testid="select-uf">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="AL">AL</SelectItem>
                <SelectItem value="AP">AP</SelectItem>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="BA">BA</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="DF">DF</SelectItem>
                <SelectItem value="ES">ES</SelectItem>
                <SelectItem value="GO">GO</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="MT">MT</SelectItem>
                <SelectItem value="MS">MS</SelectItem>
                <SelectItem value="MG">MG</SelectItem>
                <SelectItem value="PA">PA</SelectItem>
                <SelectItem value="PB">PB</SelectItem>
                <SelectItem value="PR">PR</SelectItem>
                <SelectItem value="PE">PE</SelectItem>
                <SelectItem value="PI">PI</SelectItem>
                <SelectItem value="RJ">RJ</SelectItem>
                <SelectItem value="RN">RN</SelectItem>
                <SelectItem value="RS">RS</SelectItem>
                <SelectItem value="RO">RO</SelectItem>
                <SelectItem value="RR">RR</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="SP">SP</SelectItem>
                <SelectItem value="SE">SE</SelectItem>
                <SelectItem value="TO">TO</SelectItem>
              </SelectContent>
            </Select>
            {errors.local_evento_uf && (
              <p className="text-red-400 text-sm mt-1">{errors.local_evento_uf.message}</p>
            )}
          </div>
        </div>

        {/* Resumo - Opcional */}
        <div>
          <Label className="cor-titulo text-sm font-medium mb-2">Resumo (Opcional)</Label>
          <Textarea
            {...register("resumo")}
            placeholder="Descreva brevemente o que aconteceu..."
            className="w-full px-3 py-2 rounded input-themed no-outline"
            rows={4}
            data-testid="textarea-resumo"
          />
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="btn-gradient text-white font-medium rounded px-8"
            data-testid="BtnCriarSinistro"
          >
            {isLoading ? "Criando..." : "Criar Sinistro"}
          </Button>
        </div>
      </form>
    </div>
  );
}
