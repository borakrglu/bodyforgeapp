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
  Pill,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react-native";
import { useUser } from "../../../utils/auth/useUser";

export default function SupplementPlanDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, loading: userLoading } = useUser();
  const [supplementPlan, setSupplementPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSupplementPlan();
    }
  }, [user]);

  const loadSupplementPlan = async () => {
    try {
      const response = await fetch(
        `/api/programs/user/${user.id}?type=supplement`,
      );

      if (response.ok) {
        const data = await response.json();
        const found = data.programs.find((p) => p.id.toString() === id);
        if (found) {
          setSupplementPlan(found);
        }
      }
    } catch (error) {
      console.error("Error loading supplement plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading || !supplementPlan) {
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

  const content = supplementPlan.content;

  const getPriorityColor = (priority) => {
    if (priority.toLowerCase().includes("essential")) return "#10b981";
    if (priority.toLowerCase().includes("recommended")) return "#f59e0b";
    return "#6b7280";
  };

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
          {content.stack_name}
        </Text>
        <Text style={{ fontSize: 15, color: "#9ca3af" }}>
          {content.supplements.length} supplements
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Warning */}
          <View
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.3)",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <AlertTriangle color="#ef4444" size={20} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#ef4444",
                  marginLeft: 8,
                }}
              >
                Important Warning
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: "#9ca3af", lineHeight: 18 }}>
              {content.general_warnings}
            </Text>
          </View>

          {/* Monthly cost */}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <DollarSign color="#f59e0b" size={20} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  marginLeft: 8,
                }}
              >
                Estimated Monthly Cost
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                Basic: {content.estimated_monthly_cost.basic}
              </Text>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                Intermediate: {content.estimated_monthly_cost.intermediate}
              </Text>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                Advanced: {content.estimated_monthly_cost.advanced}
              </Text>
            </View>
          </View>

          {/* Daily schedule */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Daily Schedule
          </Text>

          {content.daily_schedule.map((schedule, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Clock color="#f59e0b" size={18} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                    marginLeft: 8,
                  }}
                >
                  {schedule.time}
                </Text>
              </View>
              {schedule.supplements_to_take.map((supp, suppIndex) => (
                <Text
                  key={suppIndex}
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    marginLeft: 26,
                    marginBottom: 2,
                  }}
                >
                  • {supp}
                </Text>
              ))}
              {schedule.notes && (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    marginLeft: 26,
                    marginTop: 6,
                    fontStyle: "italic",
                  }}
                >
                  💡 {schedule.notes}
                </Text>
              )}
            </View>
          ))}

          {/* Supplements detail */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#fff",
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            Supplement Details
          </Text>

          {content.supplements.map((supplement, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Pill color={getPriorityColor(supplement.priority)} size={20} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    {supplement.name}
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          getPriorityColor(supplement.priority) + "20",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: getPriorityColor(supplement.priority),
                          textTransform: "uppercase",
                        }}
                      >
                        {supplement.priority}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#0a0a0a",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        {supplement.budget_tier}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    Dosage
                  </Text>
                  <Text style={{ fontSize: 14, color: "#e5e7eb" }}>
                    {supplement.dosage}
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    Timing
                  </Text>
                  <Text style={{ fontSize: 14, color: "#e5e7eb" }}>
                    {supplement.timing}
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    Benefits
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#e5e7eb", lineHeight: 20 }}
                  >
                    {supplement.benefits}
                  </Text>
                </View>

                {supplement.warnings && (
                  <View
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#ef4444",
                        marginBottom: 4,
                      }}
                    >
                      ⚠️ Warnings
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#9ca3af", lineHeight: 16 }}
                    >
                      {supplement.warnings}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Cycling recommendations */}
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
              Cycling Recommendations
            </Text>
            <Text style={{ fontSize: 14, color: "#9ca3af", lineHeight: 20 }}>
              {content.cycling_recommendations}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
