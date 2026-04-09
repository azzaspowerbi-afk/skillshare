import React, { useState } from "react";
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Trophy, 
  Zap, 
  Sword 
} from "lucide-react";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao SkillShare! 🚀",
      description: "Uma plataforma colaborativa onde a equipe Azzas 2154 compartilha conhecimento através de missões de trabalho práticas.",
      icon: (props: any) => <Logo {...props} />,
      color: "text-game-accent",
      bg: "bg-game-accent/10",
      items: [
        "Participe de sessões reais de trabalho",
        "Aprenda observando colegas experientes",
        "Compartilhe seus próprios conhecimentos",
        "Tudo organizado e com lembretes automáticos"
      ]
    },
    {
      title: "Mural de Missões ⚔️",
      description: "Aqui você encontra todas as jornadas disponíveis para participar.",
      icon: Sword,
      color: "text-game-cyan",
      bg: "bg-game-cyan/10",
      items: [
        "Filtre por ferramentas ou disponibilidade",
        "Veja detalhes da quest antes de aceitar",
        "Inscreva-se com um clique",
        "Acompanhe o status da sua participação"
      ]
    },
    {
      title: "Convocar Missão ⚡",
      description: "Seja o mestre da jornada e ensine algo novo para sua equipe.",
      icon: Zap,
      color: "text-game-gold",
      bg: "bg-game-gold/10",
      items: [
        "Defina o tema e ferramentas",
        "Escolha data e horário",
        "Limite o número de aprendizes",
        "Convide colegas específicos por e-mail"
      ]
    },
    {
      title: "Ranking de Heróis 🏆",
      description: "Sua dedicação é recompensada com XP e estrelas.",
      icon: Trophy,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      items: [
        "Suba de nível ao concluir missões",
        "Ganhe estrelas por avaliações positivas",
        "Destaque-se no leaderboard da equipe",
        "Torne-se um mestre lendário"
      ]
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-game-bg/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="game-card w-full max-w-2xl overflow-hidden border-game-accent/30"
      >
        <div className="h-2 bg-slate-800 w-full">
          <motion.div 
            className="h-full bg-game-accent"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {step === 0 ? (
              <Logo size={80} className="text-white" />
            ) : (
              <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center", currentStep.bg)}>
                <currentStep.icon className={currentStep.color} size={48} />
              </div>
            )}
            
            <div className="space-y-3">
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">
                {currentStep.title}
              </h2>
              <p className="text-slate-400 font-medium max-w-md mx-auto">
                {currentStep.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStep.items.map((item, idx) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50"
              >
                <CheckCircle2 className="text-game-cyan shrink-0" size={18} />
                <span className="text-xs font-bold text-slate-300">{item}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === step ? "bg-game-accent w-6" : "bg-slate-700"
                  )}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {step > 0 && (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="game-button-secondary flex items-center gap-2 px-6"
                >
                  <ChevronLeft size={18} />
                  <span>Anterior</span>
                </button>
              )}
              
              {step < steps.length - 1 ? (
                <button 
                  onClick={() => setStep(s => s + 1)}
                  className="game-button-primary flex items-center gap-2 px-8"
                >
                  <span>Próximo</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={onComplete}
                  className="game-button-primary flex items-center gap-2 px-10 bg-emerald-500 hover:bg-emerald-400"
                >
                  <CheckCircle2 size={20} />
                  <span>Iniciar Jornada</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors bg-slate-900/50 border-t border-slate-800"
        >
          Pular manual e ir para o dashboard
        </button>
      </motion.div>
    </div>
  );
};
