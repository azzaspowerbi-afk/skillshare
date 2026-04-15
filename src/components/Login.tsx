import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { 
  auth, 
  googleProvider,
  db
} from "../firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserStats } from "../types";

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ALLOWED_DOMAIN = "@usereserva.com";
  const ADMIN_EMAIL = "azzaspowerbi@gmail.com";

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith(ALLOWED_DOMAIN) || email.toLowerCase() === ADMIN_EMAIL;
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user.email || !validateEmail(user.email)) {
        await auth.signOut();
        setError(`Acesso restrito. Use um e-mail ${ALLOWED_DOMAIN}.`);
        setLoading(false);
        return;
      }
      
      onLogin();
    } catch (err: any) {
      console.error("Google login error", err);
      if (err.code === "auth/cancelled-popup-request" || err.code === "auth/popup-closed-by-user") {
        // Ignore these errors as they are user cancellations or duplicate requests
        return;
      }
      setError("Erro ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (authMode === "signup" && password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError(`Acesso restrito. Use um e-mail ${ALLOWED_DOMAIN}.`);
      setLoading(false);
      return;
    }

    try {
      if (authMode === "signup") {
        if (!name) {
          setError("Informe seu nome de herói.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });

        // Create initial user stats in Firestore
        const newUser: UserStats = {
          uid: user.uid,
          name: name,
          email: email,
          level: 1,
          xp: 0,
          totalQuests: 0,
          activeQuests: 0,
          registrations: 0,
          weeklyQuests: 0,
          photoURL: user.photoURL || ""
        };

        // Create private user doc
        await setDoc(doc(db, "users", user.uid), newUser);
        
        // Create public profile doc for ranking
        await setDoc(doc(db, "profiles", user.uid), {
          uid: user.uid,
          name: name,
          xp: 0,
          level: 1,
          totalQuests: 0,
          photoURL: user.photoURL || ""
        });

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      console.error("Auth error", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso. Tente fazer login em vez de se cadastrar.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("O login com e-mail não está habilitado no Console do Firebase.");
      } else {
        setError("Ocorreu um erro. Verifique seus dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-bg p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-game-accent/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-game-cyan/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-card p-8 md:p-12 max-w-md w-full text-center space-y-8 relative z-10"
      >
        <div className="flex items-center justify-center mx-auto">
          <Logo size={64} className="text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">SkillShare</h1>
          <p className="text-slate-400 font-medium">
            {authMode === "login" ? "Inicie sua jornada épica" : "Crie seu perfil de herói"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          {authMode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome de Herói</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors pointer-events-none" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Arthur Pendragon"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 !pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-game-accent/50 focus:ring-1 focus:ring-game-accent/20 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors pointer-events-none" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 !pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-game-accent/50 focus:ring-1 focus:ring-game-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors pointer-events-none" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 !pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-game-accent/50 focus:ring-1 focus:ring-game-accent/20 transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="game-button-primary w-full py-4 text-lg flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{authMode === "login" ? "Entrar" : "Criar Conta"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-white/20 bg-game-bg px-4">Ou continue com</div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>Google</span>
            </>
          )}
        </button>

        <div className="pt-4">
          <button 
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-xs text-slate-500 hover:text-game-accent transition-colors font-bold uppercase tracking-widest"
          >
            {authMode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
