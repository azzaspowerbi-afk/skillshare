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
  Star
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
      { title: "Guerreiro de Dados", icon: Sword, color: "text-slate-300" },
      { title: "Mestre Analista", icon: Zap, color: "text-game-cyan" },
      { title: "Comandante de Insights", icon: Shield, color: "text-game-gold" },
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
  ];

  return (
    <aside className="w-64 h-screen bg-game-panel border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Logo size={32} className="text-white" />
        <div>
          <h1 className="text-xl font-display font-bold text-white leading-tight">SkillShare</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Agenda do Plan.Log</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
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

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 mb-4 w-full text-left hover:bg-slate-800 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-game-cyan flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-transparent group-hover:border-game-cyan/50 transition-all">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (user.name || "H").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <currentReward.icon size={10} className={currentReward.color} />
              <p className={cn("text-[9px] font-black uppercase tracking-tighter", currentReward.color)}>
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
    </aside>
  );
};
