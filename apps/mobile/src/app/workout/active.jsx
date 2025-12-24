import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  X,
  CheckCircle2,
  Timer,
  Dumbbell,
  TrendingUp,
  Award,
  Sparkles,
  Clock,
  Plus,
  Minus,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useUser } from "../../utils/auth/useUser";
import useLanguage from "../../utils/i18n";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

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

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  const { workoutName, exercises: exercisesParam } = useLocalSearchParams();

  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutData, setWorkoutData] = useState([]);
  const [workoutStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Timer state
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const timerInterval = useRef(null);
  const elapsedInterval = useRef(null);

  // Completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  useEffect(() => {
    loadWorkout();
    startElapsedTimer();
    return () => {
      clearInterval(timerInterval.current);
      clearInterval(elapsedInterval.current);
    };
  }, []);

  const loadWorkout = async () => {
    try {
      let parsedExercises = [];
      if (exercisesParam) {
        parsedExercises = JSON.parse(exercisesParam);
      } else {
        // Default workout if none provided
        parsedExercises = [
          {
            name: "Bench Press",
            sets: 4,
            reps: 10,
            muscleGroup: "Chest",
          },
          {
            name: "Squat",
            sets: 4,
            reps: 8,
            muscleGroup: "Legs",
          },
          {
            name: "Deadlift",
            sets: 3,
            reps: 6,
            muscleGroup: "Back",
          },
        ];
      }

      setExercises(parsedExercises);

      // Initialize workout data
      const initialData = parsedExercises.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup || "Other",
        sets: Array(parseInt(ex.sets || 3))
          .fill(null)
          .map(() => ({
            weight: "",
            reps: "",
            completed: false,
          })),
      }));
      setWorkoutData(initialData);
    } catch (error) {
      console.error("Error loading workout:", error);
    }
  };

  const startElapsedTimer = () => {
    elapsedInterval.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const newData = [...workoutData];
    newData[exerciseIndex].sets[setIndex] = {
      ...newData[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setWorkoutData(newData);
  };

  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const newData = [...workoutData];
    const set = newData[exerciseIndex].sets[setIndex];

    if (!set.weight || !set.reps) {
      Alert.alert("Missing Data", "Please enter weight and reps first");
      return;
    }

    set.completed = !set.completed;
    setWorkoutData(newData);

    if (set.completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowTimerPicker(true);
    }
  };

  const startRestTimer = (seconds) => {
    clearInterval(timerInterval.current);
    setTimer(seconds);
    setIsTimerActive(true);
    setShowTimerPicker(false);

    timerInterval.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          setIsTimerActive(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    clearInterval(timerInterval.current);
    setIsTimerActive(false);
    setTimer(0);
  };

  const addSet = (exerciseIndex) => {
    const newData = [...workoutData];
    newData[exerciseIndex].sets.push({
      weight: "",
      reps: "",
      completed: false,
    });
    setWorkoutData(newData);
  };

  const removeSet = (exerciseIndex) => {
    const newData = [...workoutData];
    if (newData[exerciseIndex].sets.length > 1) {
      newData[exerciseIndex].sets.pop();
      setWorkoutData(newData);
    }
  };

  const calculateTotalVolume = () => {
    let total = 0;
    workoutData.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.weight && set.reps && set.completed) {
          total += parseFloat(set.weight) * parseInt(set.reps);
        }
      });
    });
    return total;
  };

  const calculateCompletedSets = () => {
    let completed = 0;
    let total = 0;
    workoutData.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        total++;
        if (set.completed) completed++;
      });
    });
    return { completed, total };
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      t("confirmCancel"),
      t("cancelWorkoutWarning"),
      [
        {
          text: t("noContinue"),
          style: "cancel",
        },
        {
          text: t("yesCancel"),
          onPress: () => router.back(),
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  const finishWorkout = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please sign in to save your workout");
      return;
    }

    const { completed, total } = calculateCompletedSets();
    if (completed === 0) {
      Alert.alert(
        "No Sets Completed",
        "Complete at least one set before finishing",
      );
      return;
    }

    try {
      const durationMinutes = Math.floor(elapsedTime / 60);
      const totalVolume = calculateTotalVolume();

      // Prepare exercises data for logging
      const exercisesData = workoutData.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets
          .filter((set) => set.completed)
          .map((set) => ({
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps),
          })),
      }));

      // 1. Save workout log
      const logResponse = await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          workoutName: workoutName || "Workout",
          exercises: exercisesData,
          durationMinutes,
          notes,
        }),
      });

      if (!logResponse.ok) {
        throw new Error("Failed to save workout");
      }

      // 2. Award XP
      const baseXP = 100;
      const volumeBonus = Math.floor(totalVolume / 100);
      const durationBonus = Math.floor(durationMinutes / 10) * 5;
      const totalXP = baseXP + volumeBonus + durationBonus;

      const xpResponse = await fetch("/api/gamification/add-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          actionType: "workout_complete",
          xpAmount: totalXP,
        }),
      });

      if (xpResponse.ok) {
        const xpData = await xpResponse.json();
        setXpEarned(totalXP);
        if (xpData.leveledUp) {
          setLeveledUp(true);
          setNewLevel(xpData.newLevel);
        }
      }

      setShowCompletionModal(true);
    } catch (error) {
      console.error("Error finishing workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    }
  };

  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    router.push("/(tabs)/training");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (exercises.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.carbonBlack,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: COLORS.steelSilver, fontSize: 16 }}>
          Loading workout...
        </Text>
      </View>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const currentData = workoutData[currentExerciseIndex];
  const { completed: completedSets, total: totalSets } =
    calculateCompletedSets();
  const totalVolume = calculateTotalVolume();

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}
      behavior="padding"
    >
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 2,
          borderBottomColor: COLORS.ironGrey,
          backgroundColor: COLORS.carbonBlack,
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
          <TouchableOpacity onPress={handleCancelWorkout}>
            <X color="#ef4444" size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {workoutName || "WORKOUT"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Clock color={COLORS.forgeOrange} size={14} strokeWidth={2.5} />
              <Text
                style={{
                  color: COLORS.forgeOrange,
                  fontSize: 14,
                  fontWeight: "800",
                  marginLeft: 6,
                }}
              >
                {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={finishWorkout}>
            <Text
              style={{
                color: COLORS.forgeOrange,
                fontWeight: "900",
                fontSize: 16,
                letterSpacing: 0.5,
              }}
            >
              DONE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 6,
            backgroundColor: COLORS.ironGrey,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${(completedSets / totalSets) * 100}%`,
              backgroundColor: COLORS.forgeOrange,
              borderRadius: 3,
            }}
          />
        </View>
        <Text
          style={{
            color: COLORS.steelSilver,
            fontSize: 12,
            fontWeight: "700",
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {completedSets} / {totalSets} {t("sets")} • {totalVolume.toFixed(0)}
          kg {t("volume")}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Exercise Header */}
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderRadius: 18,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: COLORS.ironGrey,
              borderTopWidth: 4,
              borderTopColor: COLORS.forgeOrange,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.forgeOrange,
                    fontSize: 14,
                    fontWeight: "800",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {t("exercises")} {currentExerciseIndex + 1} /{" "}
                  {exercises.length}
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: "900",
                    letterSpacing: 0.5,
                  }}
                >
                  {currentExercise.name}
                </Text>
                <Text
                  style={{
                    color: COLORS.steelSilver,
                    fontSize: 14,
                    fontWeight: "600",
                    marginTop: 6,
                  }}
                >
                  {currentExercise.sets} × {currentExercise.reps}{" "}
                  {currentExercise.muscleGroup || ""}
                </Text>
              </View>
              <Dumbbell color={COLORS.forgeOrange} size={40} strokeWidth={2} />
            </View>
          </View>

          {/* Sets */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            {currentData?.sets.map((set, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: set.completed
                    ? COLORS.forgeOrange + "22"
                    : COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: set.completed
                    ? COLORS.forgeOrange
                    : COLORS.ironGrey,
                  borderLeftWidth: set.completed ? 4 : 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* Set Number */}
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: set.completed
                        ? COLORS.forgeOrange
                        : COLORS.ironGrey,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "900",
                        fontSize: 16,
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </View>

                  {/* Weight Input */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: COLORS.steelSilver,
                        fontSize: 11,
                        fontWeight: "700",
                        marginBottom: 4,
                      }}
                    >
                      WEIGHT (KG)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: COLORS.carbonBlack,
                        borderRadius: 10,
                        padding: 12,
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: 16,
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                      }}
                      placeholder="0"
                      placeholderTextColor={COLORS.steelSilver}
                      keyboardType="numeric"
                      value={set.weight}
                      onChangeText={(val) =>
                        updateSet(currentExerciseIndex, idx, "weight", val)
                      }
                      editable={!set.completed}
                    />
                  </View>

                  {/* Reps Input */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: COLORS.steelSilver,
                        fontSize: 11,
                        fontWeight: "700",
                        marginBottom: 4,
                      }}
                    >
                      REPS
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: COLORS.carbonBlack,
                        borderRadius: 10,
                        padding: 12,
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: 16,
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                      }}
                      placeholder="0"
                      placeholderTextColor={COLORS.steelSilver}
                      keyboardType="numeric"
                      value={set.reps}
                      onChangeText={(val) =>
                        updateSet(currentExerciseIndex, idx, "reps", val)
                      }
                      editable={!set.completed}
                    />
                  </View>

                  {/* Complete Button */}
                  <TouchableOpacity
                    onPress={() => toggleSetComplete(currentExerciseIndex, idx)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: set.completed
                        ? COLORS.forgeOrange
                        : COLORS.carbonBlack,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: set.completed
                        ? COLORS.forgeOrange
                        : COLORS.ironGrey,
                    }}
                  >
                    <CheckCircle2
                      color={set.completed ? "#fff" : COLORS.steelSilver}
                      size={24}
                      strokeWidth={2.5}
                      fill={set.completed ? "#fff" : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Add/Remove Set Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 30,
            }}
          >
            <TouchableOpacity
              onPress={() => addSet(currentExerciseIndex)}
              style={{
                flex: 1,
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: COLORS.forgeOrange,
              }}
            >
              <Plus color={COLORS.forgeOrange} size={20} strokeWidth={2.5} />
              <Text
                style={{
                  color: COLORS.forgeOrange,
                  fontWeight: "800",
                  fontSize: 14,
                }}
              >
                {t("addSet")}
              </Text>
            </TouchableOpacity>

            {currentData?.sets.length > 1 && (
              <TouchableOpacity
                onPress={() => removeSet(currentExerciseIndex)}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              >
                <Minus color={COLORS.steelSilver} size={20} strokeWidth={2.5} />
                <Text
                  style={{
                    color: COLORS.steelSilver,
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {t("removeSet")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Exercise Navigation */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {currentExerciseIndex > 0 && (
              <TouchableOpacity
                onPress={() => setCurrentExerciseIndex((prev) => prev - 1)}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.ironGrey,
                  borderRadius: 14,
                  padding: 18,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 15,
                    letterSpacing: 0.5,
                  }}
                >
                  ← {t("previous")}
                </Text>
              </TouchableOpacity>
            )}

            {currentExerciseIndex < exercises.length - 1 && (
              <TouchableOpacity
                onPress={() => setCurrentExerciseIndex((prev) => prev + 1)}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.forgeOrange,
                  borderRadius: 14,
                  padding: 18,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: COLORS.moltenEmber,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 15,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("next")} →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Rest Timer Picker Modal */}
      <Modal
        visible={showTimerPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimerPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderRadius: 20,
              padding: 30,
              width: "100%",
              maxWidth: 400,
              borderWidth: 2,
              borderColor: COLORS.forgeOrange,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                justifyContent: "center",
              }}
            >
              <Timer color={COLORS.forgeOrange} size={24} strokeWidth={2.5} />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "900",
                  marginLeft: 10,
                  letterSpacing: 0.5,
                }}
              >
                {t("restTimer")}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[30, 60, 90, 120, 180, 240].map((secs) => (
                <TouchableOpacity
                  key={secs}
                  onPress={() => startRestTimer(secs)}
                  style={{
                    backgroundColor: COLORS.carbonBlack,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: COLORS.ironGrey,
                    minWidth: "30%",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: 18,
                    }}
                  >
                    {secs}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowTimerPicker(false)}
              style={{
                backgroundColor: COLORS.ironGrey,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: 15,
                  letterSpacing: 0.5,
                }}
              >
                {t("skip")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Active Rest Timer Overlay */}
      {isTimerActive && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 20,
            padding: 30,
            alignItems: "center",
            borderWidth: 3,
            borderColor: COLORS.forgeOrange,
            shadowColor: COLORS.forgeOrange,
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Text
            style={{
              color: COLORS.forgeOrange,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            {t("restTimer")}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 64,
              fontWeight: "900",
              letterSpacing: -2,
            }}
          >
            {timer}
          </Text>
          <TouchableOpacity
            onPress={skipRest}
            style={{
              marginTop: 20,
              backgroundColor: COLORS.ironGrey,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "800",
                fontSize: 14,
                letterSpacing: 0.5,
              }}
            >
              {t("skip")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Workout Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={handleCompletionClose}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderRadius: 24,
              padding: 40,
              width: "100%",
              maxWidth: 400,
              borderWidth: 3,
              borderColor: COLORS.gold,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: COLORS.gold + "33",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                borderWidth: 3,
                borderColor: COLORS.gold,
              }}
            >
              <Award
                color={COLORS.gold}
                size={48}
                strokeWidth={2.5}
                fill={COLORS.gold}
              />
            </View>

            <Text
              style={{
                color: COLORS.gold,
                fontSize: 28,
                fontWeight: "900",
                marginBottom: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {t("congratulations")}!
            </Text>

            <Text
              style={{
                color: COLORS.steelSilver,
                fontSize: 15,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 30,
                lineHeight: 22,
              }}
            >
              {t("workoutCompleteMessage")}
            </Text>

            <View
              style={{
                backgroundColor: COLORS.carbonBlack,
                borderRadius: 16,
                padding: 20,
                width: "100%",
                marginBottom: 30,
                borderWidth: 1,
                borderColor: COLORS.ironGrey,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Sparkles
                  color={COLORS.forgeOrange}
                  size={24}
                  strokeWidth={2.5}
                />
                <Text
                  style={{
                    color: COLORS.forgeOrange,
                    fontSize: 18,
                    fontWeight: "800",
                    marginLeft: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  +{xpEarned} {t("xp")}
                </Text>
              </View>

              {leveledUp && (
                <View
                  style={{
                    backgroundColor: COLORS.forgeOrange + "22",
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: COLORS.forgeOrange,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.forgeOrange,
                      fontSize: 16,
                      fontWeight: "900",
                      textAlign: "center",
                      letterSpacing: 0.5,
                    }}
                  >
                    🎉 {t("levelUp")} - {t("level")} {newLevel}!
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleCompletionClose}
              style={{
                backgroundColor: COLORS.forgeOrange,
                paddingVertical: 18,
                paddingHorizontal: 40,
                borderRadius: 14,
                width: "100%",
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.moltenEmber,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "900",
                  letterSpacing: 0.5,
                }}
              >
                {t("backToTraining")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingAnimatedView>
  );
}
