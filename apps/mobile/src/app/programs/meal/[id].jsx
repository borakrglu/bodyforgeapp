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
  UtensilsCrossed,
  Clock,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useUser } from "../../../utils/auth/useUser";

export default function MealPlanDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, loading: userLoading } = useUser();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(0);
  const [showGroceryList, setShowGroceryList] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMealPlan();
    }
  }, [user]);

  const loadMealPlan = async () => {
    try {
      const response = await fetch(`/api/programs/user/${user.id}?type=meal`);

      if (response.ok) {
        const data = await response.json();
        const found = data.programs.find((p) => p.id.toString() === id);
        if (found) {
          setMealPlan(found);
        }
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading || !mealPlan) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        {userLoading || loading ? (
          <ActivityIndicator color="#FF6A1A" size="large" />
        ) : (
          <Text style={{ color: "#9ca3af" }}>Not found</Text>
        )}
      </View>
    );
  }

  const content = mealPlan.content;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#000",
          borderBottomWidth: 1,
          borderBottomColor: "#1a1a1a",
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
            fontSize: 24,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Your Meal Plan
        </Text>
        <Text style={{ fontSize: 15, color: "#9ca3af" }}>
          {content.daily_calories} cal/day
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Macros */}
          <View
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(16, 185, 129, 0.3)",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#10b981",
                marginBottom: 12,
              }}
            >
              Daily Macros
            </Text>
            <View style={{ flexDirection: "row", gap: 24 }}>
              <View>
                <Text
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}
                >
                  Protein
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                >
                  {content.macros.protein_g}g
                </Text>
              </View>
              <View>
                <Text
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}
                >
                  Carbs
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                >
                  {content.macros.carbs_g}g
                </Text>
              </View>
              <View>
                <Text
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}
                >
                  Fats
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                >
                  {content.macros.fats_g}g
                </Text>
              </View>
            </View>
          </View>

          {/* Grocery list toggle */}
          <TouchableOpacity
            onPress={() => setShowGroceryList(!showGroceryList)}
            style={{
              backgroundColor: "#10b981",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <ShoppingCart color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
              {showGroceryList ? "Hide" : "View"} Grocery List
            </Text>
          </TouchableOpacity>

          {showGroceryList && (
            <View
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            >
              {content.grocery_list.map((category, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom:
                      index < content.grocery_list.length - 1 ? 16 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#10b981",
                      marginBottom: 8,
                    }}
                  >
                    {category.category}
                  </Text>
                  {category.items.map((item, itemIndex) => (
                    <Text
                      key={itemIndex}
                      style={{
                        fontSize: 14,
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      • {item}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Weekly plan */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            7-Day Plan
          </Text>

          {content.weekly_plan.map((day, dayIndex) => (
            <View
              key={dayIndex}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#2a2a2a",
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setExpandedDay(expandedDay === dayIndex ? null : dayIndex)
                }
                style={{
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}
                >
                  {day.day}
                </Text>
                {expandedDay === dayIndex ? (
                  <ChevronUp color="#10b981" size={24} />
                ) : (
                  <ChevronDown color="#6b7280" size={24} />
                )}
              </TouchableOpacity>

              {expandedDay === dayIndex && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                  {day.meals.map((meal, mealIndex) => (
                    <View
                      key={mealIndex}
                      style={{
                        backgroundColor: "#0a0a0a",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <UtensilsCrossed color="#10b981" size={16} />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#10b981",
                            marginLeft: 6,
                            textTransform: "uppercase",
                          }}
                        >
                          {meal.meal_type}
                        </Text>
                        <View style={{ flex: 1 }} />
                        <Clock color="#6b7280" size={14} />
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginLeft: 4,
                          }}
                        >
                          {meal.prep_time_minutes} min
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#fff",
                          marginBottom: 8,
                        }}
                      >
                        {meal.name}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#1a1a1a",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                            {meal.calories} cal
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: "#1a1a1a",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                            P: {meal.protein_g}g
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: "#1a1a1a",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                            C: {meal.carbs_g}g
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: "#1a1a1a",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                            F: {meal.fats_g}g
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        Ingredients:
                      </Text>
                      {meal.ingredients.map((ing, ingIndex) => (
                        <Text
                          key={ingIndex}
                          style={{
                            fontSize: 13,
                            color: "#6b7280",
                            marginLeft: 8,
                            marginBottom: 2,
                          }}
                        >
                          • {ing.item}: {ing.amount}
                        </Text>
                      ))}

                      {meal.instructions && (
                        <>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#9ca3af",
                              marginTop: 8,
                              marginBottom: 4,
                            }}
                          >
                            Instructions:
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#6b7280",
                              lineHeight: 18,
                            }}
                          >
                            {meal.instructions}
                          </Text>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Meal prep tips */}
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#2a2a2a",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 8,
              }}
            >
              Meal Prep Tips
            </Text>
            <Text style={{ fontSize: 14, color: "#9ca3af", lineHeight: 20 }}>
              {content.meal_prep_tips}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
