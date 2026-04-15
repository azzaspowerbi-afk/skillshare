import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { UserStats } from "../types";
import { cn } from "../lib/utils";

interface ProfileProps {
  userStats: UserStats;
  onUpdate: (stats: UserStats) => void;
}

export const Profile: React.FC<ProfileProps> = ({ userStats, onUpdate }) => {
  const [name, setName] = useState(userStats.name);
  const [photoURL, setPhotoURL] = useState(userStats.photoURL || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const isGoogleUser = auth.currentUser?.providerData.some(p => p.providerId === "google.com");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    setMessage(null);

    try {
      // Update Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL
      });

      // Update Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      const profileRef = doc(db, "profiles", auth.currentUser.uid);
      
      const updates = {
        name,
        photoURL
      };

      await updateDoc(userRef, updates);
      await updateDoc(profileRef, updates);

      onUpdate({ ...userStats, ...updates });
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Erro ao atualizar perfil." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || isGoogleUser) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === "auth/wrong-password") {
        setMessage({ type: "error", text: "Senha atual incorreta." });
      } else {
        setMessage({ type: "error", text: "Erro ao alterar senha. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  ];

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
          <User className="text-game-accent" size={32} />
          Meu Perfil
        </h1>
        <p className="text-slate-400 font-medium">Gerencie suas informações de herói e segurança.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="game-card p-8 space-y-8 bg-slate-900/50">
            <div className="flex items-center gap-3 text-game-cyan border-b border-slate-800 pb-4">
              <Shield size={20} />
              <h3 className="text-lg font-display font-bold uppercase tracking-widest">Dados Pessoais</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="space-y-4 flex-shrink-0">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block text-center">Avatar</label>
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center relative">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={48} className="text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-[150px]">
                  {avatars.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoURL(avatar)}
                      className={cn(
                        "w-8 h-8 rounded-lg overflow-hidden border-2 transition-all",
                        photoURL === avatar ? "border-game-accent scale-110" : "border-transparent hover:border-slate-600"
                      )}
                    >
                      <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="game-input w-full !pl-12 py-3"
                      placeholder="Seu nome de herói"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">E-mail (Não alterável)</label>
                  <div className="relative group opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={userStats.email}
                      className="game-input w-full !pl-12 py-3 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">URL do Avatar Customizado</label>
                  <div className="relative group">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors" size={18} />
                    <input 
                      type="url" 
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="game-input w-full !pl-12 py-3"
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="game-button-primary px-8 py-3 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="space-y-6">
          {!isGoogleUser ? (
            <form onSubmit={handleChangePassword} className="game-card p-6 space-y-6 bg-slate-900/50">
              <div className="flex items-center gap-3 text-game-gold border-b border-slate-800 pb-4">
                <Lock size={20} />
                <h3 className="text-lg font-display font-bold uppercase tracking-widest">Segurança</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Senha Atual</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors" size={18} />
                    <input 
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="game-input w-full !pl-12 pr-12 py-3"
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nova Senha</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors" size={18} />
                    <input 
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="game-input w-full !pl-12 pr-12 py-3"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Confirmar Nova Senha</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-game-accent transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="game-input w-full !pl-12 py-3"
                      placeholder="Repita a nova senha"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full game-button-secondary py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Alterar Senha</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="game-card p-6 space-y-4 bg-slate-900/50 border-dashed border-slate-700">
              <div className="flex items-center gap-3 text-game-gold">
                <Shield size={20} />
                <h3 className="text-sm font-display font-bold uppercase tracking-widest">Conta Google</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Você está conectado via Google. A gestão de senha é feita diretamente na sua conta Google.
              </p>
            </div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl flex items-center gap-3 border",
                message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
            >
              {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-xs font-bold">{message.text}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
