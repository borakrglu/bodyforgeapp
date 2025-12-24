import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Ruler,
  TrendingUp,
  Calendar,
  X,
} from "lucide-react-native";
import { LineGraph } from "react-native-graph";
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
};

const { width } = Dimensions.get("window");
const graphWidth = width - 40;

export default function BodyMeasurementsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();

  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    arms: "",
    chest: "",
    waist: "",
    legs: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    try {
      const response = await fetch(`/api/progress?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const measurementData = data.entries
          .filter(
            (e) =>
              e.measurement_arms_cm ||
              e.measurement_chest_cm ||
              e.measurement_waist_cm ||
              e.measurement_legs_cm,
          )
          .map((e) => ({
            id: e.id,
            date: e.entry_date,
            arms: e.measurement_arms_cm,
            chest: e.measurement_chest_cm,
            waist: e.measurement_waist_cm,
            legs: e.measurement_legs_cm,
            notes: e.notes,
          }))
          .reverse(); // Newest first
        setMeasurements(measurementData);
      }
    } catch (error) {
      console.error("Error loading measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = async () => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          measurementArmsCm: parseFloat(newMeasurement.arms) || null,
          measurementChestCm: parseFloat(newMeasurement.chest) || null,
          measurementWaistCm: parseFloat(newMeasurement.waist) || null,
          measurementLegsCm: parseFloat(newMeasurement.legs) || null,
          notes: newMeasurement.notes || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setNewMeasurement({
          arms: "",
          chest: "",
          waist: "",
          legs: "",
          notes: "",
        });
        await loadMeasurements();
      }
    } catch (error) {
      console.error("Error adding measurement:", error);
    }
  };

  const getChartData = (field) => {
    return measurements
      .filter((m) => m[field])
      .reverse()
      .map((m) => ({
        value: parseFloat(m[field]),
        date: new Date(m.date),
      }));
  };

  const getLatestMeasurement = (field) => {
    const latest = measurements.find((m) => m[field]);
    return latest ? parseFloat(latest[field]) : null;
  };

  const getChange = (field) => {
    const data = measurements.filter((m) => m[field]).reverse();
    if (data.length < 2) return null;
    const latest = parseFloat(data[0][field]);
    const oldest = parseFloat(data[data.length - 1][field]);
    return (latest - oldest).toFixed(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const measurementTypes = [
    {
      key: "arms",
      label: t("arms"),
      icon: "💪",
      color: "#3b82f6",
    },
    {
      key: "chest",
      label: t("chest"),
      icon: "🫁",
      color: "#10b981",
    },
    {
      key: "waist",
      label: t("waist"),
      icon: "⚖️",
      color: "#f59e0b",
    },
    {
      key: "legs",
      label: t("legs"),
      icon: "🦵",
      color: "#8b5cf6",
    },
  ];

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
              BODY MEASUREMENTS
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
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: COLORS.forgeOrange,
              borderRadius: 12,
              width: 48,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.moltenEmber,
            }}
          >
            <Plus color="#fff" size={24} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
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
                Loading Measurements...
              </Text>
            </View>
          ) : measurements.length === 0 ? (
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
                <Ruler color={COLORS.forgeOrange} size={48} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  No Measurements Yet
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
                  Start tracking your body measurements to monitor your progress
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModal(true)}
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
                    Add First Measurement
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Latest Measurements Cards */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 16,
                  letterSpacing: 0.5,
                }}
              >
                CURRENT STATS
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {measurementTypes.map((type) => {
                  const latest = getLatestMeasurement(type.key);
                  const change = getChange(type.key);
                  return (
                    <View
                      key={type.key}
                      style={{
                        width: (width - 52) / 2,
                        backgroundColor: COLORS.forgedSteel,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                        borderTopWidth: 3,
                        borderTopColor: type.color,
                      }}
                    >
                      <Text style={{ fontSize: 28, marginBottom: 8 }}>
                        {type.icon}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.steelSilver,
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        {type.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "900",
                          color: "#fff",
                          letterSpacing: -0.5,
                        }}
                      >
                        {latest || "-"}
                        {latest && (
                          <Text
                            style={{
                              fontSize: 16,
                              color: COLORS.steelSilver,
                              fontWeight: "600",
                            }}
                          >
                            {" cm"}
                          </Text>
                        )}
                      </Text>
                      {change && (
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: change >= 0 ? "#10b981" : "#ef4444",
                            marginTop: 4,
                          }}
                        >
                          {change >= 0 ? "+" : ""}
                          {change} cm
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Charts */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 16,
                  letterSpacing: 0.5,
                }}
              >
                PROGRESS TRENDS
              </Text>

              {measurementTypes.map((type) => {
                const chartData = getChartData(type.key);
                if (chartData.length < 2) return null;

                return (
                  <View
                    key={type.key}
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 20,
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Text style={{ fontSize: 24, marginRight: 10 }}>
                        {type.icon}
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "800",
                          color: "#fff",
                          letterSpacing: 0.3,
                        }}
                      >
                        {type.label}
                      </Text>
                    </View>
                    <LineGraph
                      points={chartData}
                      animated={true}
                      color={type.color}
                      style={{ width: "100%", height: 180 }}
                      enablePanGesture={true}
                      gradientFillColors={[
                        `${type.color}33`,
                        `${type.color}00`,
                      ]}
                    />
                  </View>
                );
              })}

              {/* Measurement History */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 16,
                  marginTop: 8,
                  letterSpacing: 0.5,
                }}
              >
                HISTORY
              </Text>

              {measurements.map((measurement) => (
                <View
                  key={measurement.id}
                  style={{
                    backgroundColor: COLORS.forgedSteel,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: COLORS.ironGrey,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Calendar color={COLORS.forgeOrange} size={18} />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#fff",
                        marginLeft: 8,
                      }}
                    >
                      {formatDate(measurement.date)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    {measurement.arms && (
                      <View
                        style={{
                          backgroundColor: COLORS.ironGrey,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.steelSilver,
                            fontWeight: "600",
                          }}
                        >
                          💪 Arms
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "800",
                            color: "#fff",
                            marginTop: 2,
                          }}
                        >
                          {measurement.arms} cm
                        </Text>
                      </View>
                    )}

                    {measurement.chest && (
                      <View
                        style={{
                          backgroundColor: COLORS.ironGrey,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.steelSilver,
                            fontWeight: "600",
                          }}
                        >
                          🫁 Chest
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "800",
                            color: "#fff",
                            marginTop: 2,
                          }}
                        >
                          {measurement.chest} cm
                        </Text>
                      </View>
                    )}

                    {measurement.waist && (
                      <View
                        style={{
                          backgroundColor: COLORS.ironGrey,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.steelSilver,
                            fontWeight: "600",
                          }}
                        >
                          ⚖️ Waist
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "800",
                            color: "#fff",
                            marginTop: 2,
                          }}
                        >
                          {measurement.waist} cm
                        </Text>
                      </View>
                    )}

                    {measurement.legs && (
                      <View
                        style={{
                          backgroundColor: COLORS.ironGrey,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.steelSilver,
                            fontWeight: "600",
                          }}
                        >
                          🦵 Legs
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "800",
                            color: "#fff",
                            marginTop: 2,
                          }}
                        >
                          {measurement.legs} cm
                        </Text>
                      </View>
                    )}
                  </View>

                  {measurement.notes && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: COLORS.steelSilver,
                        marginTop: 12,
                        fontStyle: "italic",
                        fontWeight: "600",
                      }}
                    >
                      "{measurement.notes}"
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Measurement Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.forgedSteel,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                ADD MEASUREMENTS
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X color={COLORS.steelSilver} size={28} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 500 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: 16, marginBottom: 24 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginBottom: 8,
                    }}
                  >
                    💪 Arms (cm)
                  </Text>
                  <TextInput
                    value={newMeasurement.arms}
                    onChangeText={(text) =>
                      setNewMeasurement({ ...newMeasurement, arms: text })
                    }
                    placeholder="e.g. 38.5"
                    placeholderTextColor="#6b7280"
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: COLORS.carbonBlack,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      fontWeight: "600",
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginBottom: 8,
                    }}
                  >
                    🫁 Chest (cm)
                  </Text>
                  <TextInput
                    value={newMeasurement.chest}
                    onChangeText={(text) =>
                      setNewMeasurement({ ...newMeasurement, chest: text })
                    }
                    placeholder="e.g. 102.5"
                    placeholderTextColor="#6b7280"
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: COLORS.carbonBlack,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      fontWeight: "600",
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginBottom: 8,
                    }}
                  >
                    ⚖️ Waist (cm)
                  </Text>
                  <TextInput
                    value={newMeasurement.waist}
                    onChangeText={(text) =>
                      setNewMeasurement({ ...newMeasurement, waist: text })
                    }
                    placeholder="e.g. 82.0"
                    placeholderTextColor="#6b7280"
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: COLORS.carbonBlack,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      fontWeight: "600",
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginBottom: 8,
                    }}
                  >
                    🦵 Legs (cm)
                  </Text>
                  <TextInput
                    value={newMeasurement.legs}
                    onChangeText={(text) =>
                      setNewMeasurement({ ...newMeasurement, legs: text })
                    }
                    placeholder="e.g. 58.0"
                    placeholderTextColor="#6b7280"
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: COLORS.carbonBlack,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      fontWeight: "600",
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: COLORS.steelSilver,
                      marginBottom: 8,
                    }}
                  >
                    📝 Notes (optional)
                  </Text>
                  <TextInput
                    value={newMeasurement.notes}
                    onChangeText={(text) =>
                      setNewMeasurement({ ...newMeasurement, notes: text })
                    }
                    placeholder="Any observations?"
                    placeholderTextColor="#6b7280"
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: COLORS.carbonBlack,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: COLORS.ironGrey,
                      textAlignVertical: "top",
                      fontWeight: "600",
                    }}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleAddMeasurement}
              style={{
                backgroundColor: COLORS.forgeOrange,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
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
                SAVE MEASUREMENTS
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
