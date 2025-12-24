import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Trophy,
  TrendingUp,
  Calendar,
  Dumbbell,
  Target,
  Share2,
  Award,
  Zap,
  Flame,
} from "lucide-react-native";
import { useUser } from "../utils/auth/useUser";
import useLanguage from "../utils/i18n";

const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
  gold: "#FFD700",
};

const { width } = Dimensions.get("window");

export default function PersonalRecordsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();

  const [prs, setPrs] = useState([]);
  const [recentPRs, setRecentPRs] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalPRs, setTotalPRs] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadPRs();
    }
  }, [user, selectedGroup]);

  const loadPRs = async () => {
    try {
      const response = await fetch(
        `/api/workout-logs/prs?userId=${user.id}&muscleGroup=${selectedGroup}`,
      );
      if (response.ok) {
        const data = await response.json();
        setPrs(data.prs || []);
        setRecentPRs(data.recentPRs || []);
        setMuscleGroups(data.muscleGroups || []);
        setTotalPRs(data.totalPRs || 0);
      }
    } catch (error) {
      console.error("Error loading PRs:", error);
    } finally {
      setLoading(false);
    }
  };

  const sharePR = async (pr) => {
    try {
      const message = `💪 New PR! ${pr.exercise}\n🏋️ ${pr.weight}kg × ${pr.reps} reps\n🎯 Est. 1RM: ${pr.estimatedOneRM.toFixed(1)}kg\n\nForged on BodyForge 🔥`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing PR:", error);
    }
  };

  // Calculate stats
  const getStrongestLift = () => {
    if (prs.length === 0) return null;
    return prs.reduce(
      (max, pr) => (pr.estimatedOneRM > max.estimatedOneRM ? pr : max),
      prs[0],
    );
  };

  const getTotalVolume = () => {
    return prs.reduce((sum, pr) => sum + pr.weight * pr.reps, 0);
  };

  const getMostImprovedLift = () => {
    const withImprovements = prs.filter((pr) => pr.previousBest);
    if (withImprovements.length === 0) return null;
    return withImprovements.reduce((max, pr) => {
      const improvement = pr.estimatedOneRM - pr.previousBest.estimatedOneRM;
      const maxImprovement =
        max.estimatedOneRM - max.previousBest.estimatedOneRM;
      return improvement > maxImprovement ? pr : max;
    }, withImprovements[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMuscleGroupColor = (group) => {
    const colors = {
      Chest: "#ef4444",
      Back: "#10b981",
      Shoulders: "#f59e0b",
      Arms: "#3b82f6",
      Legs: "#8b5cf6",
      Core: "#ec4899",
      Cardio: "#06b6d4",
      Other: COLORS.steelSilver,
    };
    return colors[group] || COLORS.steelSilver;
  };

  const getMuscleGroupIcon = (group) => {
    const icons = {
      Chest: "💪",
      Back: "🏋️",
      Shoulders: "🔥",
      Arms: "💪",
      Legs: "🦵",
      Core: "⚡",
      Cardio: "❤️",
      Other: "🎯",
    };
    return icons[group] || "🎯";
  };

  const FilterChip = ({ label, value }) => {
    const isActive = selectedGroup === value;
    return (
      <TouchableOpacity
        onPress={() => setSelectedGroup(value)}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 18,
          borderRadius: 12,
          backgroundColor: isActive ? COLORS.forgeOrange : COLORS.forgedSteel,
          borderWidth: 1,
          borderColor: isActive ? COLORS.forgeOrange : COLORS.ironGrey,
          marginRight: 10,
        }}
      >
        <Text
          style={{
            color: isActive ? "#fff" : COLORS.steelSilver,
            fontWeight: isActive ? "800" : "600",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const PRCard = ({ pr, rank }) => {
    const isTopThree = rank <= 3;
    const borderColor =
      rank === 1 ? COLORS.gold : rank === 2 ? "#C0C0C0" : "#CD7F32";

    return (
      <View
        style={{
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 16,
          padding: 18,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: isTopThree ? borderColor : COLORS.ironGrey,
          borderLeftWidth: isTopThree ? 4 : 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {isTopThree && (
                <Text style={{ fontSize: 20 }}>
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                </Text>
              )}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#fff",
                  flex: 1,
                }}
              >
                {pr.exercise}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <View
                style={{
                  backgroundColor: getMuscleGroupColor(pr.muscleGroup) + "33",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: getMuscleGroupColor(pr.muscleGroup),
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: getMuscleGroupColor(pr.muscleGroup),
                  }}
                >
                  {getMuscleGroupIcon(pr.muscleGroup)} {pr.muscleGroup}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => sharePR(pr)}
            style={{
              backgroundColor: COLORS.ironGrey,
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: COLORS.steelSilver + "33",
            }}
          >
            <Share2 color={COLORS.steelSilver} size={18} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: COLORS.ironGrey,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Dumbbell
                color={COLORS.forgeOrange}
                size={16}
                strokeWidth={2.5}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.steelSilver,
                  marginLeft: 6,
                  fontWeight: "600",
                }}
              >
                Weight × Reps
              </Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: COLORS.forgeOrange,
              }}
            >
              {pr.weight}kg × {pr.reps}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Trophy color={COLORS.gold} size={16} strokeWidth={2.5} />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.steelSilver,
                  marginLeft: 6,
                  fontWeight: "600",
                }}
              >
                Est. 1RM
              </Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#fff",
              }}
            >
              {pr.estimatedOneRM.toFixed(1)}
              <Text style={{ fontSize: 14, color: COLORS.steelSilver }}>
                {" "}
                kg
              </Text>
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: COLORS.ironGrey,
          }}
        >
          <Calendar color={COLORS.steelSilver} size={14} strokeWidth={2} />
          <Text
            style={{
              fontSize: 13,
              color: COLORS.steelSilver,
              marginLeft: 6,
              fontWeight: "600",
            }}
          >
            {formatDate(pr.date)}
          </Text>
        </View>

        {pr.previousBest && (
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: COLORS.ironGrey,
              backgroundColor: "#10b98133",
              marginHorizontal: -18,
              paddingHorizontal: 18,
              paddingBottom: 12,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <TrendingUp color="#10b981" size={16} strokeWidth={2.5} />
              <Text
                style={{
                  fontSize: 13,
                  color: "#10b981",
                  fontWeight: "700",
                }}
              >
                IMPROVEMENT
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.steelSilver,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Previous: {pr.previousBest.weight}kg × {pr.previousBest.reps} (
              {pr.previousBest.estimatedOneRM.toFixed(1)}kg 1RM)
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#10b981",
                fontWeight: "800",
              }}
            >
              ↑ +
              {(pr.estimatedOneRM - pr.previousBest.estimatedOneRM).toFixed(1)}
              kg stronger!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const RecentPRCard = ({ pr }) => (
    <View
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 14,
        padding: 16,
        marginRight: 14,
        borderWidth: 1,
        borderColor: COLORS.forgeOrange,
        borderLeftWidth: 3,
        width: width * 0.7,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Trophy color={COLORS.gold} size={20} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "900",
            color: "#fff",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {pr.exercise}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "900",
          color: COLORS.forgeOrange,
          marginBottom: 8,
        }}
      >
        {pr.weight}kg × {pr.reps}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Calendar color={COLORS.steelSilver} size={12} strokeWidth={2} />
        <Text
          style={{
            fontSize: 12,
            color: COLORS.steelSilver,
            marginLeft: 6,
            fontWeight: "600",
          }}
        >
          {formatDate(pr.date)}
        </Text>
      </View>
    </View>
  );

  const StatCard = ({ icon: Icon, label, value, color, iconColor }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.ironGrey,
        borderTopWidth: 3,
        borderTopColor: color,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Icon color={iconColor} size={20} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: COLORS.steelSilver,
            marginLeft: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          color: "#fff",
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
    </View>
  );

  const strongestLift = getStrongestLift();
  const mostImproved = getMostImprovedLift();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header */}
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
              PERSONAL RECORDS
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
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 24 }}>
          {loading ? (
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
                Loading PRs...
              </Text>
            </View>
          ) : prs.length === 0 && selectedGroup === "all" ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
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
                  marginHorizontal: 20,
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
                  {t("noPRsYet")}
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
                  {t("setPRsToSee")}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/training")}
                  style={{
                    backgroundColor: COLORS.forgeOrange,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: COLORS.moltenEmber,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#fff",
                      letterSpacing: 0.5,
                    }}
                  >
                    Start Training
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Stats Grid */}
              <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}
                >
                  <StatCard
                    icon={Target}
                    label="Total PRs"
                    value={totalPRs}
                    color={COLORS.gold}
                    iconColor={COLORS.gold}
                  />
                  <StatCard
                    icon={Flame}
                    label="Recent"
                    value={recentPRs.length}
                    color={COLORS.forgeOrange}
                    iconColor={COLORS.forgeOrange}
                  />
                </View>

                {strongestLift && (
                  <View
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      borderRadius: 14,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      borderTopWidth: 3,
                      borderTopColor: "#8b5cf6",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Award color="#8b5cf6" size={20} strokeWidth={2.5} />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: COLORS.steelSilver,
                          marginLeft: 8,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Strongest Lift
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {strongestLift.exercise}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "900",
                        color: "#8b5cf6",
                      }}
                    >
                      {strongestLift.estimatedOneRM.toFixed(1)} kg
                    </Text>
                  </View>
                )}

                {mostImproved && (
                  <View
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      borderRadius: 14,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      borderTopWidth: 3,
                      borderTopColor: "#10b981",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Zap color="#10b981" size={20} strokeWidth={2.5} />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: COLORS.steelSilver,
                          marginLeft: 8,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Most Improved
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {mostImproved.exercise}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "900",
                        color: "#10b981",
                      }}
                    >
                      +
                      {(
                        mostImproved.estimatedOneRM -
                        mostImproved.previousBest.estimatedOneRM
                      ).toFixed(1)}{" "}
                      kg
                    </Text>
                  </View>
                )}
              </View>

              {/* Recent PRs Section */}
              {recentPRs.length > 0 && selectedGroup === "all" && (
                <View style={{ marginBottom: 28 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: "#fff",
                        letterSpacing: 0.5,
                      }}
                    >
                      {t("recentPRs")}
                    </Text>
                    <View
                      style={{
                        backgroundColor: COLORS.forgeOrange + "33",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.forgeOrange,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: COLORS.forgeOrange,
                        }}
                      >
                        LAST 30 DAYS
                      </Text>
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                  >
                    {recentPRs.map((pr, index) => (
                      <RecentPRCard key={index} pr={pr} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Muscle Group Filters */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: 16,
                    paddingHorizontal: 20,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("byMuscleGroup")}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  <FilterChip label={t("allExercises")} value="all" />
                  {muscleGroups.map((group) => (
                    <FilterChip key={group} label={group} value={group} />
                  ))}
                </ScrollView>
              </View>

              {/* All PRs List */}
              <View style={{ paddingHorizontal: 20 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {selectedGroup === "all"
                    ? "ALL RECORDS"
                    : `${selectedGroup.toUpperCase()} RECORDS`}
                </Text>
                {prs.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      borderRadius: 14,
                      padding: 24,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                    }}
                  >
                    <Dumbbell
                      color={COLORS.steelSilver}
                      size={40}
                      strokeWidth={2}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#fff",
                        marginTop: 12,
                      }}
                    >
                      No PRs in this category yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.steelSilver,
                        marginTop: 6,
                        textAlign: "center",
                      }}
                    >
                      Keep training to set your first PR!
                    </Text>
                  </View>
                ) : (
                  prs.map((pr, index) => (
                    <PRCard key={index} pr={pr} rank={index + 1} />
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
