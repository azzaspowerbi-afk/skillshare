import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  Users, 
  Trophy, 
  Zap, 
  Sword 
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Quest, UserStats } from "../types";
import { QuestCard } from "./QuestCard";

interface QuestBoardProps {
  quests: Quest[];
  onAction: (action: string) => void;
  onViewQuest: (id: string) => void;
  onDeleteQuest?: (id: string) => void;
  user: UserStats;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onAction, onViewQuest, onDeleteQuest, user }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");

  const isAdmin = user.email === "azzaspowerbi@gmail.com";

  const filteredQuests = quests.filter(q => {
    const title = q.title || "";
    const description = q.description || "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          description.toLowerCase().includes(search.toLowerCase()) ||
                          (q.tools || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = filter === "Todas" || 
                          (filter === "Disponíveis" && q.currentParticipants < q.maxParticipants) ||
                          (filter === "Lotadas" && q.currentParticipants >= q.maxParticipants) ||
                          (filter === "Minhas Inscrições" && (
                            q.authorUid === user.uid ||
                            (q.guestEmail && q.guestEmail.toLowerCase() === user.email?.toLowerCase()) ||
                            (q.participantUids && q.participantUids.includes(user.uid))
                          ));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Sword className="text-game-accent" size={32} />
            Mural de Missões
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Descubra e participe das sessões de aprendizado da equipe. Ganhe XP e suba no ranking!
          </p>
        </div>
        <button 
          onClick={() => onAction("create")}
          className="game-button-primary flex items-center gap-2 px-8 py-3 w-fit"
        >
          <PlusCircle size={20} />
          <span>Convocar Missão</span>
        </button>
      </header>

      <div className="game-card p-6 flex flex-col md:flex-row items-center gap-4 bg-slate-900/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título, descrição ou ferramenta..." 
            className="game-input w-full !pl-12 py-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="text-slate-500 mr-2 shrink-0" size={18} />
          {["Todas", "Disponíveis", "Minhas Inscrições", "Lotadas"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shrink-0",
                filter === f 
                  ? "bg-game-accent text-white" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest, idx) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <QuestCard quest={quest} onViewDetails={onViewQuest} onDelete={onDeleteQuest} user={user} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="game-card p-20 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-slate-700 bg-slate-900/30">
          <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-2">
            <Calendar size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold text-white">Nenhuma Missão Disponível</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Seja o primeiro a convocar uma sessão de aprendizado!
            </p>
          </div>
          <button 
            onClick={() => onAction("create")}
            className="game-button-primary flex items-center gap-2 px-8 py-3"
          >
            <Sword size={20} />
            <span>Convocar Primeira Missão</span>
          </button>
        </div>
      )}
    </div>
  );
};
