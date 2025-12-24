import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Pill,
  Clock,
  AlertTriangle,
  RefreshCw,
  Check,
  Sunrise,
  Flame,
  Sparkles,
  Moon,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useLanguage from "../../utils/i18n";
import { useUser } from "../../utils/auth/useUser";

// BodyForge Color Palette
const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
  purpleAccent: "#8b5cf6",
  purpleDark: "#7c3aed",
};

export default function SupplementsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [supplementPlan, setSupplementPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  // Tracking state
  const [takenSupplements, setTakenSupplements] = useState({});

  useEffect(() => {
    if (user?.id) {
      loadSupplementPlan(user.id);
      loadDailyProgress();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadSupplementPlan = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/programs/user/${id}?type=supplement`);
      if (response.ok) {
        const data = await response.json();
        if (data.programs && data.programs.length > 0) {
          setSupplementPlan(data.programs[0]);
        }
      }
    } catch (error) {
      console.error("Error loading supplement plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyProgress = () => {
    const today = new Date().toDateString();
    const stored = global.supplementTracking?.[today];
    if (stored) {
      setTakenSupplements(stored.takenSupplements || {});
    }
  };

  const saveDailyProgress = (supplements) => {
    const today = new Date().toDateString();
    if (!global.supplementTracking) global.supplementTracking = {};
    global.supplementTracking[today] = {
      takenSupplements: supplements,
    };
  };

  const handleRegenerate = async () => {
    if (!user?.id) return;
    setRegenerating(true);
    try {
      const response = await fetch("/api/programs/generate-supplement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        await loadSupplementPlan(user.id);
      }
    } catch (error) {
      console.error("Error regenerating supplement plan:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const toggleSupplement = (scheduleIndex, suppIndex) => {
    const key = `${scheduleIndex}-${suppIndex}`;
    const newTaken = { ...takenSupplements };

    if (newTaken[key]) {
      delete newTaken[key];
    } else {
      newTaken[key] = true;
    }

    setTakenSupplements(newTaken);
    saveDailyProgress(newTaken);
  };

  const timeSlotIcons = {
    Morning: Sunrise,
    "Pre-Workout": Flame,
    "Post-Workout": Sparkles,
    Night: Moon,
  };

  const timeSlotColors = {
    Morning: "#f59e0b",
    "Pre-Workout": "#ef4444",
    "Post-Workout": "#10b981",
    Night: "#8b5cf6",
  };

  // Calculate progress
  const totalSupplements =
    supplementPlan?.content?.daily_schedule?.reduce(
      (sum, schedule) => sum + schedule.supplements_to_take.length,
      0,
    ) || 0;
  const takenCount = Object.keys(takenSupplements).length;
  const completionPercent =
    totalSupplements > 0
      ? Math.round((takenCount / totalSupplements) * 100)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header - Forge Style */}
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: COLORS.carbonBlack,
          borderBottomWidth: 2,
          borderBottomColor: COLORS.ironGrey,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.purpleAccent,
              borderRadius: 12,
              padding: 10,
              marginRight: 14,
              borderWidth: 1,
              borderColor: COLORS.purpleDark,
            }}
          >
            <Pill color="#fff" size={26} strokeWidth={2.5} />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("supplements")}
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: COLORS.purpleAccent,
            marginLeft: 60,
            borderRadius: 2,
          }}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {loading ? (
            <Text
              style={{
                color: COLORS.steelSilver,
                textAlign: "center",
                marginTop: 40,
                fontWeight: "600",
              }}
            >
              {language === "tr" ? "Yükleniyor..." : "Loading..."}
            </Text>
          ) : supplementPlan ? (
            <>
              {/* Daily Progress Card */}
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 2,
                  borderColor: COLORS.purpleAccent,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pill
                      color={COLORS.purpleAccent}
                      size={24}
                      fill={COLORS.purpleAccent}
                      strokeWidth={2.5}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#fff",
                        marginLeft: 10,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {t("todaysProtocol") || "Today's Protocol"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    disabled={regenerating}
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      borderRadius: 8,
                      padding: 6,
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                    }}
                  >
                    <RefreshCw
                      color={COLORS.purpleAccent}
                      size={16}
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 48,
                      fontWeight: "900",
                      color: COLORS.purpleAccent,
                      letterSpacing: -1,
                    }}
                  >
                    {completionPercent}%
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginTop: -4,
                    }}
                  >
                    {takenCount} of {totalSupplements} taken
                  </Text>
                </View>

                {/* Progress Bar */}
                <View
                  style={{
                    height: 12,
                    backgroundColor: COLORS.ironGrey,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${completionPercent}%`,
                      height: "100%",
                      backgroundColor: COLORS.purpleAccent,
                      borderRadius: 6,
                    }}
                  />
                </View>
              </View>

              {/* Supplement Schedule by Timing */}
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
                  {t("todaysSchedule") || "Today's Schedule"}
                </Text>
              </View>

              {supplementPlan.content.daily_schedule.map(
                (schedule, scheduleIndex) => {
                  const IconComponent = timeSlotIcons[schedule.time] || Clock;
                  const slotColor =
                    timeSlotColors[schedule.time] || COLORS.purpleAccent;

                  return (
                    <View key={scheduleIndex} style={{ marginBottom: 16 }}>
                      {/* Time Slot Header */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: slotColor + "20",
                            borderRadius: 10,
                            padding: 8,
                            marginRight: 12,
                            borderWidth: 1,
                            borderColor: slotColor,
                          }}
                        >
                          <IconComponent
                            color={slotColor}
                            size={20}
                            strokeWidth={2.5}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "800",
                            color: "#fff",
                            letterSpacing: 0.3,
                          }}
                        >
                          {schedule.time}
                        </Text>
                      </View>

                      {/* Supplements List */}
                      {schedule.supplements_to_take.map((supp, suppIndex) => {
                        const key = `${scheduleIndex}-${suppIndex}`;
                        const isTaken = takenSupplements[key];

                        return (
                          <TouchableOpacity
                            key={suppIndex}
                            onPress={() =>
                              toggleSupplement(scheduleIndex, suppIndex)
                            }
                            style={{
                              backgroundColor: isTaken
                                ? slotColor + "20"
                                : COLORS.forgedSteel,
                              borderRadius: 14,
                              padding: 16,
                              marginBottom: 10,
                              borderWidth: 2,
                              borderColor: isTaken
                                ? slotColor
                                : COLORS.ironGrey,
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                borderWidth: 2,
                                borderColor: isTaken
                                  ? slotColor
                                  : COLORS.steelSilver,
                                backgroundColor: isTaken
                                  ? slotColor
                                  : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 14,
                              }}
                            >
                              {isTaken && (
                                <Check color="#fff" size={18} strokeWidth={3} />
                              )}
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "800",
                                  color: "#fff",
                                  letterSpacing: 0.3,
                                  textDecorationLine: isTaken
                                    ? "line-through"
                                    : "none",
                                  opacity: isTaken ? 0.7 : 1,
                                }}
                              >
                                {supp}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}

                      {/* Notes */}
                      {schedule.notes && (
                        <View
                          style={{
                            backgroundColor: COLORS.forgedSteel,
                            borderRadius: 12,
                            padding: 12,
                            borderLeftWidth: 3,
                            borderLeftColor: slotColor,
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: COLORS.steelSilver,
                              fontWeight: "600",
                              fontStyle: "italic",
                            }}
                          >
                            💡 {schedule.notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                },
              )}

              {/* View Full Plan */}
              <TouchableOpacity
                onPress={() =>
                  router.push(`/programs/supplement/${supplementPlan.id}`)
                }
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 16,
                  marginTop: 8,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: COLORS.purpleAccent,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: COLORS.purpleAccent,
                    textAlign: "center",
                    letterSpacing: 0.5,
                  }}
                >
                  View Full Supplement Plan
                </Text>
              </TouchableOpacity>

              {/* Warning */}
              <View
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <AlertTriangle color="#ef4444" size={20} strokeWidth={2.5} />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: "#ef4444",
                      marginLeft: 8,
                      letterSpacing: 0.3,
                    }}
                  >
                    {t("important") || "Important"}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.steelSilver,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  {supplementPlan.content.general_warnings}
                </Text>
              </View>
            </>
          ) : (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 18,
                  padding: 32,
                  borderWidth: 2,
                  borderColor: COLORS.ironGrey,
                  borderTopWidth: 4,
                  borderTopColor: COLORS.purpleAccent,
                  alignItems: "center",
                }}
              >
                <Pill color={COLORS.purpleAccent} size={48} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("noSupplementPlanYet") || "No Supplement Plan Yet"}
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
                  {t("createSupplementPlanToStart") ||
                    "Create your personalized supplement plan"}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/onboarding/questionnaire")}
                  style={{
                    backgroundColor: COLORS.purpleAccent,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: COLORS.purpleDark,
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
                    {t("adjustSupplementPlan") || "Create Supplement Plan"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
