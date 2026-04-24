import React from "react";
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Star, 
  Zap, 
  Shield, 
  Sword,
  AlertCircle,
  Activity as ActivityIcon,
  CheckCircle2,
  Gift,
  Award,
  Lock
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Quest, RankingUser, UserStats, Activity, Tool } from "../types";
import { QuestCard } from "./QuestCard";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts";

const BookOpen = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

interface DashboardProps {
  stats: UserStats;
  ranking: RankingUser[];
  quests: Quest[];
  activities: Activity[];
  onAction: (action: string) => void;
  onViewQuest: (id: string) => void;
  onDeleteUser?: (uid: string) => void;
  onDeleteQuest?: (id: string) => void;
  onDeleteActivity?: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, ranking, quests, activities, onAction, onViewQuest, onDeleteUser, onDeleteQuest, onDeleteActivity }) => {
  const isAdmin = stats.email?.toLowerCase() === "azzaspowerbi@gmail.com";
  
  // Calculate Skill Data
  const completedQuests = quests.filter(q => 
    q.status === "Concluída" && 
    (q.authorUid === stats.uid || q.participantUids?.includes(stats.uid))
  );

  const skillMap: Record<string, number> = {
    "Power BI": 0,
    "Excel - Avançado": 0,
    "SQL": 0,
    "Python": 0,
    "SAP": 0,
    "Ferramentas de IA": 0,
    "N8N": 0
  };

  completedQuests.forEach(q => {
    q.tools?.forEach(tool => {
      if (skillMap[tool] !== undefined) {
        skillMap[tool] += 1;
      }
    });
  });

  const radarData = Object.entries(skillMap).map(([subject, value]) => ({
    subject,
    A: value * 20, // Scale for visualization
    fullMark: 100,
  }));

  const userQuests = quests.filter(q => 
    q.authorUid === stats.uid || 
    (q.guestEmail && q.guestEmail.toLowerCase() === stats.email?.toLowerCase())
  );

  const statCards = [
    { label: "Missões Concluídas", value: stats.totalQuests || 0, icon: Zap, color: "text-game-cyan", bg: "bg-game-cyan/10" },
    { label: "Ranking", value: `#${ranking.findIndex(r => r.id === stats.uid) + 1 || "-"}`, icon: Users, color: "text-game-accent", bg: "bg-game-accent/10" },
    { label: "Nível", value: stats.level, icon: Calendar, color: "text-game-gold", bg: "bg-game-gold/10" },
    { label: "Total de XP", value: stats.xp, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  const nextLevelXp = stats.level * 500;
  const currentLevelBaseXp = (stats.level - 1) * 500;
  const xpMissing = nextLevelXp - stats.xp;
  const progress = ((stats.xp - currentLevelBaseXp) / 500) * 100;

  const getRewardData = (level: number) => {
    const rewards = [
      { id: 1, title: "Novato da Azzas", benefit: "Início da Jornada", icon: Shield, color: "text-slate-400", hex: "#94a3b8" },
      { id: 2, title: "Aprendiz Iniciado", benefit: "Selo de Bronze no Perfil", icon: Award, color: "text-amber-600", hex: "#d97706" },
      { id: 3, title: "Explorador de Dados", benefit: "Selo de Prata no Perfil", icon: Award, color: "text-slate-300", hex: "#cbd5e1" },
      { id: 4, title: "Guardião de Insights", benefit: "Selo de Ouro no Perfil", icon: Award, color: "text-game-gold", hex: "#fbbf24" },
      { id: 5, title: "Arquiteto de Missões", benefit: "Aura Roxa de Veterano", icon: Shield, color: "text-purple-400", hex: "#a78bfa" },
      { id: 6, title: "Lenda da Azzas", benefit: "Sinalizador 'Elite Analyst'", icon: Trophy, color: "text-game-accent", hex: "#8b5cf6" },
      { id: 7, title: "Sábio Supremo", benefit: "Brilho Lendário no Perfil", icon: Star, color: "text-white", hex: "#ffffff" },
    ];
    return rewards[level - 1] || rewards[rewards.length - 1];
  };

  const currentReward = getRewardData(stats.level);
  const nextReward = getRewardData(stats.level + 1);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">
            Olá, <span className="text-game-accent">{(stats.name || "Herói").split('.')[0]}</span>! 👋
          </h1>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-game-gold/20 text-game-gold rounded-full text-xs font-black uppercase border border-game-gold/30 flex items-center gap-1.5">
              <Shield size={12} />
              Nível {stats.level}
            </div>
            <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1.5", 
              currentReward.color.replace('text-', 'bg-') + '/10',
              currentReward.color,
              currentReward.color.replace('text-', 'border-') + '/30'
            )}>
              <currentReward.icon size={10} />
              {currentReward.title}
            </div>
          </div>
        </div>
        <p className="text-slate-400 font-medium max-w-2xl">
          Bem-vindo ao SkillShare da equipe Azzas 2154. Descubra missões, participe de jornadas épicas e suba de nível com seu time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="game-card p-6 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-black text-white">{stat.value}</p>
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {userQuests.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Suas Próximas Jornadas</h3>
                <button onClick={() => onAction("my-quests")} className="text-xs font-black text-game-cyan uppercase tracking-widest hover:underline">Ver Todas</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userQuests.slice(0, 2).map(quest => (
                  <QuestCard key={quest.id} quest={quest} onViewDetails={onViewQuest} onDelete={onDeleteQuest} user={stats} />
                ))}
              </div>
            </div>
          ) : (
            <div className="game-card p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 border-dashed border-slate-700 bg-slate-900/30">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mb-2">
                <Calendar size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-white">Próximas Missões</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Nenhuma aventura agendada no momento. Seja o primeiro a convocar uma sessão de aprendizado!
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "create", label: "Convocar Missão", desc: "Nova sessão", icon: Zap },
              { id: "tutorial", label: "Manual do Herói", desc: "Como usar", icon: BookOpen },
              { id: "quests", label: "Explorar Mural", desc: "Encontre jornadas", icon: Calendar },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className="game-card p-5 text-left hover:bg-slate-800/50 transition-all group relative"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-game-cyan group-hover:bg-game-cyan/10 transition-all mb-4">
                  <action.icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{action.label}</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{action.desc}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="game-card p-0 overflow-hidden relative group">
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                  <Shield className="text-game-cyan" size={28} />
                  Radar de Habilidades
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                      <Radar
                        name={stats.name}
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase text-center tracking-widest">
                  Evolua completando missões em diferentes áreas para expandir seu radar
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full space-y-6">
          <div className="game-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Trophy className="text-game-gold" size={20} />
                Ranking de Heróis
              </h3>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Top 5</span>
            </div>
            <div className="space-y-4">
              {ranking.slice(0, 5).map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 group hover:border-game-cyan/30 transition-all">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 overflow-hidden",
                    idx === 0 ? "bg-game-gold text-slate-900" : 
                    idx === 1 ? "bg-slate-300 text-slate-900" : 
                    idx === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"
                  )}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-game-cyan transition-colors">{user.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      <span className="flex items-center gap-1"><Star size={10} className="text-game-gold fill-game-gold" /> {user.stars}</span>
                      <span className="flex items-center gap-1"><Sword size={10} /> {user.quests} Missões</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-[10px] font-black text-game-cyan uppercase">Lvl {user.level}</p>
                    {isAdmin && user.id !== stats.uid && onDeleteUser && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(user.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                        title="Apagar Usuário"
                      >
                        <AlertCircle size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="game-card p-6 bg-gradient-to-br from-game-accent/20 to-transparent border-game-accent/30">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star className="text-game-gold fill-game-gold" size={16} />
              Próximas Jornadas
            </h3>
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 font-medium">Nenhuma missão agendada para você ainda.</p>
            </div>
          </div>

          <div className="game-card p-6 flex flex-col flex-1 min-h-0">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-6">
              <ActivityIcon className="text-game-accent" size={20} />
              Mural de Atividades
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-game-accent/30 transition-all group">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    activity.type === "level_up" ? "bg-game-gold/20 text-game-gold" :
                    activity.type === "new_quest" ? "bg-game-cyan/20 text-game-cyan" :
                    "bg-emerald-400/20 text-emerald-400"
                  )}>
                    {activity.type === "level_up" ? <Trophy size={18} /> :
                     activity.type === "new_quest" ? <Zap size={18} /> :
                     <CheckCircle2 size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-300 leading-snug">
                      <span className="font-black text-white">{activity.userName}</span>
                      {activity.type === "level_up" ? ` subiu para o Nível ${activity.level}!` :
                       activity.type === "new_quest" ? ` convocou a missão "${activity.questTitle}"` :
                       ` concluiu a missão "${activity.questTitle}"`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1.5">
                      {activity.timestamp?.toDate ? new Date(activity.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Agora'}
                    </p>
                  </div>
                  {(isAdmin || activity.userUid === stats.uid) && onDeleteActivity && (
                    <button 
                      onClick={() => onDeleteActivity(activity.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 opacity-40 hover:opacity-100 transition-all"
                      title="Apagar Atividade"
                    >
                      <AlertCircle size={14} />
                    </button>
                  )}
                </div>
              )) : (
                <div className="text-center py-20">
                  <p className="text-sm text-slate-500 font-medium italic">Nenhuma atividade recente.</p>
                </div>
              )}
            </div>
          </div>

          <div className="game-card p-6 bg-gradient-to-br from-game-gold/10 to-transparent border-game-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Gift className="text-game-gold" size={16} />
                Próxima Recompensa
              </h3>
              <span className="text-[10px] font-black text-game-gold uppercase tracking-widest bg-game-gold/10 px-2 py-0.5 rounded-full border border-game-gold/20">
                Lvl {stats.level + 1}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso do Nível</p>
                  <p className="text-xs font-bold text-white">{stats.xp} <span className="text-slate-500">/ {nextLevelXp} XP</span></p>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-game-gold to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">
                  Faltam <span className="text-game-gold font-bold">{xpMissing} XP</span> para o próximo nível
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Próximo Desbloqueio</p>
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-2 group hover:border-game-gold/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Award className="text-game-gold" size={14} />
                    <p className="text-xs font-black text-white uppercase tracking-tight">{nextReward.title}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    <span className="text-slate-500 font-bold">BÔNUS:</span> {nextReward.benefit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
