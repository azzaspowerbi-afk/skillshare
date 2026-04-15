import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { QuestBoard } from "./components/QuestBoard";
import { CreateQuest } from "./components/CreateQuest";
import { Tutorial } from "./components/Tutorial";
import { Quest, RankingUser, UserStats } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { QuestCard } from "./components/QuestCard";
import { Login } from "./components/Login";
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayRemove
} from "firebase/firestore";

import { QuestDetails } from "./components/QuestDetails";
import { Profile } from "./components/Profile";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { cn } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  // Re-throw async errors in the render cycle for ErrorBoundary to catch
  if (asyncError) throw asyncError;

  useEffect(() => {
    let unsubscribeQuests: (() => void) | null = null;
    let unsubscribeRanking: (() => void) | null = null;
    let unsubscribeActivities: (() => void) | null = null;
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("Auth state changed. User:", user ? user.uid : "null");
        if (user) {
          // Domain check
          const ALLOWED_DOMAIN = "@usereserva.com";
          const ADMIN_EMAIL = "azzaspowerbi@gmail.com";
          const email = user.email?.toLowerCase();
          
          if (!email || (!email.endsWith(ALLOWED_DOMAIN) && email !== ADMIN_EMAIL)) {
            await signOut(auth);
            setUserStats(null);
            setLoading(false);
            return;
          }

          // Real-time listener for user stats
          const userDocRef = doc(db, "users", user.uid);
          if (!unsubscribeUser) {
            unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
              try {
                if (docSnap.exists()) {
                  const data = docSnap.data() as UserStats;
                  const updates: any = {};
                  let needsUpdate = false;
                  
                  // Fallback for name if missing
                  if (!data.name) {
                    data.name = user.displayName || user.email?.split("@")[0] || "Herói";
                    updates.name = data.name;
                    needsUpdate = true;
                  }
                  
                  // Self-healing: ensure level matches XP
                  const correctLevel = Math.floor((data.xp || 0) / 500) + 1;
                  if (data.level !== correctLevel) {
                    console.log(`Syncing level for ${user.uid}: ${data.level} -> ${correctLevel}`);
                    updates.level = correctLevel;
                    data.level = correctLevel;
                    needsUpdate = true;
                  }

                  // Self-healing: ensure totalQuests matches completedQuests length
                  const completedCount = (data.completedQuests || []).length;
                  if (data.totalQuests !== completedCount) {
                    console.log(`Syncing totalQuests for ${user.uid}: ${data.totalQuests} -> ${completedCount}`);
                    updates.totalQuests = completedCount;
                    data.totalQuests = completedCount;
                    needsUpdate = true;
                  }

                  if (needsUpdate) {
                    await updateDoc(userDocRef, updates);
                    await updateDoc(doc(db, "profiles", user.uid), updates);
                  }
                  
                  setUserStats(data);
                } else {
                  // Initialize user if not exists
                  const newUser: UserStats = {
                    uid: user.uid,
                    name: user.displayName || user.email?.split("@")[0] || "Herói",
                    email: user.email || "",
                    level: 1,
                    xp: 0,
                    totalQuests: 0,
                    activeQuests: 0,
                    registrations: 0,
                    weeklyQuests: 0,
                    completedQuests: [],
                    photoURL: user.photoURL || ""
                  };
                  await setDoc(userDocRef, newUser);
                  await setDoc(doc(db, "profiles", user.uid), {
                    uid: user.uid,
                    name: newUser.name,
                    xp: newUser.xp,
                    level: newUser.level,
                    totalQuests: newUser.totalQuests,
                    photoURL: newUser.photoURL
                  });
                }
              } catch (error) {
                console.error("Error in user onSnapshot:", error);
                try { handleFirestoreError(error, OperationType.GET, `users/${user.uid}`); } catch (err) { setAsyncError(err as Error); }
              }
            }, (error) => {
              try { handleFirestoreError(error, OperationType.GET, `users/${user.uid}`); } catch (err) { setAsyncError(err as Error); }
            });
          }

          // Attach listeners
          if (!unsubscribeQuests) {
            const questsQuery = query(collection(db, "quests"), orderBy("createdAt", "desc"));
            unsubscribeQuests = onSnapshot(questsQuery, (snapshot) => {
              const questsData = snapshot.docs.map(doc => {
                const data = doc.data();
                if (!data) return null;
                return { 
                  id: doc.id, 
                  ...data,
                  tools: (data as any).tools || []
                } as Quest;
              }).filter(Boolean) as Quest[];
              setQuests(questsData);
            }, (error) => {
              try { handleFirestoreError(error, OperationType.LIST, "quests"); } catch (err) { setAsyncError(err as Error); }
            });
          }

          if (!unsubscribeRanking) {
            const rankingQuery = query(collection(db, "profiles"), orderBy("xp", "desc"));
            unsubscribeRanking = onSnapshot(rankingQuery, (snapshot) => {
              const rankingData = snapshot.docs.map(doc => {
                const data = doc.data();
                if (!data) return null;
                return {
                  id: doc.id,
                  name: data.name || "Herói",
                  email: "",
                  stars: data.ratingCount ? Number(((data.totalStars || 0) / data.ratingCount).toFixed(1)) : 5,
                  quests: data.totalQuests || 0,
                  level: data.level || 1,
                  photoURL: data.photoURL || ""
                } as RankingUser;
              }).filter(Boolean) as RankingUser[];
              setRanking(rankingData);
            }, (error) => {
              try { handleFirestoreError(error, OperationType.LIST, "profiles"); } catch (err) { setAsyncError(err as Error); }
            });
          }

          if (!unsubscribeActivities) {
            const activitiesQuery = query(collection(db, "activities"), orderBy("timestamp", "desc"));
            unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
              const activitiesData = snapshot.docs.slice(0, 10).map(doc => {
                const data = doc.data();
                if (!data) return null;
                return { id: doc.id, ...data };
              }).filter(Boolean);
              setActivities(activitiesData);
            }, (error) => {
              try { handleFirestoreError(error, OperationType.LIST, "activities"); } catch (err) { setAsyncError(err as Error); }
            });
          }

        } else {
          setUserStats(null);
          if (unsubscribeQuests) { unsubscribeQuests(); unsubscribeQuests = null; }
          if (unsubscribeRanking) { unsubscribeRanking(); unsubscribeRanking = null; }
          if (unsubscribeActivities) { unsubscribeActivities(); unsubscribeActivities = null; }
          if (unsubscribeUser) { unsubscribeUser(); unsubscribeUser = null; }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        try {
          handleFirestoreError(error, OperationType.GET, user ? `users/${user.uid}` : "auth");
        } catch (err) {
          setAsyncError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    });

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      setAsyncError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener("unhandledrejection", handleRejection);

    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    return () => {
      unsubscribeAuth();
      window.removeEventListener("unhandledrejection", handleRejection);
      if (unsubscribeQuests) unsubscribeQuests();
      if (unsubscribeRanking) unsubscribeRanking();
      if (unsubscribeActivities) unsubscribeActivities();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Self-reward system: users update their own XP when they see a quest is completed
  useEffect(() => {
    if (!userStats || !auth.currentUser || quests.length === 0) return;

    const processRewards = async () => {
      try {
        if (!userStats || !auth.currentUser) return;
        
        const currentUserId = auth.currentUser.uid;
        const completedQuests = quests.filter(q => q.status === "Concluída");
        const processedIds = userStats.completedQuests || [];
        
        for (const quest of completedQuests) {
          if (processedIds.includes(quest.id)) continue;

          const isAuthor = quest.authorUid === currentUserId;
          const isParticipant = quest.participantUids?.includes(currentUserId);
          
          if (isAuthor || isParticipant) {
            console.log(`Processing reward for user ${currentUserId} for quest: ${quest.title}`);
            const xpGain = isAuthor ? 100 : 50;
            const newXp = (userStats.xp || 0) + xpGain;
            const newLevel = Math.floor(newXp / 500) + 1;
            const newTotalQuests = (userStats.totalQuests || 0) + 1;
            
            const updates = {
              xp: newXp,
              level: newLevel,
              totalQuests: newTotalQuests,
              completedQuests: [...processedIds, quest.id]
            };

            const userRef = doc(db, "users", currentUserId);
            const profileRef = doc(db, "profiles", currentUserId);
            
            await updateDoc(userRef, updates);
            await updateDoc(profileRef, {
              xp: newXp,
              level: newLevel,
              totalQuests: newTotalQuests
            });

            if (newLevel > userStats.level) {
              await addDoc(collection(db, "activities"), {
                type: "level_up",
                userName: userStats.name,
                userUid: currentUserId,
                level: newLevel,
                timestamp: serverTimestamp()
              });
            }
            
            // Break after one update to avoid race conditions, the next render will catch others
            break;
          }
        }
      } catch (error) {
        console.error("Error processing self-reward:", error);
        // We don't setAsyncError here to avoid infinite loops if the error persists
      }
    };

    processRewards();
  }, [quests, userStats]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("hasSeenTutorial", "true");
  };

  const handleCreateQuest = async (newQuest: any) => {
    if (!userStats || !auth.currentUser) return;
    
    const questData = {
      title: newQuest.title,
      description: newQuest.description,
      author: userStats.name,
      authorEmail: userStats.email,
      authorUid: auth.currentUser.uid,
      authorPhotoURL: userStats.photoURL || "",
      date: newQuest.date,
      startTime: newQuest.startTime,
      maxParticipants: newQuest.maxParticipants,
      currentParticipants: 0,
      participantUids: [],
      tools: newQuest.tools,
      guestEmail: newQuest.guestEmail || "",
      status: "Criada",
      createdAt: serverTimestamp()
    };

    try {
      console.log("Attempting to create quest with data:", questData);
      const questRef = await addDoc(collection(db, "quests"), questData);
      console.log("Quest created successfully with ID:", questRef.id);
      
      // Update user stats and public profile
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const profileDocRef = doc(db, "profiles", auth.currentUser.uid);
      
      // We no longer increment totalQuests or XP on creation to avoid double counting
      // These will be updated only when the quest is marked as "Concluída"
      
      console.log("Quest created. Stats will update upon completion.");
      
      // Create activity
      await addDoc(collection(db, "activities"), {
        type: "new_quest",
        userName: userStats.name,
        userUid: auth.currentUser.uid,
        questTitle: questData.title,
        questId: questRef.id,
        timestamp: serverTimestamp()
      });

      setActiveTab("quests");
    } catch (error) {
      console.error("Error in handleCreateQuest:", error);
      try {
        handleFirestoreError(error, OperationType.CREATE, "quests");
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const seedInitialData = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userDocRef = doc(db, "users", uid);
    const profileDocRef = doc(db, "profiles", uid);

    const initialData = {
      uid: uid,
      name: auth.currentUser.displayName || "azzas powerbi",
      email: auth.currentUser.email || "azzaspowerbi@usereserva.com",
      level: 1,
      xp: 0,
      totalQuests: 0,
      activeQuests: 0,
      registrations: 0,
      weeklyQuests: 0
    };

    try {
      await setDoc(userDocRef, initialData);
      await setDoc(profileDocRef, {
        uid: uid,
        name: initialData.name,
        xp: initialData.xp,
        level: initialData.level,
        totalQuests: initialData.totalQuests
      });
      setUserStats(initialData as UserStats);
      console.log("Perfil inicializado com sucesso!");
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleJoinQuest = async (id: string) => {
    if (!userStats || !auth.currentUser) return;
    try {
      const questRef = doc(db, "quests", id);
      const questDoc = await getDoc(questRef);
      if (!questDoc.exists()) return;
      
      const questData = questDoc.data() as Quest;
      const participantUids = questData.participantUids || [];
      
      if (participantUids.includes(auth.currentUser.uid)) {
        console.log("Já participando");
        return;
      }
      
      if (participantUids.length >= questData.maxParticipants) {
        console.log("Missão lotada");
        return;
      }
      
      await updateDoc(questRef, {
        participantUids: [...participantUids, auth.currentUser.uid],
        currentParticipants: participantUids.length + 1
      });

      // Update user stats
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        registrations: (userStats.registrations || 0) + 1
      });

      console.log("Inscrição realizada");
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `quests/${id}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleLeaveQuest = async (id: string) => {
    if (!userStats || !auth.currentUser) return;
    try {
      const questRef = doc(db, "quests", id);
      const questDoc = await getDoc(questRef);
      if (!questDoc.exists()) return;
      
      const questData = questDoc.data() as Quest;
      const participantUids = questData.participantUids || [];
      
      if (!participantUids.includes(auth.currentUser.uid)) {
        console.log("Não está participando");
        return;
      }
      
      const newParticipants = participantUids.filter(uid => uid !== auth.currentUser?.uid);
      
      await updateDoc(questRef, {
        participantUids: newParticipants,
        currentParticipants: newParticipants.length
      });

      // Update user stats
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        registrations: Math.max(0, (userStats.registrations || 0) - 1)
      });

      console.log("Saída da missão realizada");
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `quests/${id}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: Quest["status"]) => {
    try {
      const questRef = doc(db, "quests", id);
      await updateDoc(questRef, { status });

      if (status === "Concluída" && auth.currentUser) {
        const questDoc = await getDoc(questRef);
        if (!questDoc.exists()) return;
        const questData = questDoc.data() as Quest;
        
        // Create activity
        await addDoc(collection(db, "activities"), {
          type: "quest_completed",
          userName: questData.author,
          userUid: questData.authorUid,
          questTitle: questData.title,
          questId: id,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `quests/${id}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleRateQuest = async (questId: string, rating: number) => {
    if (!auth.currentUser) return;
    try {
      const questRef = doc(db, "quests", questId);
      const questSnap = await getDoc(questRef);
      if (!questSnap.exists()) return;
      
      const questData = questSnap.data() as Quest;
      const ratedBy = questData.ratedBy || [];
      
      if (ratedBy.includes(auth.currentUser.uid)) {
        console.log("Usuário já avaliou esta missão");
        return;
      }

      const newTotalQuestStars = (questData.totalQuestStars || 0) + rating;
      const newRatedBy = [...ratedBy, auth.currentUser.uid];
      const newAverageRating = Number((newTotalQuestStars / newRatedBy.length).toFixed(1));

      await updateDoc(questRef, {
        ratedBy: newRatedBy,
        rating: newAverageRating,
        totalQuestStars: newTotalQuestStars
      });

      const authorRef = doc(db, "users", questData.authorUid);
      const authorProfileRef = doc(db, "profiles", questData.authorUid);
      
      const authorSnap = await getDoc(authorRef);
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        const newTotalStars = (authorData.totalStars || 0) + rating;
        const newRatingCount = (authorData.ratingCount || 0) + 1;
        
        await updateDoc(authorRef, {
          totalStars: newTotalStars,
          ratingCount: newRatingCount
        });
        
        await updateDoc(authorProfileRef, {
          totalStars: newTotalStars,
          ratingCount: newRatingCount
        });
      }
      console.log("Avaliação enviada com sucesso!");
    } catch (error) {
      console.error("Error rating quest:", error);
      try {
        handleFirestoreError(error, OperationType.UPDATE, `quests/${questId}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleDeleteQuest = async (id: string) => {
    if (!id) return;
    const userEmail = auth.currentUser?.email?.toLowerCase();
    const isAdmin = userEmail === "azzaspowerbi@gmail.com";
    
    console.log("Deleting quest:", id);
    try {
      const questRef = doc(db, "quests", id);
      const questSnap = await getDoc(questRef);
      
      if (!questSnap.exists()) return;
      
      const questData = questSnap.data() as Quest;
      const questTitle = questData.title;

      // 1. Rollback for Author
      const authorRef = doc(db, "users", questData.authorUid);
      const authorProfileRef = doc(db, "profiles", questData.authorUid);
      
      const authorUpdates: any = {
        activeQuests: increment(-1)
      };

      if (questData.status === "Concluída") {
        authorUpdates.xp = increment(-100);
        authorUpdates.completedQuests = arrayRemove(id);
        authorUpdates.totalQuests = increment(-1);

        if (questData.ratedBy?.length) {
          const starsToSubtract = questData.totalQuestStars || questData.rating || 0;
          authorUpdates.totalStars = increment(-starsToSubtract);
          authorUpdates.ratingCount = increment(-questData.ratedBy.length);
        }
      }

      // Author can always update their own stats, or admin can update anyone
      if (isAdmin || questData.authorUid === auth.currentUser?.uid) {
        await updateDoc(authorRef, authorUpdates);
        if (questData.status === "Concluída") {
          await updateDoc(authorProfileRef, {
            xp: increment(-100),
            totalQuests: increment(-1),
            ...(questData.ratedBy?.length ? {
              totalStars: authorUpdates.totalStars,
              ratingCount: authorUpdates.ratingCount
            } : {})
          });
        }
      }

      // 2. Rollback for Participants
      const participantUids = questData.participantUids || [];
      for (const pUid of participantUids) {
        const pRef = doc(db, "users", pUid);
        const pProfileRef = doc(db, "profiles", pUid);
        
        const pUpdates: any = {
          registrations: increment(-1)
        };
        
        if (questData.status === "Concluída") {
          pUpdates.xp = increment(-50);
          pUpdates.completedQuests = arrayRemove(id);
          pUpdates.totalQuests = increment(-1);
        }
        
        // Only attempt update if admin or if it's the current user (self-rollback)
        if (isAdmin || pUid === auth.currentUser?.uid) {
          try {
            await updateDoc(pRef, pUpdates);
            if (questData.status === "Concluída") {
              await updateDoc(pProfileRef, {
                xp: increment(-50),
                totalQuests: increment(-1)
              });
            }
          } catch (err) {
            console.error(`Failed to rollback stats for participant ${pUid}:`, err);
          }
        }
      }

      // 3. Delete related activities by questId
      const activitiesQuery = query(collection(db, "activities"), where("questId", "==", id));
      const activitiesSnap = await getDocs(activitiesQuery);
      for (const activityDoc of activitiesSnap.docs) {
        try {
          await deleteDoc(activityDoc.ref);
        } catch (err) {
          console.error(`Failed to delete activity ${activityDoc.id}:`, err);
        }
      }

      // 4. Fallback: Delete legacy activities by title and userUid
      if (questTitle && auth.currentUser) {
        const legacyQuery = query(
          collection(db, "activities"), 
          where("userUid", "==", auth.currentUser.uid)
        );
        const legacySnap = await getDocs(legacyQuery);
        for (const activityDoc of legacySnap.docs) {
          const data = activityDoc.data();
          if (data.questTitle === questTitle && !data.questId) {
            try {
              await deleteDoc(activityDoc.ref);
            } catch (err) {
              console.error(`Failed to delete legacy activity ${activityDoc.id}:`, err);
            }
          }
        }
      }

      await deleteDoc(questRef);
      setSelectedQuestId(null);
    } catch (error) {
      console.error("Delete quest error:", error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `quests/${id}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!uid) return;
    console.log("Deleting user:", uid);
    try {
      await deleteDoc(doc(db, "users", uid));
      await deleteDoc(doc(db, "profiles", uid));
    } catch (error) {
      console.error("Delete user error:", error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!id) return;
    console.log("Deleting activity:", id);
    try {
      await deleteDoc(doc(db, "activities", id));
    } catch (error) {
      console.error("Delete activity error:", error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
      } catch (err) {
        setAsyncError(err as Error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-bg">
        <div className="w-16 h-16 border-4 border-game-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userStats) {
    return <Login onLogin={() => {}} />;
  }

  const renderContent = () => {
    if (selectedQuestId) {
      const quest = quests.find(q => q.id === selectedQuestId);
      if (quest) {
        const isAuthor = quest.authorUid === auth.currentUser?.uid;
        const isParticipant = quest.participantUids?.includes(auth.currentUser?.uid || "") || false;
        const participantProfiles = ranking.filter(r => quest.participantUids?.includes(r.id));

        return (
          <QuestDetails 
            quest={quest} 
            onBack={() => setSelectedQuestId(null)} 
            onJoin={!isParticipant && !isAuthor ? handleJoinQuest : undefined}
            onLeave={isParticipant && quest.status !== "Concluída" ? handleLeaveQuest : undefined}
            onStatusUpdate={isAuthor ? handleStatusUpdate : undefined}
            onRate={isParticipant && quest.status === "Concluída" ? handleRateQuest : undefined}
            onDelete={handleDeleteQuest}
            isAuthor={isAuthor}
            isParticipant={isParticipant}
            isAdmin={auth.currentUser?.email?.toLowerCase() === "azzaspowerbi@gmail.com"}
            participants={participantProfiles}
          />
        );
      }
      setSelectedQuestId(null);
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            stats={userStats} 
            ranking={ranking} 
            quests={quests}
            activities={activities}
            onAction={(tab) => setActiveTab(tab)} 
            onViewQuest={setSelectedQuestId}
            onDeleteUser={handleDeleteUser}
            onDeleteQuest={handleDeleteQuest}
            onDeleteActivity={handleDeleteActivity}
          />
        );
      case "quests":
        return (
          <QuestBoard 
            quests={quests} 
            onAction={(tab) => setActiveTab(tab)} 
            onViewQuest={setSelectedQuestId}
            onDeleteQuest={handleDeleteQuest}
            user={userStats} 
          />
        );
      case "my-quests":
        return (
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">Minhas Atividades</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.filter(q => 
                q.authorUid === auth.currentUser?.uid || 
                (q.guestEmail && q.guestEmail.toLowerCase() === auth.currentUser?.email?.toLowerCase()) ||
                (q.participantUids && q.participantUids.includes(auth.currentUser?.uid || ""))
              ).map(quest => (
                <QuestCard key={quest.id} quest={quest} onViewDetails={setSelectedQuestId} onDelete={handleDeleteQuest} user={userStats!} />
              ))}
            </div>
          </div>
        );
      case "create":
        return <CreateQuest onBack={() => setActiveTab("dashboard")} onSubmit={handleCreateQuest} />;
      case "tutorial":
        return (
          <div className="flex items-center justify-center min-h-[80vh]">
            <button 
              onClick={() => setShowTutorial(true)}
              className="game-button-primary px-10 py-4 text-xl"
            >
              Abrir Manual do Herói
            </button>
          </div>
        );
      case "profile":
        return userStats ? <Profile userStats={userStats} onUpdate={setUserStats} /> : null;
      default:
        return (
          <Dashboard 
            stats={userStats} 
            ranking={ranking} 
            quests={quests}
            activities={activities}
            onAction={setActiveTab} 
            onViewQuest={setSelectedQuestId}
            onDeleteUser={handleDeleteUser}
            onDeleteQuest={handleDeleteQuest}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-game-bg flex">
        {userStats && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={userStats} onLogout={handleLogout} />
        )}
        
        <main className={cn("flex-1 min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_70%)]", userStats ? "ml-64" : "ml-0")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showTutorial && (
            <Tutorial onComplete={handleCompleteTutorial} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
