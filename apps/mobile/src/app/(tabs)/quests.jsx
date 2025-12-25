import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Target, Trophy } from "lucide-react-native";
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
  const { user, loading: userLoading, isGuest } = useUser();
  const { signOut: authSignOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await AsyncStorage.multiRemove(["isGuest", "languageSelected"]);
      authSignOut();
      router.replace("/language-selection");
    } catch (error) {
      console.error("Sign out error:", error);
      authSignOut();
    }
  };

  const { dailyQuests, weeklyQuests, loading, loadQuests } = useQuests(
    user?.id,
  );
  const { userXP, loadUserXP } = useUserXP(user?.id);

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
          {loading ? (
            <LoadingState language={language} />
          ) : isGuest ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 20,
                  padding: 30,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                  width: "100%",
                }}
              >
                <Target color={COLORS.forgeOrange} size={50} strokeWidth={1.5} />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 20,
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Guest Mode
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.steelSilver,
                    textAlign: "center",
                    marginBottom: 30,
                    lineHeight: 24,
                  }}
                >
                  {t("guestWarning")}
                </Text>

                <TouchableOpacity
                  onPress={handleSignIn}
                  style={{
                    backgroundColor: COLORS.forgeOrange,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    {t("signInToForge")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
