import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Dumbbell,
  Clock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import useLanguage from "../../utils/i18n";

export default function ProgramDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, language } = useLanguage();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgram();
  }, [id, language]);

  const loadProgram = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/programs/${id}?language=${language}`);
      if (response.ok) {
        const data = await response.json();
        setProgram(data.program);
      }
    } catch (error) {
      console.error("Error loading program:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeColor = (level) => {
    if (level === "beginner") return "#10b981";
    if (level === "intermediate") return "#3b82f6";
    if (level === "advanced") return "#f59e0b";
    return "#6b7280";
  };

  const getLevelText = (level) => {
    if (level === "beginner") return t("beginner");
    if (level === "intermediate") return t("intermediate");
    if (level === "advanced") return t("advanced");
    return level;
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#9ca3af" }}>
          {language === "tr" ? "Yükleniyor..." : "Loading..."}
        </Text>
      </View>
    );
  }

  if (!program) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#9ca3af" }}>
          {language === "tr" ? "Program bulunamadı" : "Program not found"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#000",
          borderBottomWidth: 1,
          borderBottomColor: "#1a1a1a",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#1a1a1a",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: getLevelBadgeColor(program.level),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            alignSelf: "flex-start",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {getLevelText(program.level)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {program.title}
        </Text>

        <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Dumbbell color="#6b7280" size={18} />
            <Text style={{ fontSize: 14, color: "#9ca3af", marginLeft: 6 }}>
              {program.frequencyDays}{" "}
              {language === "tr" ? "gün/hafta" : "days/week"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock color="#6b7280" size={18} />
            <Text style={{ fontSize: 14, color: "#9ca3af", marginLeft: 6 }}>
              {program.weeks} {language === "tr" ? "hafta" : "weeks"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Description */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              {language === "tr" ? "Açıklama" : "Description"}
            </Text>
            <Text style={{ fontSize: 15, color: "#9ca3af", lineHeight: 22 }}>
              {program.description}
            </Text>
          </View>

          {/* Equipment */}
          {program.equipment && program.equipment.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                {language === "tr" ? "Gerekli Ekipman" : "Required Equipment"}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {program.equipment.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#1a1a1a",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#9ca3af" }}>
                      {item.replace(/_/g, " ")}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Training Days */}
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              {language === "tr" ? "Antrenman Günleri" : "Training Days"}
            </Text>

            {program.days &&
              program.days.map((day, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 16,
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
                    <View
                      style={{
                        backgroundColor: "#3b82f6",
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {day.dayIndex}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#fff",
                        flex: 1,
                      }}
                    >
                      {day.dayName}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      color: "#9ca3af",
                      lineHeight: 20,
                      marginLeft: 44,
                    }}
                  >
                    {day.focus}
                  </Text>

                  {day.exercises && day.exercises.length > 0 && (
                    <View style={{ marginTop: 12, marginLeft: 44 }}>
                      {day.exercises.map((exercise, exIndex) => (
                        <View
                          key={exIndex}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 8,
                          }}
                        >
                          <CheckCircle2 color="#10b981" size={16} />
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#fff",
                              marginLeft: 8,
                            }}
                          >
                            {exercise}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={() => {
              // TODO: Implement program activation
              alert(
                language === "tr" ? "Program başlatıldı!" : "Program started!",
              );
            }}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#fff" }}>
              {language === "tr" ? "Programı Başlat" : "Start Program"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
