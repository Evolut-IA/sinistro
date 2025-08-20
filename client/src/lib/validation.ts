import { z } from "zod";

export const validateForm = (data: any, schema: z.ZodSchema): boolean => {
  try {
    schema.parse(data);
    return true;
  } catch (error) {
    console.error("Validation failed:", error);
    return false;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePlaca = (placa: string): boolean => {
  return placa.length >= 7 && placa.length <= 8;
};

export const validateNome = (nome: string): boolean => {
  return nome.length >= 3;
};

export const validateTelefone = (telefone: string): boolean => {
  return telefone.trim().length > 0;
};
