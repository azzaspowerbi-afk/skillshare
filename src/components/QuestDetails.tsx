import React from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  Zap, 
  ShieldCheck, 
  Mail,
  Sword,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Share2,
  Check,
  Settings
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Quest, RankingUser } from "../types";
import { auth } from "../firebase";

interface QuestDetailsProps {
  quest: Quest;
  onBack: () => void;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  onStatusUpdate?: (id: string, status: Quest["status"]) => void;
  onRate?: (id: string, rating: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAuthor: boolean;
  isParticipant: boolean;
  isAdmin?: boolean;
  participants?: RankingUser[];
}

export const QuestDetails: React.FC<QuestDetailsProps> = ({ 
  quest, 
  onBack, 
  onJoin, 
  onLeave,
  onStatusUpdate,
  onRate,
  onEdit,
  onDelete,
  isAuthor,
  isParticipant,
  isAdmin,
  participants = []
}) => {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [isRated, setIsRated] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?questId=${quest.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  React.useEffect(() => {
    if (quest.ratedBy?.includes(auth.currentUser?.uid || "")) {
      setIsRated(true);
    }
  }, [quest.ratedBy]);

  const handleRate = (value: number) => {
    if (onRate) {
      onRate(quest.id, value);
      setRating(value);
      setIsRated(true);
    }
  };
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl flex items-center justify-center transition-all active:translate-y-1"
            title="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <button 
            onClick={handleShare}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:translate-y-1 border",
              copied 
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
            )}
            title="Compartilhar Missão"
          >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
          </button>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
            Detalhes da Missão
          </h1>
          <p className="text-slate-400 font-medium">Informações completas sobre esta jornada épica.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="game-card p-8 space-y-6 bg-slate-900/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">
                  {quest.title}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                    {quest.authorPhotoURL ? (
                      <img src={quest.authorPhotoURL} alt={quest.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Zap size={12} className="text-game-accent m-auto" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-game-accent font-bold uppercase text-xs tracking-widest">
                    Mestre: {quest.author}
                  </div>
                  <div className="w-1 h-1 bg-slate-700 rounded-full" />
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    {quest.authorEmail}
                  </div>
                </div>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase border",
                quest.status === "Criada" ? "bg-game-cyan/20 text-game-cyan border-game-cyan/30" :
                quest.status === "Em Progresso" ? "bg-game-gold/20 text-game-gold border-game-gold/30" :
                "bg-emerald-400/20 text-emerald-400 border-emerald-400/30"
              )}>
                {quest.status}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Descrição da Missão</h3>
              <p className="text-slate-300 leading-relaxed font-medium">
                {quest.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Cronograma</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-game-accent">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-bold">{quest.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-game-accent">
                      <Clock size={16} />
                    </div>
                    <span className="text-sm font-bold">{quest.startTime}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Participantes</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-game-accent">
                      <Users size={16} />
                    </div>
                    <span className="text-sm font-bold">{quest.currentParticipants} / {quest.maxParticipants} Aprendizes</span>
                  </div>

                  {participants.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lista de Aprendizes:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {participants.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-800/50">
                            <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden border border-slate-600 flex-shrink-0">
                              {p.photoURL ? (
                                <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                  {p.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-200 leading-none">{p.name}</span>
                              <span className="text-[9px] text-slate-500 font-medium">{p.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {quest.guestEmail && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-game-accent">
                        <Mail size={16} />
                      </div>
                      <span className="text-sm font-bold truncate">{quest.guestEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Ferramentas Utilizadas</h3>
              <div className="flex flex-wrap gap-2">
                {(quest.tools || []).map(tool => (
                  <span key={tool} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="game-card p-6 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Sword size={18} className="text-game-accent" />
              Ações da Missão
            </h3>
            
            <div className="space-y-3">
              {onJoin && quest.status === "Criada" && quest.currentParticipants < quest.maxParticipants && !isAuthor && !isParticipant && (
                <button 
                  onClick={() => onJoin(quest.id)}
                  className="w-full game-button-primary flex items-center justify-center gap-2 py-4"
                >
                  <Sword size={20} />
                  <span>Participar da Missão</span>
                </button>
              )}

              {isParticipant && quest.status === "Criada" && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="w-full bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Você já está inscrito</span>
                  </div>
                  {onLeave && (
                    <button 
                      onClick={() => onLeave(quest.id)}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Sair da Missão</span>
                    </button>
                  )}
                </div>
              )}

              {isAuthor && quest.status === "Criada" && (
                <button 
                  onClick={() => onStatusUpdate(quest.id, "Em Progresso")}
                  className="w-full game-button-primary flex items-center justify-center gap-2 py-4"
                >
                  <Zap size={20} />
                  <span>Iniciar Missão</span>
                </button>
              )}
              
              {onStatusUpdate && quest.status === "Em Progresso" && (
                <button 
                  onClick={() => onStatusUpdate(quest.id, "Concluída")}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  <span>Concluir Missão</span>
                </button>
              )}

              {isParticipant && quest.status === "Concluída" && !isRated && onRate && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-game-gold/30 space-y-4">
                  <div className="flex items-center gap-2 text-game-gold">
                    <Star size={16} className="fill-game-gold" />
                    <span className="text-xs font-black uppercase tracking-widest">Avalie o Mestre</span>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(value)}
                        className="transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star 
                          size={28} 
                          className={cn(
                            "transition-colors",
                            (hoverRating || rating) >= value 
                              ? "text-game-gold fill-game-gold" 
                              : "text-slate-600"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold text-center uppercase">
                    Sua avaliação ajuda a melhorar o ranking!
                  </p>
                </div>
              )}

              {isRated && quest.status === "Concluída" && (
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Missão Avaliada</span>
                </div>
              )}

              {(isAdmin || isAuthor) && onEdit && (
                <button 
                  onClick={() => onEdit(quest.id)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Settings size={16} />
                  <span>Editar Missão</span>
                </button>
              )}

              {(isAdmin || isAuthor) && onDelete && (
                <button 
                  onClick={() => onDelete(quest.id)}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} />
                  <span>Apagar Missão</span>
                </button>
              )}

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-game-gold">
                  <Star size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Recompensa</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                  Ao concluir esta missão, o mestre recebe 100 XP e os aprendizes recebem 50 XP cada.
                </p>
              </div>
            </div>
          </div>

          <div className="game-card p-6 bg-slate-900/50 border-dashed border-slate-700">
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Aviso Importante</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Certifique-se de que todos os participantes estejam presentes antes de iniciar a missão. O XP será creditado automaticamente após a conclusão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
