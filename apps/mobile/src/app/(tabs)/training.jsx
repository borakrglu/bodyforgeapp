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
  Dumbbell,
  RefreshCw,
  Calendar,
  Play,
  Coffee,
  Lock,
  Crown,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useLanguage from "../../utils/i18n";
import { useUser } from "../../utils/auth/useUser";
import usePremium from "../../utils/use-premium";

// BodyForge Color Palette
const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TrainingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useUser();
  const { isPremium } = usePremium();
  const [userProgram, setUserProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [todayIndex, setTodayIndex] = useState(0);

  useEffect(() => {
    // Get today's day index (0 = Monday, 6 = Sunday)
    const today = new Date().getDay();
    // JavaScript getDay() returns 0 for Sunday, we want Monday = 0
    const adjustedToday = today === 0 ? 6 : today - 1;
    setTodayIndex(adjustedToday);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadPrograms(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadPrograms = async (id) => {
    if (!id) return;
    try {
      const userRes = await fetch(`/api/programs/user/${id}?type=workout`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.programs && userData.programs.length > 0) {
          setUserProgram(userData.programs[0]);
        }
      }
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!user?.id) return;
    setRegenerating(true);
    try {
      const response = await fetch("/api/programs/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        await loadPrograms(user.id);
      }
    } catch (error) {
      console.error("Error regenerating program:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const getWorkoutForDay = (dayName) => {
    if (!userProgram?.content?.workouts) return null;
    return userProgram.content.workouts.find((w) =>
      w.day_name.toLowerCase().includes(dayName.toLowerCase()),
    );
  };

  const handleStartWorkout = (workout) => {
    if (!workout) return;
    router.push({
      pathname: "/workout/active",
      params: {
        workoutId: userProgram.id,
        workoutName: workout.day_name,
      },
    });
  };

  const DayCard = ({ dayName, index }) => {
    const workout = getWorkoutForDay(dayName);
    const isToday = index === todayIndex;
    const isRestDay = !workout;
    // Free users can only access first 3 days
    const isLocked = !isPremium && index >= 3;

    return (
      <View
        style={{
          backgroundColor: isToday ? COLORS.moltenEmber : COLORS.forgedSteel,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: isToday ? 2 : 1,
          borderColor: isToday ? COLORS.forgeOrange : COLORS.ironGrey,
          borderLeftWidth: 4,
          borderLeftColor: isToday
            ? COLORS.orangeRimLight
            : isRestDay
              ? COLORS.steelSilver
              : COLORS.forgeOrange,
        }}
      >
        {/* Day Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                {t(dayName.toLowerCase())}
              </Text>
              {isToday && (
                <View
                  style={{
                    backgroundColor: COLORS.forgeOrange,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: "#fff",
                      letterSpacing: 0.5,
                    }}
                  >
                    TODAY
                  </Text>
                </View>
              )}
            </View>
            {workout && (
              <Text
                style={{
                  fontSize: 14,
                  color: isToday ? COLORS.orangeRimLight : COLORS.steelSilver,
                  fontWeight: "600",
                }}
              >
                {workout.focus}
              </Text>
            )}
          </View>

          {isRestDay ? (
            <View
              style={{
                backgroundColor: COLORS.carbonBlack,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: COLORS.ironGrey,
              }}
            >
              <Coffee color={COLORS.steelSilver} size={22} strokeWidth={2.5} />
            </View>
          ) : (
            <View
              style={{
                backgroundColor: isToday
                  ? COLORS.forgeOrange
                  : COLORS.carbonBlack,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: isToday ? COLORS.orangeRimLight : COLORS.ironGrey,
              }}
            >
              <Dumbbell
                color={isToday ? "#fff" : COLORS.forgeOrange}
                size={22}
                strokeWidth={2.5}
              />
            </View>
          )}
        </View>

        {/* Workout Details or Rest Day */}
        {isRestDay ? (
          <View
            style={{
              backgroundColor: COLORS.carbonBlack,
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: COLORS.ironGrey,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: COLORS.steelSilver,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Rest & Recovery Day
            </Text>
          </View>
        ) : (
          <>
            {/* Exercise Count */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.carbonBlack,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.orangeRimLight,
                    fontWeight: "700",
                  }}
                >
                  {workout.exercises.length} exercises
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: COLORS.carbonBlack,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.steelSilver,
                    fontWeight: "700",
                  }}
                >
                  ~{Math.ceil(workout.exercises.length * 4)} min
                </Text>
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              onPress={() => isLocked ? router.push("/premium") : handleStartWorkout(workout)}
              style={{
                backgroundColor: isLocked
                  ? COLORS.ironGrey
                  : isToday
                    ? COLORS.forgeOrange
                    : COLORS.carbonBlack,
                borderRadius: 12,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: isLocked
                  ? "#FFD700"
                  : isToday
                    ? COLORS.orangeRimLight
                    : COLORS.forgeOrange,
              }}
            >
              {isLocked ? (
                <>
                  <Lock
                    color="#FFD700"
                    size={18}
                    strokeWidth={2.5}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: "#FFD700",
                      letterSpacing: 0.5,
                    }}
                  >
                    UNLOCK WITH PREMIUM
                  </Text>
                </>
              ) : (
                <>
                  <Play
                    color={isToday ? "#fff" : COLORS.forgeOrange}
                    size={18}
                    fill={isToday ? "#fff" : COLORS.forgeOrange}
                    strokeWidth={2.5}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: isToday ? "#fff" : COLORS.forgeOrange,
                      letterSpacing: 0.5,
                    }}
                  >
                    {isToday ? "START TODAY'S WORKOUT" : "START WORKOUT"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

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
              backgroundColor: COLORS.moltenEmber,
              borderRadius: 12,
              padding: 10,
              marginRight: 14,
              borderWidth: 1,
              borderColor: COLORS.forgeOrange,
            }}
          >
            <Calendar color="#fff" size={26} strokeWidth={2.5} />
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
            {t("training")}
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: COLORS.forgeOrange,
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
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <ActivityIndicator color={COLORS.forgeOrange} size="large" />
            </View>
          ) : userProgram ? (
            <>
              {/* Program Header */}
              <View style={{ marginBottom: 24 }}>
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
                    {userProgram.content.program_name}
                  </Text>
                  <TouchableOpacity
                    onPress={isPremium ? handleRegenerate : () => router.push("/premium")}
                    disabled={regenerating}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: COLORS.forgedSteel,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isPremium ? COLORS.ironGrey : "#FFD700",
                    }}
                  >
                    {isPremium ? (
                      <RefreshCw
                        color={COLORS.forgeOrange}
                        size={16}
                        strokeWidth={2.5}
                        style={{ marginRight: 6 }}
                      />
                    ) : (
                      <Crown
                        color="#FFD700"
                        size={16}
                        fill="#FFD700"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isPremium ? COLORS.forgeOrange : "#FFD700",
                        letterSpacing: 0.3,
                      }}
                    >
                      {isPremium
                        ? regenerating
                          ? language === "tr"
                            ? "Yenileniyor..."
                            : "Regenerating..."
                          : language === "tr"
                            ? "Yenile"
                            : "Regenerate"
                        : "PRO"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: COLORS.forgedSteel,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: COLORS.ironGrey,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.steelSilver,
                      lineHeight: 20,
                      fontWeight: "600",
                    }}
                  >
                    {userProgram.content.split_type} •{" "}
                    {userProgram.content.duration_weeks} {t("weeks")}
                  </Text>
                </View>
              </View>

              {/* Weekly Schedule */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 16,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Weekly Schedule
              </Text>

              {DAYS_OF_WEEK.map((day, index) => (
                <DayCard key={day} dayName={day} index={index} />
              ))}

              {/* View Full Program Details Button */}
              <TouchableOpacity
                onPress={() =>
                  router.push(`/programs/workout/${userProgram.id}`)
                }
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 16,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: COLORS.forgeOrange,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: COLORS.forgeOrange,
                    textAlign: "center",
                    letterSpacing: 0.5,
                  }}
                >
                  View Full Program Details
                </Text>
              </TouchableOpacity>
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
                  borderTopColor: COLORS.forgeOrange,
                  alignItems: "center",
                }}
              >
                <Dumbbell
                  color={COLORS.forgeOrange}
                  size={48}
                  strokeWidth={2.5}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("noProgramYet") || "No Program Yet"}
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
                  {t("createProgramToStart") ||
                    "Create your personalized program to get started"}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/onboarding/questionnaire")}
                  style={{
                    backgroundColor: COLORS.moltenEmber,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: COLORS.forgeOrange,
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
                    {t("createProgram") || "Create Program"}
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
