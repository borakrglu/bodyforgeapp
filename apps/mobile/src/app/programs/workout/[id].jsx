import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Dumbbell,
  Info,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react-native";
import { useUser } from "../../../utils/auth/useUser";
import useLanguage from "../../../utils/i18n";

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

export default function WorkoutProgramDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams();
  const { user, loading: userLoading } = useUser();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadProgram();
    }
  }, [user]);

  const loadProgram = async () => {
    try {
      const response = await fetch(
        `/api/programs/user/${user.id}?type=workout`,
      );

      if (response.ok) {
        const data = await response.json();
        const foundProgram = data.programs.find((p) => p.id.toString() === id);
        if (foundProgram) {
          setProgram(foundProgram);
        }
      }
    } catch (error) {
      console.error("Error loading program:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.carbonBlack,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator color={COLORS.forgeOrange} size="large" />
      </View>
    );
  }

  if (!program) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.carbonBlack,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <Text style={{ color: COLORS.steelSilver }}>Program not found</Text>
      </View>
    );
  }

  const content = program.content;

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
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#fff",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {content.program_name}
        </Text>
        <Text
          style={{ fontSize: 15, color: COLORS.steelSilver, fontWeight: "600" }}
        >
          {content.split_type} • {content.duration_weeks} weeks
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progressive overload info */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: COLORS.ironGrey,
              borderLeftWidth: 4,
              borderLeftColor: COLORS.forgeOrange,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Info color={COLORS.forgeOrange} size={20} strokeWidth={2.5} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#fff",
                  marginLeft: 10,
                  letterSpacing: 0.5,
                }}
              >
                Strategy
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.steelSilver,
                lineHeight: 21,
                fontWeight: "500",
              }}
            >
              {content.progressive_overload_strategy}
            </Text>
          </View>

          {/* Workouts */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 18,
              letterSpacing: 0.5,
            }}
          >
            Training Days
          </Text>

          {content.workouts.map((workout, index) => (
            <View
              key={index}
              style={{
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 18,
                marginBottom: 16,
                borderWidth: 1.5,
                borderColor: COLORS.ironGrey,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setExpandedWorkout(expandedWorkout === index ? null : index)
                }
                style={{
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: "#fff",
                      marginBottom: 4,
                      letterSpacing: 0.3,
                    }}
                  >
                    {workout.day_name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.steelSilver,
                      fontWeight: "600",
                    }}
                  >
                    {workout.focus} • {workout.exercises.length} exercises
                  </Text>
                </View>
                {expandedWorkout === index ? (
                  <ChevronUp
                    color={COLORS.forgeOrange}
                    size={24}
                    strokeWidth={2.5}
                  />
                ) : (
                  <ChevronDown
                    color={COLORS.steelSilver}
                    size={24}
                    strokeWidth={2.5}
                  />
                )}
              </TouchableOpacity>

              {expandedWorkout === index && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                  {/* Warm up */}
                  <View
                    style={{
                      backgroundColor: COLORS.carbonBlack,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 18,
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: COLORS.forgeOrange,
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Warm-Up
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.steelSilver,
                        lineHeight: 21,
                        fontWeight: "500",
                      }}
                    >
                      {workout.warm_up}
                    </Text>
                  </View>

                  {/* Exercises */}
                  {workout.exercises.map((exercise, exIndex) => (
                    <View
                      key={exIndex}
                      style={{
                        backgroundColor: COLORS.carbonBlack,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: "#fff",
                          marginBottom: 10,
                          letterSpacing: 0.3,
                        }}
                      >
                        {exIndex + 1}. {exercise.name}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 10,
                          marginBottom: 10,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: COLORS.forgedSteel,
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
                              color: COLORS.orangeRimLight,
                              fontWeight: "700",
                            }}
                          >
                            {exercise.sets} sets × {exercise.reps} reps
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: COLORS.forgedSteel,
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
                            RPE {exercise.rpe}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: COLORS.forgedSteel,
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
                            {exercise.rest_seconds}s rest
                          </Text>
                        </View>
                      </View>

                      {exercise.tempo && (
                        <Text
                          style={{
                            fontSize: 13,
                            color: COLORS.ironGrey,
                            marginBottom: 4,
                            fontWeight: "600",
                          }}
                        >
                          Tempo: {exercise.tempo}
                        </Text>
                      )}

                      {exercise.notes && (
                        <Text
                          style={{
                            fontSize: 13,
                            color: COLORS.steelSilver,
                            marginBottom: 8,
                            fontStyle: "italic",
                            fontWeight: "500",
                          }}
                        >
                          💡 {exercise.notes}
                        </Text>
                      )}
                    </View>
                  ))}

                  {/* Start Workout Button for this specific day */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/workout/active",
                        params: {
                          workoutId: program.id,
                          workoutName: workout.day_name,
                        },
                      })
                    }
                    style={{
                      backgroundColor: COLORS.moltenEmber,
                      borderRadius: 14,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: COLORS.forgeOrange,
                    }}
                  >
                    <Play
                      color="#fff"
                      size={20}
                      fill="#fff"
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "900",
                        fontSize: 16,
                        letterSpacing: 1,
                      }}
                    >
                      START WORKOUT
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {/* Recovery tips */}
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: COLORS.ironGrey,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 10,
                letterSpacing: 0.5,
              }}
            >
              Recovery Tips
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.steelSilver,
                lineHeight: 21,
                fontWeight: "500",
              }}
            >
              {content.recovery_tips}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
