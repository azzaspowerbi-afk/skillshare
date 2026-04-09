import React, { useState } from "react";
import { 
  ArrowLeft, 
  Info, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  PlusCircle, 
  Mail, 
  Zap, 
  Sword 
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Tool } from "../types";

interface CreateQuestProps {
  onBack: () => void;
  onSubmit: (quest: any) => void;
}

export const CreateQuest: React.FC<CreateQuestProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    maxParticipants: 2,
    tools: [] as Tool[],
    guestEmail: ""
  });

  const toolsList: Tool[] = [
    "Reserva ERP", "SAP", "Ferramentas de IA", "Outros", 
    "PowerPoint", "Power BI", "Intelipost", "Ferramentas Plan. Log (WMS)", 
    "Qualitor - Atendente", "N8N", "SQL", "Excel - Avançado", 
    "Excel - Básico", "Python"
  ];

  const handleToolToggle = (tool: Tool) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool) 
        ? prev.tools.filter(t => t !== tool) 
        : [...prev.tools, tool]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl flex items-center justify-center transition-all active:translate-y-1"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
            <PlusCircle className="text-game-accent" size={32} />
            Convocar Nova Missão
          </h1>
          <p className="text-slate-400 font-medium">Compartilhe conhecimento épico com sua equipe.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="game-card p-8 space-y-8 bg-slate-900/50">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-game-cyan border-b border-slate-800 pb-4">
            <Info size={20} />
            <h3 className="text-lg font-display font-bold uppercase tracking-widest">Informações da Missão</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Título da Missão *</label>
              <input 
                type="text" 
                placeholder="Ex: Análise de Dados com Power BI" 
                className="game-input w-full py-3"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição Curta *</label>
              <textarea 
                placeholder="Descreva brevemente o que será abordado na sessão..." 
                className="game-input w-full py-3 min-h-[120px] resize-none"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-game-accent" />
                  Data da Missão *
                </label>
                <input 
                  type="date" 
                  className="game-input w-full py-3 cursor-pointer"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  onClick={(e) => (e.currentTarget as any).showPicker?.()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-game-accent" />
                  Horário de Início *
                </label>
                <input 
                  type="time" 
                  className="game-input w-full py-3 cursor-pointer"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  onClick={(e) => (e.currentTarget as any).showPicker?.()}
                />
              </div>
            </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-game-accent" />
              Número Máximo de Aprendizes (1 a 2) *
            </label>
            <input 
              type="number" 
              min="1" 
              max="2" 
              className="game-input w-full py-3"
              required
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
            />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Até 2 aprendizes por atividade.</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-game-accent" />
              Ferramentas/Plataformas Utilizadas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {toolsList.map(tool => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => handleToolToggle(tool)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                    formData.tools.includes(tool) 
                      ? "bg-game-cyan/20 border-game-cyan/50 text-game-cyan" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    formData.tools.includes(tool) 
                      ? "bg-game-cyan border-game-cyan text-slate-900" 
                      : "bg-slate-900 border-slate-700 group-hover:border-slate-500"
                  )}>
                    {formData.tools.includes(tool) && <CheckCircle2 size={14} />}
                  </div>
                  <span className="text-xs font-bold truncate">{tool}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} className="text-game-accent" />
              Adicionar Participante (Opcional)
            </label>
            <input 
              type="email" 
              placeholder="email@exemplo.com" 
              className="game-input w-full py-3"
              value={formData.guestEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
            />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              Dica: esta lista aparece para administradores. Se você não vê a lista, informe o e-mail do convidado.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800">
          <button 
            type="button" 
            onClick={onBack}
            className="game-button-secondary px-8"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="game-button-primary flex items-center gap-2 px-10"
          >
            <Sword size={20} />
            <span>Criar Missão</span>
          </button>
        </div>
      </form>
    </div>
  );
};
