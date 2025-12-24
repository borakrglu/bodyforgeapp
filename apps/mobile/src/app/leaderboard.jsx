import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Trophy,
  Zap,
  Flame,
  ChevronLeft,
  Crown,
  Medal,
  Award,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useLanguage from "../utils/i18n";
import { useUser } from "../utils/auth/useUser";

const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

export default function LeaderboardPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [selectedTab, setSelectedTab] = useState("xp");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gamification/leaderboard?type=${selectedTab}&limit=50`,
      );
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return COLORS.gold;
    if (rank === 2) return COLORS.silver;
    if (rank === 3) return COLORS.bronze;
    return COLORS.steelSilver;
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const PodiumCard = ({ entry }) => {
    const isCurrentUser = entry.userId === user?.id;
    const rankColor = getRankColor(entry.rank);

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          marginTop: entry.rank === 1 ? 0 : entry.rank === 2 ? 20 : 30,
        }}
      >
        {/* Medal */}
        <View
          style={{
            width: entry.rank === 1 ? 80 : 70,
            height: entry.rank === 1 ? 80 : 70,
            borderRadius: entry.rank === 1 ? 40 : 35,
            backgroundColor: rankColor + "33",
            borderWidth: 3,
            borderColor: rankColor,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: entry.rank === 1 ? 36 : 30 }}>
            {getRankEmoji(entry.rank)}
          </Text>
        </View>

        {/* Podium */}
        <View
          style={{
            backgroundColor: isCurrentUser
              ? COLORS.forgeOrange + "33"
              : COLORS.forgedSteel,
            borderRadius: 12,
            borderTopWidth: 3,
            borderTopColor: rankColor,
            borderWidth: 1,
            borderColor: isCurrentUser ? COLORS.forgeOrange : COLORS.ironGrey,
            paddingVertical: 14,
            paddingHorizontal: 12,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            {isCurrentUser
              ? "You"
              : entry.email?.split("@")[0] || `User ${entry.userId}`}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Zap color={COLORS.gold} size={14} strokeWidth={2.5} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: COLORS.gold,
                marginLeft: 4,
              }}
            >
              {selectedTab === "xp"
                ? entry.totalXP.toLocaleString()
                : entry.longestStreak}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: COLORS.steelSilver,
              marginTop: 2,
            }}
          >
            {selectedTab === "xp"
              ? `Lv. ${entry.level}`
              : `${language === "tr" ? "Gün" : "Days"}`}
          </Text>
        </View>
      </View>
    );
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: COLORS.carbonBlack,
          borderBottomWidth: 2,
          borderBottomColor: COLORS.ironGrey,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 12 }}
        >
          <ChevronLeft color="#fff" size={28} strokeWidth={2.5} />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              LEADERBOARD
            </Text>
            <View
              style={{
                width: 80,
                height: 3,
                backgroundColor: COLORS.forgeOrange,
                marginTop: 8,
                borderRadius: 2,
              }}
            />
          </View>
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderRadius: 12,
              padding: 12,
              borderWidth: 2,
              borderColor: COLORS.gold,
            }}
          >
            <Trophy color={COLORS.gold} size={28} strokeWidth={2.5} />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => setSelectedTab("xp")}
            style={{
              flex: 1,
              backgroundColor:
                selectedTab === "xp" ? COLORS.forgeOrange : COLORS.forgedSteel,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor:
                selectedTab === "xp" ? COLORS.forgeOrange : COLORS.ironGrey,
            }}
          >
            <Zap
              color={selectedTab === "xp" ? "#fff" : COLORS.steelSilver}
              size={20}
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: selectedTab === "xp" ? "#fff" : COLORS.steelSilver,
                marginTop: 6,
              }}
            >
              {t("xpLeaderboard")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("streak")}
            style={{
              flex: 1,
              backgroundColor:
                selectedTab === "streak"
                  ? COLORS.forgeOrange
                  : COLORS.forgedSteel,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor:
                selectedTab === "streak" ? COLORS.forgeOrange : COLORS.ironGrey,
            }}
          >
            <Flame
              color={selectedTab === "streak" ? "#fff" : COLORS.steelSilver}
              size={20}
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: selectedTab === "streak" ? "#fff" : COLORS.steelSilver,
                marginTop: 6,
              }}
            >
              {t("streakLeaderboard")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 24 }}>
          {userLoading || loading ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <ActivityIndicator color={COLORS.forgeOrange} size="large" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: COLORS.steelSilver,
                  marginTop: 16,
                }}
              >
                {language === "tr" ? "Yükleniyor..." : "Loading..."}
              </Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                marginTop: 60,
                marginHorizontal: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 18,
                  padding: 32,
                  borderWidth: 2,
                  borderColor: COLORS.ironGrey,
                  borderTopWidth: 4,
                  borderTopColor: COLORS.gold,
                  alignItems: "center",
                }}
              >
                <Trophy color={COLORS.gold} size={48} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {language === "tr" ? "Henüz Veri Yok" : "No Data Yet"}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: COLORS.steelSilver,
                    marginTop: 8,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {language === "tr"
                    ? "Lider tablosunda görünmek için görevleri tamamla"
                    : "Complete quests to appear on the leaderboard"}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#fff",
                      marginBottom: 20,
                      letterSpacing: 0.5,
                      textAlign: "center",
                    }}
                  >
                    {language === "tr"
                      ? "🏆 EN İYİLER 🏆"
                      : "🏆 TOP PERFORMERS 🏆"}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      alignItems: "flex-end",
                    }}
                  >
                    {/* 2nd Place */}
                    {topThree[1] && <PodiumCard entry={topThree[1]} />}

                    {/* 1st Place */}
                    {topThree[0] && <PodiumCard entry={topThree[0]} />}

                    {/* 3rd Place */}
                    {topThree[2] && <PodiumCard entry={topThree[2]} />}
                  </View>
                </View>
              )}

              {/* Rest of Leaderboard */}
              {restOfLeaderboard.length > 0 && (
                <View style={{ paddingHorizontal: 20 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: "#fff",
                      marginBottom: 16,
                      letterSpacing: 0.5,
                    }}
                  >
                    {language === "tr" ? "SIRALAMALAR" : "RANKINGS"}
                  </Text>

                  {restOfLeaderboard.map((entry) => {
                    const isCurrentUser = entry.userId === user?.id;

                    return (
                      <View
                        key={entry.userId}
                        style={{
                          backgroundColor: isCurrentUser
                            ? COLORS.forgeOrange + "22"
                            : COLORS.forgedSteel,
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: 2,
                          borderColor: isCurrentUser
                            ? COLORS.forgeOrange
                            : COLORS.ironGrey,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {/* Rank */}
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: COLORS.ironGrey,
                            borderWidth: 2,
                            borderColor: COLORS.steelSilver + "44",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 14,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "900",
                              color: "#fff",
                            }}
                          >
                            #{entry.rank}
                          </Text>
                        </View>

                        {/* User Info */}
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "800",
                                color: "#fff",
                              }}
                            >
                              {isCurrentUser
                                ? "You"
                                : entry.email?.split("@")[0] ||
                                  `User ${entry.userId}`}
                            </Text>
                            {entry.isPremium && (
                              <Crown
                                color={COLORS.gold}
                                size={16}
                                strokeWidth={2.5}
                                style={{ marginLeft: 6 }}
                              />
                            )}
                          </View>

                          {selectedTab === "xp" && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Zap
                                color={COLORS.gold}
                                size={14}
                                strokeWidth={2.5}
                              />
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: COLORS.steelSilver,
                                  marginLeft: 6,
                                }}
                              >
                                Level {entry.level} •{" "}
                                {entry.totalXP.toLocaleString()} XP
                              </Text>
                            </View>
                          )}

                          {selectedTab === "streak" && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Flame
                                color={COLORS.forgeOrange}
                                size={14}
                                strokeWidth={2.5}
                              />
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: COLORS.steelSilver,
                                  marginLeft: 6,
                                }}
                              >
                                {entry.longestStreak}{" "}
                                {language === "tr" ? "gün" : "days"} longest •{" "}
                                {entry.currentStreak} current
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
