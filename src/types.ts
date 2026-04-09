export type Tool = 
  | "Reserva ERP" 
  | "SAP" 
  | "Ferramentas de IA" 
  | "Outros" 
  | "PowerPoint" 
  | "Power BI" 
  | "Intelipost" 
  | "Ferramentas Plan. Log (WMS)" 
  | "Qualitor - Atendente" 
  | "N8N" 
  | "SQL" 
  | "Excel - Avançado" 
  | "Excel - Básico" 
  | "Python";

export interface Quest {
  id: string;
  title: string;
  description: string;
  author: string;
  authorEmail: string;
  authorUid: string;
  date: string;
  startTime: string;
  maxParticipants: number;
  currentParticipants: number;
  tools: Tool[];
  status: "Criada" | "Em Progresso" | "Concluída";
  guestEmail?: string;
  participantUids?: string[];
  rating?: number;
  createdAt?: any;
}

export interface UserStats {
  uid: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  totalQuests: number;
  activeQuests: number;
  registrations: number;
  weeklyQuests: number;
  completedQuests?: string[];
}

export interface RankingUser {
  id: string;
  name: string;
  email: string;
  stars: number;
  quests: number;
  level: number;
}

export interface Activity {
  id: string;
  type: "level_up" | "new_quest" | "quest_completed";
  userName: string;
  userUid: string;
  questTitle?: string;
  level?: number;
  timestamp: any;
}
