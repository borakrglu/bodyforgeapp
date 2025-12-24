import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  Calendar,
  X,
} from "lucide-react-native";
import { LineChart } from "react-native-graph";
import { useUser } from "../utils/auth/useUser";

export default function ProgressPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    weightKg: "",
    bodyFatPercentage: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/progress?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          weightKg: parseFloat(newEntry.weightKg) || null,
          bodyFatPercentage: parseFloat(newEntry.bodyFatPercentage) || null,
          notes: newEntry.notes || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setNewEntry({ weightKg: "", bodyFatPercentage: "", notes: "" });
        await loadProgress();
      }
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  const weightData = entries
    .filter((e) => e.weight_kg)
    .reverse()
    .map((e, i) => ({
      value: parseFloat(e.weight_kg),
      date: new Date(e.entry_date),
    }));

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

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff" }}>
            Progress Tracking
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 10,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {loading ? (
            <Text
              style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}
            >
              Loading...
            </Text>
          ) : entries.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <TrendingUp color="#3b82f6" size={48} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#fff",
                  marginTop: 16,
                }}
              >
                No Progress Yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Start tracking your progress to see your transformation
              </Text>
            </View>
          ) : (
            <>
              {/* Weight Chart */}
              {weightData.length > 1 && (
                <View
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: 16,
                    }}
                  >
                    Weight Progress
                  </Text>
                  <LineChart
                    points={weightData}
                    animated={true}
                    color="#3b82f6"
                    style={{ width: "100%", height: 200 }}
                    enablePanGesture={true}
                  />
                </View>
              )}

              {/* Entries List */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                All Entries
              </Text>

              {entries.map((entry, index) => (
                <View
                  key={entry.id}
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
                      marginBottom: 12,
                    }}
                  >
                    <Calendar color="#3b82f6" size={18} />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#fff",
                        marginLeft: 8,
                      }}
                    >
                      {new Date(entry.entry_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    {entry.weight_kg && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                          Weight
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#fff",
                          }}
                        >
                          {entry.weight_kg} kg
                        </Text>
                      </View>
                    )}
                    {entry.body_fat_percentage && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                          Body Fat
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#fff",
                          }}
                        >
                          {entry.body_fat_percentage}%
                        </Text>
                      </View>
                    )}
                    {entry.notes && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        "{entry.notes}"
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Entry Modal */}
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
              backgroundColor: "#1a1a1a",
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
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}>
                Add Progress Entry
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X color="#9ca3af" size={24} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16, marginBottom: 24 }}>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: 8,
                  }}
                >
                  Weight (kg)
                </Text>
                <TextInput
                  value={newEntry.weightKg}
                  onChangeText={(text) =>
                    setNewEntry({ ...newEntry, weightKg: text })
                  }
                  placeholder="e.g. 75.5"
                  placeholderTextColor="#6b7280"
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                  }}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: 8,
                  }}
                >
                  Body Fat % (optional)
                </Text>
                <TextInput
                  value={newEntry.bodyFatPercentage}
                  onChangeText={(text) =>
                    setNewEntry({ ...newEntry, bodyFatPercentage: text })
                  }
                  placeholder="e.g. 15.5"
                  placeholderTextColor="#6b7280"
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                  }}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: 8,
                  }}
                >
                  Notes (optional)
                </Text>
                <TextInput
                  value={newEntry.notes}
                  onChangeText={(text) =>
                    setNewEntry({ ...newEntry, notes: text })
                  }
                  placeholder="How are you feeling?"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#0a0a0a",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                    textAlignVertical: "top",
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddEntry}
              style={{
                backgroundColor: "#3b82f6",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                Save Entry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
