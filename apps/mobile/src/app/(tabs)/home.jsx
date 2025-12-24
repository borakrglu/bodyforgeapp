import { Image } from "expo-image";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Sparkles,
  TrendingUp,
  Flame,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useLanguage from "../../utils/i18n";
import { useUser } from "../../utils/auth/useUser";

// BodyForge Color Palette
const COLORS = {
  // Primary Brand Colors
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  deepForgeRed: "#B22000",

  // Metal & Neutral Colors
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",

  // Highlights & Accents
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
};

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useUser();
  const [featuredPrograms, setFeaturedPrograms] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState({
    totalXP: 0,
    currentLevel: 1,
    streak: 0,
  });
  const [dailyQuests, setDailyQuests] = useState([]);

  useEffect(() => {
    loadContent(); // Load content regardless of user auth
    if (user?.id) {
      loadGamificationData(user.id);
    }
  }, [user?.id]);

  const loadContent = async () => {
    try {
      const [programsRes, tipsRes] = await Promise.all([
        fetch("/api/featured-programs"),
        fetch("/api/content-posts?type=tip&limit=3"),
      ]);

      if (programsRes.ok) {
        const data = await programsRes.json();
        setFeaturedPrograms(data.programs || []);
      }

      if (tipsRes.ok) {
        const data = await tipsRes.json();
        setTips(data.posts || []);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGamificationData = async (id) => {
    if (!id) return;
    try {
      const [userRes, questsRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/gamification/quests?userId=${id}`),
      ]);

      if (userRes.ok) {
        const data = await userRes.json();
        setUserXP({
          totalXP: data.user.total_xp || 0,
          currentLevel: data.user.current_level || 1,
          streak: data.user.current_streak || 0,
        });
      }

      if (questsRes.ok) {
        const data = await questsRes.json();
        setDailyQuests(data.dailyQuests || []);
      }
    } catch (error) {
      console.error("Error loading gamification data:", error);
    }
  };

  const calculateLevelProgress = () => {
    const levelThresholds = [
      0, 500, 1200, 2000, 3000, 4500, 6500, 9000, 12000, 15500, 20000,
    ];
    const currentLevel = userXP.currentLevel;

    if (currentLevel >= levelThresholds.length - 1) {
      return { current: userXP.totalXP, next: userXP.totalXP, progress: 100 };
    }

    const currentThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextThreshold =
      levelThresholds[currentLevel] || currentThreshold + 1000;
    const progress =
      ((userXP.totalXP - currentThreshold) /
        (nextThreshold - currentThreshold)) *
      100;

    return {
      current: userXP.totalXP - currentThreshold,
      next: nextThreshold - currentThreshold,
      progress: Math.min(Math.max(progress, 0), 100),
    };
  };

  const levelProgress = calculateLevelProgress();
  const completedQuests = dailyQuests.filter((q) => q.is_completed).length;
  const hasProfile = !!user?.id; // Simple check for profile

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header - Forge Inspired */}
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 24,
          backgroundColor: COLORS.carbonBlack,
          borderBottomWidth: 2,
          borderBottomColor: COLORS.ironGrey,
        }}
      >
        {/* Logo/Brand Section */}
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {t("appName")}
          </Text>
          {/* Orange accent underline */}
          <View
            style={{
              width: 80,
              height: 3,
              backgroundColor: COLORS.forgeOrange,
              marginTop: 4,
              borderRadius: 2,
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.steelSilver,
            letterSpacing: 0.5,
            fontWeight: "600",
          }}
        >
          {t("brandStatement")}
        </Text>

        {/* XP Progress Bar - Molten Metal Style */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: COLORS.ironGrey,
            shadowColor: COLORS.forgeOrange,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: COLORS.moltenEmber,
                  borderRadius: 8,
                  padding: 6,
                  marginRight: 10,
                }}
              >
                <Zap color="#fff" size={18} fill="#fff" />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                {t("level")} {userXP.currentLevel}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Flame
                color={COLORS.forgeOrange}
                size={18}
                fill={COLORS.forgeOrange}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: COLORS.orangeRimLight,
                  marginLeft: 6,
                }}
              >
                {userXP.streak} {userXP.streak === 1 ? t("day") : t("days")}{" "}
                {t("streak")}
              </Text>
            </View>
          </View>

          {/* Forged Metal Progress Bar */}
          <View
            style={{
              backgroundColor: COLORS.ironGrey,
              borderRadius: 8,
              height: 10,
              overflow: "hidden",
              marginBottom: 8,
              borderWidth: 1,
              borderColor: COLORS.carbonBlack,
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.forgeOrange,
                height: "100%",
                width: `${levelProgress.progress}%`,
                shadowColor: COLORS.moltenEmber,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 13,
              color: COLORS.steelSilver,
              textAlign: "right",
              fontWeight: "600",
            }}
          >
            {levelProgress.current}/{levelProgress.next} XP
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Quests Preview - Steel Card Design */}
        {dailyQuests.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Target
                  color={COLORS.forgeOrange}
                  size={22}
                  strokeWidth={2.5}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginLeft: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("dailyQuests")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/quests")}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: COLORS.forgeOrange,
                  }}
                >
                  {t("viewAll") || "View All"} →
                </Text>
              </TouchableOpacity>
            </View>

            {dailyQuests.slice(0, 2).map((quest) => (
              <View
                key={quest.id}
                style={{
                  backgroundColor: quest.is_completed
                    ? "#1a2e1a"
                    : COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1.5,
                  borderColor: quest.is_completed ? "#10b981" : COLORS.ironGrey,
                  flexDirection: "row",
                  alignItems: "center",
                  borderLeftWidth: 4,
                  borderLeftColor: quest.is_completed
                    ? "#10b981"
                    : COLORS.forgeOrange,
                }}
              >
                {quest.is_completed ? (
                  <CheckCircle2 color="#10b981" size={22} fill="#10b981" />
                ) : (
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2.5,
                      borderColor: COLORS.forgeOrange,
                    }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#fff",
                    marginLeft: 14,
                    flex: 1,
                    textDecorationLine: quest.is_completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {quest.quest_description}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: COLORS.carbonBlack,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Zap
                    color={COLORS.orangeRimLight}
                    size={14}
                    fill={COLORS.orangeRimLight}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.orangeRimLight,
                      marginLeft: 4,
                    }}
                  >
                    +{quest.xp_reward}
                  </Text>
                </View>
              </View>
            ))}

            <Text
              style={{
                fontSize: 13,
                color: COLORS.steelSilver,
                textAlign: "center",
                marginTop: 6,
                fontWeight: "600",
              }}
            >
              {completedQuests}/{dailyQuests.length} {t("questsCompleted")}
            </Text>
          </View>
        )}

        {/* Quick Actions - Forged Buttons */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 18,
              letterSpacing: 0.5,
            }}
          >
            {t("quickActions")}
          </Text>

          {/* Primary Action - Molten Gradient Button */}
          {!hasProfile ? (
            <TouchableOpacity
              onPress={() => router.push("/onboarding/questionnaire")}
              style={{
                backgroundColor: COLORS.moltenEmber,
                borderRadius: 18,
                padding: 22,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
                borderWidth: 1,
                borderColor: COLORS.forgeOrange,
                shadowColor: COLORS.forgeOrange,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  borderRadius: 14,
                  padding: 12,
                  marginRight: 18,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Sparkles color="#fff" size={26} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: 3,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("letsStart")}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: "600",
                  }}
                >
                  {t("brandSubtitle")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/training")}
              style={{
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 18,
                padding: 22,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
                borderWidth: 1,
                borderColor: COLORS.ironGrey,
                borderLeftWidth: 4,
                borderLeftColor: COLORS.forgeOrange,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 14,
                  padding: 12,
                  marginRight: 18,
                }}
              >
                <TrendingUp
                  color={COLORS.forgeOrange}
                  size={26}
                  strokeWidth={2.5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: 3,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("todaysWorkout")}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.steelSilver,
                    fontWeight: "600",
                  }}
                >
                  {t("continueTraining") || "Continue your journey"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Secondary Actions - Steel Cards */}
          <View style={{ flexDirection: "row", gap: 14 }}>
            <TouchableOpacity
              onPress={() => router.push("/browse-programs")}
              style={{
                flex: 1,
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 18,
                padding: 18,
                borderWidth: 1.5,
                borderColor: COLORS.ironGrey,
                borderTopWidth: 2,
                borderTopColor: COLORS.forgeOrange,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 10,
                  padding: 8,
                  alignSelf: "flex-start",
                  marginBottom: 12,
                }}
              >
                <TrendingUp
                  color={COLORS.forgeOrange}
                  size={24}
                  strokeWidth={2.5}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  letterSpacing: 0.3,
                }}
              >
                {t("browsePrograms") || "Browse Programs"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              style={{
                flex: 1,
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 18,
                padding: 18,
                borderWidth: 1.5,
                borderColor: COLORS.ironGrey,
                borderTopWidth: 2,
                borderTopColor: COLORS.forgeOrange,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 10,
                  padding: 8,
                  alignSelf: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Flame
                  color={COLORS.orangeRimLight}
                  size={24}
                  strokeWidth={2.5}
                  fill={COLORS.orangeRimLight}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  letterSpacing: 0.3,
                }}
              >
                {t("trackProgress")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Programs - Forged Cards */}
        {featuredPrograms.length > 0 && (
          <View style={{ paddingTop: 36 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 18,
                paddingHorizontal: 20,
                letterSpacing: 0.5,
              }}
            >
              {t("featuredPrograms") || "Featured Programs"}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                gap: 14,
                flexGrow: 0,
              }}
            >
              {featuredPrograms.map((program) => (
                <TouchableOpacity
                  key={program.id}
                  onPress={() => router.push(`/program/${program.id}`)}
                  style={{
                    width: 300,
                    backgroundColor: COLORS.forgedSteel,
                    borderRadius: 18,
                    overflow: "hidden",
                    borderWidth: 1.5,
                    borderColor: COLORS.ironGrey,
                  }}
                >
                  {program.image_url && (
                    <Image
                      source={{ uri: program.image_url }}
                      style={{ width: "100%", height: 160 }}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ padding: 18 }}>
                    <View
                      style={{
                        backgroundColor: COLORS.moltenEmber,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: COLORS.forgeOrange,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "800",
                          color: "#fff",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        {program.difficulty_level}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: 6,
                        letterSpacing: 0.3,
                      }}
                    >
                      {program.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.steelSilver,
                        lineHeight: 20,
                        fontWeight: "500",
                      }}
                    >
                      {program.description}
                    </Text>
                    {program.duration_weeks && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 12,
                          backgroundColor: COLORS.carbonBlack,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: COLORS.forgeOrange,
                            fontWeight: "700",
                          }}
                        >
                          {program.duration_weeks} {t("weeks")}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Daily Tips - Steel Information Cards */}
        {tips.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 36 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 18,
                letterSpacing: 0.5,
              }}
            >
              {t("dailyTips") || "Daily Tips"}
            </Text>

            {tips.map((tip, index) => (
              <View
                key={tip.id}
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: COLORS.forgeOrange,
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: 8,
                    letterSpacing: 0.3,
                  }}
                >
                  {tip.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.steelSilver,
                    lineHeight: 21,
                    fontWeight: "500",
                  }}
                >
                  {tip.content}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
