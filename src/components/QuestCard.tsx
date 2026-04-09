import React from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  Zap,
  Trash2 
} from "lucide-react";
import { cn } from "../lib/utils";
import { Quest, UserStats } from "../types";

interface QuestCardProps {
  quest: Quest;
  onViewDetails: (id: string) => void;
  onDelete?: (id: string) => void;
  user: UserStats;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onViewDetails, onDelete, user }) => {
  const isAdmin = user.email?.toLowerCase() === "azzaspowerbi@gmail.com";
  const isAuthor = quest.authorUid === user.uid;
  const isParticipant = quest.participantUids?.includes(user.uid) || 
                        (quest.guestEmail && quest.guestEmail.toLowerCase() === user.email?.toLowerCase());
  const isIncluded = isAuthor || isParticipant;

  return (
    <div className={cn(
      "game-card p-6 flex flex-col gap-6 group transition-all relative overflow-hidden",
      isIncluded ? "border-game-cyan/50 bg-game-cyan/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "hover:border-game-cyan/30"
    )}>
      {isIncluded && (
        <div className="absolute top-0 right-0">
          <div className={cn(
            "text-slate-900 text-[8px] font-black uppercase px-3 py-1 rotate-45 translate-x-4 translate-y-1 shadow-sm",
            isAuthor ? "bg-game-gold" : "bg-game-cyan"
          )}>
            {isAuthor ? "Mestre" : "Inscrito"}
          </div>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-display font-black text-white group-hover:text-game-cyan transition-colors leading-tight">
            {quest.title}
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={12} className="text-game-accent" />
            com {quest.author}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
            quest.status === "Criada" ? "bg-game-cyan/20 text-game-cyan border-game-cyan/30" :
            quest.status === "Em Progresso" ? "bg-game-gold/20 text-game-gold border-game-gold/30" :
            "bg-emerald-400/20 text-emerald-400 border-emerald-400/30"
          )}>
            {quest.status}
          </div>
          {isAdmin && onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(quest.id);
              }}
              className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
              title="Apagar Missão"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={14} className="text-game-accent" />
          <span className="text-xs font-bold">{quest.date} às {quest.startTime}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={14} className="text-game-accent" />
          <span className="text-xs font-bold">{quest.currentParticipants}/{quest.maxParticipants} Participantes</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Star size={14} className="text-game-accent" />
          <span className="text-xs font-bold">{quest.rating ? `${quest.rating} Estrelas` : "Sem avaliações"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck size={14} className="text-game-accent" />
          <span className="text-xs font-bold truncate">{quest.tools.slice(0, 1).join("")}{quest.tools.length > 1 ? ` +${quest.tools.length - 1}` : ""}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quest.tools.slice(0, 3).map(tool => (
          <span key={tool} className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-[10px] font-black uppercase tracking-tighter border border-slate-700">
            {tool}
          </span>
        ))}
        {quest.tools.length > 3 && (
          <span className="px-2 py-1 bg-slate-800 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-tighter border border-slate-700">
            +{quest.tools.length - 3}
          </span>
        )}
      </div>

      <button 
        onClick={() => onViewDetails(quest.id)}
        className="w-full game-button-primary flex items-center justify-center gap-2 py-3"
      >
        <span>Ver Detalhes da Quest</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
