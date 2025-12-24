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
  Award,
  Trophy,
  ChevronLeft,
  Lock,
  Star,
  Zap,
  Flame,
  Target,
  Dumbbell,
  TrendingUp,
  Crown,
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
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
};

const getTierColor = (tier) => {
  const colors = {
    bronze: COLORS.bronze,
    silver: COLORS.silver,
    gold: COLORS.gold,
    platinum: COLORS.platinum,
    diamond: COLORS.diamond,
  };
  return colors[tier] || COLORS.steelSilver;
};

const getBadgeIcon = (badgeId) => {
  const iconMap = {
    first_workout: Dumbbell,
    first_meal_log: Target,
    week_streak: Flame,
    month_streak: Trophy,
    bench_100kg: Award,
    plan_designer: Star,
    transformation_starter: TrendingUp,
    shredder_mode: Zap,
    level_10: Star,
    level_20: Trophy,
    level_30: Award,
    premium_member: Crown,
  };
  return iconMap[badgeId] || Award;
};

export default function BadgesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [selectedTier, setSelectedTier] = useState("all");

  useEffect(() => {
    if (user?.id) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gamification/badges?userId=${user.id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
        setTotalUnlocked(data.totalUnlocked || 0);
      }
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const FilterChip = ({ label, value }) => {
    const isActive = selectedTier === value;
    return (
      <TouchableOpacity
        onPress={() => setSelectedTier(value)}
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

  const BadgeCard = ({ badge }) => {
    const IconComponent = getBadgeIcon(badge.badgeId);
    const tierColor = getTierColor(badge.tier);
    const isUnlocked = badge.unlocked;

    return (
      <View
        style={{
          backgroundColor: isUnlocked ? COLORS.forgedSteel : COLORS.carbonBlack,
          borderRadius: 16,
          padding: 18,
          marginBottom: 14,
          borderWidth: 2,
          borderColor: isUnlocked ? tierColor : COLORS.ironGrey,
          borderLeftWidth: isUnlocked ? 4 : 2,
          opacity: isUnlocked ? 1 : 0.6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {/* Badge Icon */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isUnlocked ? tierColor + "33" : COLORS.ironGrey,
              borderWidth: 2,
              borderColor: isUnlocked ? tierColor : COLORS.steelSilver + "44",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 14,
            }}
          >
            {isUnlocked ? (
              <IconComponent color={tierColor} size={28} strokeWidth={2.5} />
            ) : (
              <Lock color={COLORS.steelSilver} size={24} strokeWidth={2} />
            )}
          </View>

          {/* Badge Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: "#fff",
                marginBottom: 4,
              }}
            >
              {badge.name}
            </Text>

            {/* Tier Badge */}
            <View
              style={{
                backgroundColor: tierColor + "33",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: tierColor,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: tierColor,
                  textTransform: "uppercase",
                }}
              >
                {badge.tier}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text
          style={{
            fontSize: 14,
            color: COLORS.steelSilver,
            marginBottom: 10,
            fontWeight: "600",
          }}
        >
          {badge.description}
        </Text>

        {/* Unlock Date */}
        {isUnlocked && badge.unlockedAt && (
          <View
            style={{
              backgroundColor: tierColor + "22",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              marginTop: 4,
              borderWidth: 1,
              borderColor: tierColor + "44",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: tierColor,
              }}
            >
              ✓ {language === "tr" ? "Açıldı:" : "Unlocked:"}{" "}
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const filteredBadges =
    selectedTier === "all"
      ? badges
      : badges.filter((b) => b.tier === selectedTier);

  const unlockedFiltered = filteredBadges.filter((b) => b.unlocked).length;

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
              ACHIEVEMENTS
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
            <Award color={COLORS.gold} size={28} strokeWidth={2.5} />
          </View>
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
          ) : (
            <>
              {/* Stats Card */}
              <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <View
                  style={{
                    backgroundColor: COLORS.forgedSteel,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: COLORS.ironGrey,
                    borderTopWidth: 3,
                    borderTopColor: COLORS.gold,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Trophy
                      color={COLORS.forgeOrange}
                      size={24}
                      strokeWidth={2.5}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#fff",
                        marginLeft: 12,
                      }}
                    >
                      {language === "tr" ? "İLERLEME" : "PROGRESS"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 48,
                        fontWeight: "900",
                        color: COLORS.forgeOrange,
                        letterSpacing: -2,
                      }}
                    >
                      {totalUnlocked}
                    </Text>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: COLORS.steelSilver,
                        marginLeft: 8,
                      }}
                    >
                      / {badges.length}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={{
                      backgroundColor: COLORS.ironGrey,
                      borderRadius: 8,
                      height: 12,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: COLORS.steelSilver + "33",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: COLORS.forgeOrange,
                        height: "100%",
                        width: `${(totalUnlocked / badges.length) * 100}%`,
                      }}
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.steelSilver,
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    {Math.round((totalUnlocked / badges.length) * 100)}%{" "}
                    {language === "tr" ? "Tamamlandı" : "Complete"}
                  </Text>
                </View>
              </View>

              {/* Tier Filters */}
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
                  {language === "tr" ? "SEVIYE" : "TIER"}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  <FilterChip
                    label={language === "tr" ? "Tümü" : "All"}
                    value="all"
                  />
                  <FilterChip label="Bronze" value="bronze" />
                  <FilterChip label="Silver" value="silver" />
                  <FilterChip label="Gold" value="gold" />
                  <FilterChip label="Platinum" value="platinum" />
                  <FilterChip label="Diamond" value="diamond" />
                </ScrollView>
              </View>

              {/* Badges List */}
              <View style={{ paddingHorizontal: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                    {selectedTier === "all"
                      ? language === "tr"
                        ? "TÜM ROZETLER"
                        : "ALL BADGES"
                      : `${selectedTier.toUpperCase()} ${language === "tr" ? "ROZETLER" : "BADGES"}`}
                  </Text>
                  <View
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: COLORS.orangeRimLight,
                      }}
                    >
                      {unlockedFiltered}/{filteredBadges.length}
                    </Text>
                  </View>
                </View>

                {filteredBadges.length === 0 ? (
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
                    <Award
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
                      {language === "tr"
                        ? "Bu seviyede rozet yok"
                        : "No badges in this tier"}
                    </Text>
                  </View>
                ) : (
                  filteredBadges.map((badge) => (
                    <BadgeCard key={badge.badgeId} badge={badge} />
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
