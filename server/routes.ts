import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { getStorage } from "./storage";
import { insertSinistroSchema, insertClaimSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard endpoint - get claims list with filters
  app.get("/api/dashboard", async (req, res) => {
    try {
      const { data_inicio, data_fim, busca, status, periodo } = req.query;
      
      const filters = {
        data_inicio: data_inicio as string,
        data_fim: data_fim as string,
        busca: busca as string,
        status: status as string,
        periodo: periodo as string,
      };

      const storage = await getStorage();
      const result = await storage.getDashboardData(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get sinistro by ID
  app.get("/api/sinistros/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      const sinistro = await storage.getSinistroById(id);
      
      if (!sinistro) {
        return res.status(404).json({ message: "Sinistro não encontrado" });
      }

      res.json(sinistro);
    } catch (error) {
      console.error("Error fetching sinistro:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get documentos by sinistro ID
  app.get("/api/documentos/:sinistroId", async (req, res) => {
    try {
      const { sinistroId } = req.params;
      const storage = await getStorage();
      const documentos = await storage.getDocumentosBySinistroId(sinistroId);
      res.json(documentos);
    } catch (error) {
      console.error("Error fetching documentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get pendencias by sinistro ID
  app.get("/api/pendencias/:sinistroId", async (req, res) => {
    try {
      const { sinistroId } = req.params;
      const storage = await getStorage();
      const pendencias = await storage.getPendenciasBySinistroId(sinistroId);
      res.json(pendencias);
    } catch (error) {
      console.error("Error fetching pendencias:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get andamentos by sinistro ID
  app.get("/api/andamentos/:sinistroId", async (req, res) => {
    try {
      const { sinistroId } = req.params;
      const storage = await getStorage();
      const andamentos = await storage.getAndamentosBySinistroId(sinistroId);
      res.json(andamentos);
    } catch (error) {
      console.error("Error fetching andamentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get relatorios data
  app.get("/api/relatorios", async (req, res) => {
    try {
      const { data_inicio, data_fim } = req.query;
      
      if (!data_inicio || !data_fim) {
        return res.status(400).json({ message: "Período é obrigatório" });
      }

      const storage = await getStorage();
      const result = await storage.getRelatorioMensal(data_inicio as string, data_fim as string);
      res.json(result);
    } catch (error) {
      console.error("Error fetching relatorio data:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get claim detailed data for DetalheSinistro page
  app.get("/api/claims/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      
      // Get main claim data
      const claim = await storage.getClaimById(id);
      if (!claim) {
        return res.status(404).json({ message: "Claim não encontrado" });
      }

      // Get related data
      const [estimativa, oficina, agenda, terceiro, arquivos, eventos] = await Promise.all([
        storage.getEstimativaByClaimId(id),
        claim.oficina_id ? storage.getOficinaById(claim.oficina_id) : null,
        storage.getAgendaByClaimId(id),
        storage.getTerceiroByClaimId(id),
        storage.getArquivosByClaimId(id),
        storage.getEventosLogByClaimId(id)
      ]);

      res.json({
        claim,
        estimativa,
        oficina,
        agenda,
        terceiro,
        arquivos,
        eventos
      });
    } catch (error) {
      console.error("Error fetching claim details:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create new sinistro
  app.post("/api/sinistros", async (req, res) => {
    try {
      const validatedData = insertSinistroSchema.parse(req.body);
      const storage = await getStorage();
      const sinistro = await storage.createSinistro(validatedData);
      
      // Add creation event to andamentos
      await storage.createAndamento({
        sinistro_id: sinistro.id,
        tipo_evento: "criacao",
        descricao: "Sinistro criado no sistema",
        origem: "sistema"
      });

      res.status(201).json(sinistro);
    } catch (error) {
      console.error("Error creating sinistro:", error);
      res.status(500).json({ message: "Erro ao criar sinistro" });
    }
  });

  // Update sinistro protocol
  app.patch("/api/sinistros/:id/protocol", async (req, res) => {
    try {
      const { id } = req.params;
      const { protocolo } = req.body;
      
      const storage = await getStorage();
      await storage.updateSinistroProtocol(id, protocolo);
      
      // Add protocol event to andamentos
      await storage.createAndamento({
        sinistro_id: id,
        tipo_evento: "protocolo_gerado",
        descricao: `Protocolo gerado: ${protocolo}`,
        origem: "sistema"
      });

      res.json({ message: "Protocolo atualizado" });
    } catch (error) {
      console.error("Error updating protocol:", error);
      res.status(500).json({ message: "Erro ao atualizar protocolo" });
    }
  });

  // Update sinistro status
  app.patch("/api/sinistros/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const storage = await getStorage();
      await storage.updateSinistroStatus(id, status);
      
      // Add status change event to andamentos
      await storage.createAndamento({
        sinistro_id: id,
        tipo_evento: "status_alterado",
        descricao: `Status alterado para: ${status}`,
        origem: "sistema"
      });

      res.json({ message: "Status atualizado" });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: "Erro ao atualizar status" });
    }
  });

  // Create documento
  app.post("/api/documentos", async (req, res) => {
    try {
      const storage = await getStorage();
      const documento = await storage.createDocumento(req.body);
      
      // Add document upload event to andamentos
      await storage.createAndamento({
        sinistro_id: req.body.sinistro_id,
        tipo_evento: "documento_anexado",
        descricao: `Documento anexado: ${req.body.tipo_documento} - ${req.body.nome_arquivo}`,
        origem: "sistema"
      });

      res.status(201).json(documento);
    } catch (error) {
      console.error("Error creating documento:", error);
      res.status(500).json({ message: "Erro ao criar documento" });
    }
  });

  // Create pendencia
  app.post("/api/pendencias", async (req, res) => {
    try {
      const storage = await getStorage();
      const pendencia = await storage.createPendencia(req.body);
      
      // Add pendencia creation event to andamentos
      await storage.createAndamento({
        sinistro_id: req.body.sinistro_id,
        tipo_evento: "pendencia_criada",
        descricao: `Pendência criada: ${req.body.descricao}`,
        origem: req.body.solicitada_por
      });

      res.status(201).json(pendencia);
    } catch (error) {
      console.error("Error creating pendencia:", error);
      res.status(500).json({ message: "Erro ao criar pendência" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
