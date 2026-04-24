import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  UserCircle, 
  PlusCircle, 
  BookOpen, 
  LogOut,
  Shield,
  Award,
  Sword,
  Zap,
  Trophy,
  Star,
  Lock
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { 
    name: string; 
    email: string;
    level: number;
    xp: number;
    photoURL?: string;
  };
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const getRewardData = (level: number) => {
    const rewards = [
      { title: "Novato da Azzas", icon: Shield, color: "text-slate-400" },
      { title: "Aprendiz Iniciado", icon: Award, color: "text-amber-600" },
      { title: "Explorador de Dados", icon: Award, color: "text-slate-300" },
      { title: "Guardião de Insights", icon: Award, color: "text-game-gold" },
      { title: "Arquiteto de Missões", icon: Shield, color: "text-purple-400" },
      { title: "Lenda da Azzas", icon: Trophy, color: "text-game-accent" },
      { title: "Sábio Supremo", icon: Star, color: "text-white" },
    ];
    return rewards[level - 1] || rewards[rewards.length - 1];
  };

  const currentReward = getRewardData(user.level);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quests", label: "Mural de Missões", icon: Calendar },
    { id: "my-quests", label: "Minhas Atividades", icon: UserCircle },
    { id: "profile", label: "Meu Perfil", icon: UserCircle },
    { id: "create", label: "Convocação", icon: PlusCircle },
    { id: "tutorial", label: "Manual do Herói", icon: BookOpen },
    // Adicionei itens extras apenas para testar o scroll caso sua tela seja pequena
  ];

  return (
    <aside className="w-64 h-screen bg-game-panel border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <Logo size={32} className="text-white" />
        <div>
          <h1 className="text-xl font-display font-bold text-white leading-tight">SkillShare</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Agenda do Plan.Log</p>
        </div>
      </div>

      {/* --- BARRA DE ROLAGEM ADICIONADA AQUI --- */}
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-2 mb-4">Navegação</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group relative",
              activeTab === item.id 
                ? "bg-game-accent text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
            {activeTab === item.id && (
              <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button 
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 mb-4 w-full text-left hover:bg-slate-800 transition-all group"
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 transition-all group-hover:scale-105",
            user.level >= 7 ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] bg-slate-800" :
            user.level >= 5 ? "border-purple-500 shadow-[0_0_10px_rgba(168,139,250,0.3)] bg-slate-800" :
            "border-game-cyan bg-game-cyan"
          )}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (user.name || "H").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              {user.level >= 4 ? (
                <Award size={12} className="text-game-gold shrink-0 animate-pulse" title="Selo de Ouro" />
              ) : user.level >= 3 ? (
                <Award size={12} className="text-slate-300 shrink-0" title="Selo de Prata" />
              ) : user.level >= 2 ? (
                <Award size={12} className="text-amber-600 shrink-0" title="Selo de Bronze" />
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <currentReward.icon size={10} className={currentReward.color} />
              <p className={cn("text-[9px] font-black uppercase tracking-widest", currentReward.color)}>
                {currentReward.title}
              </p>
            </div>
          </div>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-bold"
        >
          <LogOut size={18} />
          <span>Sair do Jogo</span>
        </button>
      </div>

      {/* Estilo CSS para a barra personalizada */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b; /* slate-800 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155; /* slate-700 */
        }
      `}</style>
    </aside>
  );
};
