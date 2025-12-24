import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Apple,
  Flame,
  Pizza,
  RefreshCw,
  Plus,
  Check,
  Circle,
  X,
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
  greenAccent: "#10b981",
  greenDark: "#059669",
};

export default function NutritionPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  // Tracking state
  const [loggedMeals, setLoggedMeals] = useState({});
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [consumedMacros, setConsumedMacros] = useState({
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadMealPlan(user.id);
      loadDailyProgress();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadMealPlan = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/programs/user/${id}?type=meal`);
      if (response.ok) {
        const data = await response.json();
        if (data.programs && data.programs.length > 0) {
          setMealPlan(data.programs[0]);
        }
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyProgress = () => {
    // Load from local storage or API
    // For now, using local state
    const today = new Date().toDateString();
    const stored = global.nutritionTracking?.[today];
    if (stored) {
      setLoggedMeals(stored.loggedMeals || {});
      setConsumedCalories(stored.consumedCalories || 0);
      setConsumedMacros(
        stored.consumedMacros || { protein: 0, carbs: 0, fats: 0 },
      );
    }
  };

  const saveDailyProgress = (meals, calories, macros) => {
    const today = new Date().toDateString();
    if (!global.nutritionTracking) global.nutritionTracking = {};
    global.nutritionTracking[today] = {
      loggedMeals: meals,
      consumedCalories: calories,
      consumedMacros: macros,
    };
  };

  const handleRegenerate = async () => {
    if (!user?.id) return;
    setRegenerating(true);
    try {
      const response = await fetch("/api/programs/generate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        await loadMealPlan(user.id);
      }
    } catch (error) {
      console.error("Error regenerating meal plan:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const toggleMealLogged = (mealIndex, meal) => {
    const newLoggedMeals = { ...loggedMeals };
    const isCurrentlyLogged = newLoggedMeals[mealIndex];

    if (isCurrentlyLogged) {
      delete newLoggedMeals[mealIndex];
      const newCalories = consumedCalories - meal.calories;
      const newMacros = {
        protein: consumedMacros.protein - meal.protein_g,
        carbs: consumedMacros.carbs - meal.carbs_g,
        fats: consumedMacros.fats - meal.fats_g,
      };
      setConsumedCalories(newCalories);
      setConsumedMacros(newMacros);
      setLoggedMeals(newLoggedMeals);
      saveDailyProgress(newLoggedMeals, newCalories, newMacros);
    } else {
      newLoggedMeals[mealIndex] = true;
      const newCalories = consumedCalories + meal.calories;
      const newMacros = {
        protein: consumedMacros.protein + meal.protein_g,
        carbs: consumedMacros.carbs + meal.carbs_g,
        fats: consumedMacros.fats + meal.fats_g,
      };
      setConsumedCalories(newCalories);
      setConsumedMacros(newMacros);
      setLoggedMeals(newLoggedMeals);
      saveDailyProgress(newLoggedMeals, newCalories, newMacros);
    }
  };

  const handleQuickAdd = () => {
    const calories = parseInt(quickAddData.calories) || 0;
    const protein = parseInt(quickAddData.protein) || 0;
    const carbs = parseInt(quickAddData.carbs) || 0;
    const fats = parseInt(quickAddData.fats) || 0;

    const newCalories = consumedCalories + calories;
    const newMacros = {
      protein: consumedMacros.protein + protein,
      carbs: consumedMacros.carbs + carbs,
      fats: consumedMacros.fats + fats,
    };

    setConsumedCalories(newCalories);
    setConsumedMacros(newMacros);
    saveDailyProgress(loggedMeals, newCalories, newMacros);

    setQuickAddData({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });
    setShowQuickAdd(false);
  };

  const goalCalories = mealPlan?.content?.daily_calories || 2500;
  const goalMacros = mealPlan?.content?.macros || {
    protein_g: 180,
    carbs_g: 250,
    fats_g: 70,
  };
  const caloriesRemaining = Math.max(0, goalCalories - consumedCalories);
  const calorieProgress = Math.min(
    100,
    (consumedCalories / goalCalories) * 100,
  );

  const MacroBar = ({ label, consumed, goal, color }) => {
    const progress = Math.min(100, (consumed / goal) * 100);
    return (
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: COLORS.steelSilver,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
            {Math.round(consumed)}g / {goal}g
          </Text>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: COLORS.ironGrey,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: color,
              borderRadius: 4,
            }}
          />
        </View>
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
              backgroundColor: COLORS.greenAccent,
              borderRadius: 12,
              padding: 10,
              marginRight: 14,
              borderWidth: 1,
              borderColor: COLORS.greenDark,
            }}
          >
            <Apple color="#fff" size={26} strokeWidth={2.5} />
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
            {t("nutrition")}
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: COLORS.greenAccent,
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
          ) : mealPlan ? (
            <>
              {/* Daily Calorie Counter */}
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 2,
                  borderColor: COLORS.greenAccent,
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
                    <Flame
                      color={COLORS.greenAccent}
                      size={24}
                      fill={COLORS.greenAccent}
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
                      {t("dailyCalories")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowQuickAdd(true)}
                    style={{
                      backgroundColor: COLORS.greenAccent,
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <Plus color="#fff" size={20} strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 48,
                      fontWeight: "900",
                      color: COLORS.greenAccent,
                      letterSpacing: -1,
                    }}
                  >
                    {consumedCalories}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginTop: -4,
                    }}
                  >
                    {t("consumed")} / {goalCalories} {t("goal_cal")}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View
                  style={{
                    height: 12,
                    backgroundColor: COLORS.ironGrey,
                    borderRadius: 6,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: `${calorieProgress}%`,
                      height: "100%",
                      backgroundColor: COLORS.greenAccent,
                      borderRadius: 6,
                    }}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  {caloriesRemaining} {t("remaining")}
                </Text>
              </View>

              {/* Macros */}
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: 16,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {t("macros")}
                </Text>
                <MacroBar
                  label={t("protein")}
                  consumed={consumedMacros.protein}
                  goal={goalMacros.protein_g}
                  color="#3b82f6"
                />
                <MacroBar
                  label={t("carbs")}
                  consumed={consumedMacros.carbs}
                  goal={goalMacros.carbs_g}
                  color="#f59e0b"
                />
                <MacroBar
                  label={t("fats")}
                  consumed={consumedMacros.fats}
                  goal={goalMacros.fats_g}
                  color="#ef4444"
                />
              </View>

              {/* Today's Meals */}
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
                  {t("todaysMeals") || "Today's Meals"}
                </Text>
                <TouchableOpacity
                  onPress={handleRegenerate}
                  disabled={regenerating}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: COLORS.forgedSteel,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: COLORS.ironGrey,
                  }}
                >
                  <RefreshCw
                    color={COLORS.greenAccent}
                    size={14}
                    strokeWidth={2.5}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: COLORS.greenAccent,
                      letterSpacing: 0.3,
                    }}
                  >
                    {regenerating
                      ? language === "tr"
                        ? "Yenileniyor..."
                        : "New Plan"
                      : language === "tr"
                        ? "Yenile"
                        : "New"}
                  </Text>
                </TouchableOpacity>
              </View>

              {mealPlan.content.weekly_plan[0]?.meals.map((meal, index) => {
                const isLogged = loggedMeals[index];
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleMealLogged(index, meal)}
                    style={{
                      backgroundColor: isLogged
                        ? COLORS.greenAccent + "20"
                        : COLORS.forgedSteel,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      borderColor: isLogged
                        ? COLORS.greenAccent
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
                        borderColor: isLogged
                          ? COLORS.greenAccent
                          : COLORS.steelSilver,
                        backgroundColor: isLogged
                          ? COLORS.greenAccent
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      {isLogged && (
                        <Check color="#fff" size={18} strokeWidth={3} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Pizza
                          color={
                            isLogged ? COLORS.greenAccent : COLORS.steelSilver
                          }
                          size={16}
                          strokeWidth={2.5}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: isLogged
                              ? COLORS.greenAccent
                              : COLORS.steelSilver,
                            marginLeft: 6,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          {meal.meal_type}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: "#fff",
                          marginBottom: 4,
                          letterSpacing: 0.3,
                          textDecorationLine: isLogged
                            ? "line-through"
                            : "none",
                          opacity: isLogged ? 0.7 : 1,
                        }}
                      >
                        {meal.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.steelSilver,
                          fontWeight: "600",
                        }}
                      >
                        {meal.calories} cal • {meal.protein_g}g P •{" "}
                        {meal.carbs_g}g C • {meal.fats_g}g F
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* View Full Meal Plan */}
              <TouchableOpacity
                onPress={() => router.push(`/programs/meal/${mealPlan.id}`)}
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 16,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: COLORS.greenAccent,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: COLORS.greenAccent,
                    textAlign: "center",
                    letterSpacing: 0.5,
                  }}
                >
                  View Full 7-Day Meal Plan
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
                  borderTopColor: COLORS.greenAccent,
                  alignItems: "center",
                }}
              >
                <Apple color={COLORS.greenAccent} size={48} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("noMealPlanYet") || "No Meal Plan Yet"}
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
                  {t("createMealPlanToStart") ||
                    "Create your personalized meal plan to get started"}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/onboarding/questionnaire")}
                  style={{
                    backgroundColor: COLORS.greenAccent,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: COLORS.greenDark,
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
                    {t("generateNewMealPlan")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quick Add Modal */}
      <Modal visible={showQuickAdd} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
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
                Quick Add Food
              </Text>
              <TouchableOpacity onPress={() => setShowQuickAdd(false)}>
                <X color={COLORS.steelSilver} size={24} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Food Name"
              placeholderTextColor={COLORS.steelSilver}
              value={quickAddData.name}
              onChangeText={(text) =>
                setQuickAddData({ ...quickAddData, name: text })
              }
              style={{
                backgroundColor: COLORS.carbonBlack,
                borderRadius: 12,
                padding: 14,
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.ironGrey,
              }}
            />

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <TextInput
                placeholder="Calories"
                placeholderTextColor={COLORS.steelSilver}
                value={quickAddData.calories}
                onChangeText={(text) =>
                  setQuickAddData({ ...quickAddData, calories: text })
                }
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              />
              <TextInput
                placeholder="Protein (g)"
                placeholderTextColor={COLORS.steelSilver}
                value={quickAddData.protein}
                onChangeText={(text) =>
                  setQuickAddData({ ...quickAddData, protein: text })
                }
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <TextInput
                placeholder="Carbs (g)"
                placeholderTextColor={COLORS.steelSilver}
                value={quickAddData.carbs}
                onChangeText={(text) =>
                  setQuickAddData({ ...quickAddData, carbs: text })
                }
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              />
              <TextInput
                placeholder="Fats (g)"
                placeholderTextColor={COLORS.steelSilver}
                value={quickAddData.fats}
                onChangeText={(text) =>
                  setQuickAddData({ ...quickAddData, fats: text })
                }
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: COLORS.carbonBlack,
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  borderWidth: 1,
                  borderColor: COLORS.ironGrey,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleQuickAdd}
              style={{
                backgroundColor: COLORS.greenAccent,
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.greenDark,
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
                Add to Today
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
