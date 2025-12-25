import { View, ScrollView, Text } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Target, Trophy, Lock } from "lucide-react-native";
import { useRouter } from "expo-router";
import useLanguage from "../../utils/i18n";
import { useUser } from "../../utils/auth/useUser";
import { useAuth } from "../../utils/auth/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "@/constants/colors";
import {
  calculateLevelProgress,
  getLevelTitle,
  getLevelColor,
} from "@/constants/gamification";
import { useQuests } from "@/hooks/useQuests";
import { useUserXP } from "@/hooks/useUserXP";
import { QuestsHeader } from "@/components/Quests/QuestsHeader";
import { LevelDisplay } from "@/components/Quests/LevelDisplay";
import { QuestStats } from "@/components/Quests/QuestStats";
import { QuestSection } from "@/components/Quests/QuestSection";
import { LeaderboardCTA } from "@/components/Quests/LeaderboardCTA";
import { LoadingState } from "@/components/Quests/LoadingState";

export default function QuestsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const { isAuthenticated } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("isGuest").then((value) => {
      setIsGuest(value === "true");
    });
  }, []);

  const isGuestMode = isGuest && !isAuthenticated;

  const { dailyQuests, weeklyQuests, loading, loadQuests } = useQuests(
    isGuestMode ? null : user?.id,
  );
  const { userXP, loadUserXP } = useUserXP(isGuestMode ? null : user?.id);

  const handleCompleteQuest = async (questId, questType) => {
    try {
      const response = await fetch("/api/gamification/complete-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, questId, questType }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show success feedback
        if (data.leveledUp) {
          alert(
            `${t("questComplete")} 🎉\n+${data.xpAwarded} XP\n${t("levelUp")} ${data.newLevel}`,
          );
        } else {
          alert(`${t("questComplete")} ✅\n+${data.xpAwarded} XP`);
        }

        // Reload quests and XP
        await loadQuests();
        await loadUserXP();
      }
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };

  const completedDaily = dailyQuests.filter((q) => q.is_completed).length;
  const completedWeekly = weeklyQuests.filter((q) => q.is_completed).length;

  const levelProgress = calculateLevelProgress(userXP.totalXP);
  const levelColor = getLevelColor(levelProgress.currentLevel);
  const levelTitle = getLevelTitle(levelProgress.currentLevel);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      <QuestsHeader title={t("quests")} insets={insets} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {isGuestMode ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Lock color={COLORS.forgeOrange} size={48} />
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 16 }}>
                {t("signInRequired") || "Sign in to unlock"}
              </Text>
              <Text style={{ color: COLORS.steelSilver, textAlign: "center", marginTop: 8, paddingHorizontal: 20 }}>
                {t("questsLockedMessage") || "Create an account to track your quests, earn XP, and compete on leaderboards!"}
              </Text>
              <View 
                style={{ 
                  marginTop: 24, 
                  backgroundColor: COLORS.forgeOrange, 
                  paddingVertical: 14, 
                  paddingHorizontal: 32, 
                  borderRadius: 12 
                }}
                onTouchEnd={() => router.push("/auth")}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  {t("signIn") || "Sign In"}
                </Text>
              </View>
            </View>
          ) : loading ? (
            <LoadingState language={language} />
          ) : (
            <>
              <LevelDisplay
                levelProgress={levelProgress}
                levelColor={levelColor}
                levelTitle={levelTitle}
                language={language}
              />

              <QuestStats
                completedDaily={completedDaily}
                totalDaily={dailyQuests.length}
                completedWeekly={completedWeekly}
                totalWeekly={weeklyQuests.length}
                language={language}
              />

              <QuestSection
                title={t("dailyQuests")}
                quests={dailyQuests}
                questType="daily"
                icon={Target}
                iconColor="#3b82f6"
                completedCount={completedDaily}
                onComplete={handleCompleteQuest}
                t={t}
                language={language}
              />

              <QuestSection
                title={t("weeklyQuests")}
                quests={weeklyQuests}
                questType="weekly"
                icon={Trophy}
                iconColor="#f59e0b"
                completedCount={completedWeekly}
                onComplete={handleCompleteQuest}
                t={t}
                language={language}
              />

              <LeaderboardCTA
                onPress={() => router.push("/leaderboard")}
                t={t}
                language={language}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
