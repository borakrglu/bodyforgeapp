import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Dumbbell,
  Clock,
  Filter,
  Search,
  X,
  Star,
  TrendingUp,
  Target,
  Crown,
  Lock,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import useLanguage from "../utils/i18n";
import usePremium from "../utils/use-premium";

const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
  success: "#10b981",
  info: "#3b82f6",
  warning: "#f59e0b",
};

const SPLIT_TYPES = [
  { id: "full_body", label: "Full Body", value: "full_body" },
  { id: "upper_lower", label: "Upper/Lower", value: "upper_lower" },
  { id: "push_pull_legs", label: "Push/Pull/Legs", value: "push_pull_legs" },
  { id: "bro_split", label: "Bro Split", value: "bro_split" },
];

const GOALS = [
  { id: "muscle_gain", label: "Muscle Gain", value: "muscle_gain" },
  { id: "strength", label: "Strength", value: "strength" },
  { id: "fat_loss", label: "Fat Loss", value: "fat_loss" },
  { id: "recomp", label: "Recomposition", value: "recomp" },
];

export default function BrowseProgramsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isPremium } = usePremium();

  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedSplitType, setSelectedSplitType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPrograms();
  }, [language]);

  useEffect(() => {
    applyFilters();
  }, [programs, selectedLevel, selectedGoal, selectedSplitType, searchQuery]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const url = `/api/programs/browse?language=${language}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...programs];

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter((p) => p.level === selectedLevel);
    }

    // Goal filter
    if (selectedGoal) {
      filtered = filtered.filter((p) => p.goal === selectedGoal);
    }

    // Split type filter
    if (selectedSplitType) {
      filtered = filtered.filter((p) => p.splitType === selectedSplitType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    setFilteredPrograms(filtered);
  };

  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedGoal(null);
    setSelectedSplitType(null);
    setSearchQuery("");
  };

  const activeFiltersCount = [
    selectedLevel,
    selectedGoal,
    selectedSplitType,
  ].filter(Boolean).length;

  const getLevelBadgeColor = (level) => {
    if (level === "beginner") return COLORS.success;
    if (level === "intermediate") return COLORS.info;
    if (level === "advanced") return COLORS.warning;
    return COLORS.ironGrey;
  };

  const getLevelText = (level) => {
    if (level === "beginner") return t("beginner");
    if (level === "intermediate") return t("intermediate");
    if (level === "advanced") return t("advanced");
    return level;
  };

  const getGoalIcon = (goal) => {
    if (goal === "muscle_gain")
      return (
        <Dumbbell color={COLORS.forgeOrange} size={18} strokeWidth={2.5} />
      );
    if (goal === "strength")
      return (
        <TrendingUp color={COLORS.forgeOrange} size={18} strokeWidth={2.5} />
      );
    if (goal === "fat_loss")
      return <Target color={COLORS.forgeOrange} size={18} strokeWidth={2.5} />;
    return <Star color={COLORS.forgeOrange} size={18} strokeWidth={2.5} />;
  };

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: COLORS.forgedSteel,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              borderWidth: 1,
              borderColor: COLORS.ironGrey,
            }}
          >
            <ChevronLeft color="#fff" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {t("browsePrograms")}
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: COLORS.ironGrey,
          }}
        >
          <Search color={COLORS.steelSilver} size={20} strokeWidth={2.5} />
          <TextInput
            style={{
              flex: 1,
              color: "#fff",
              fontSize: 15,
              fontWeight: "600",
              marginLeft: 12,
            }}
            placeholder={t("searchPrograms")}
            placeholderTextColor={COLORS.steelSilver}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X color={COLORS.steelSilver} size={20} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.forgedSteel,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor:
                activeFiltersCount > 0 ? COLORS.forgeOrange : COLORS.ironGrey,
            }}
          >
            <Filter
              color={
                activeFiltersCount > 0 ? COLORS.forgeOrange : COLORS.steelSilver
              }
              size={18}
              strokeWidth={2.5}
            />
            <Text
              style={{
                color: activeFiltersCount > 0 ? COLORS.forgeOrange : "#fff",
                fontSize: 14,
                fontWeight: "800",
                marginLeft: 8,
                letterSpacing: 0.5,
              }}
            >
              {t("filters")}
              {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
            </Text>
          </TouchableOpacity>

          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={clearFilters}>
              <Text
                style={{
                  color: COLORS.steelSilver,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {t("clearFilters")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results Count */}
        <Text
          style={{
            color: COLORS.steelSilver,
            fontSize: 13,
            fontWeight: "600",
            marginTop: 12,
          }}
        >
          {filteredPrograms.length} {t("programsFound")}
        </Text>
      </View>

      {/* Programs List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {loading ? (
            <View style={{ marginTop: 60, alignItems: "center" }}>
              <ActivityIndicator color={COLORS.forgeOrange} size="large" />
              <Text
                style={{
                  color: COLORS.steelSilver,
                  marginTop: 16,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Loading programs...
              </Text>
            </View>
          ) : filteredPrograms.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: COLORS.forgedSteel,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                  borderWidth: 2,
                  borderColor: COLORS.ironGrey,
                }}
              >
                <Dumbbell color={COLORS.ironGrey} size={40} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 8,
                  letterSpacing: 0.3,
                }}
              >
                {t("noMatchingPrograms")}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.steelSilver,
                  textAlign: "center",
                  fontWeight: "500",
                  lineHeight: 20,
                }}
              >
                {t("tryAdjustingFilters")}
              </Text>
            </View>
          ) : (
            filteredPrograms.map((program, index) => {
              // Programs at index 5+ are premium-only
              const isPremiumProgram = index >= 5 || program.isPremium;

              const handleProgramPress = () => {
                if (isPremiumProgram && !isPremium) {
                  router.push("/premium");
                } else {
                  router.push(`/program/${program.id}`);
                }
              };

              return (
                <TouchableOpacity
                  key={program.id}
                  onPress={handleProgramPress}
                  style={{
                    backgroundColor: COLORS.forgedSteel,
                    borderRadius: 18,
                    padding: 18,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: isPremiumProgram && !isPremium ? "#FFD700" : COLORS.ironGrey,
                    borderLeftWidth: 4,
                    borderLeftColor: getLevelBadgeColor(program.level),
                  }}
                >
                  {/* Level Badge */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={{
                          backgroundColor: getLevelBadgeColor(program.level) + "22",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: getLevelBadgeColor(program.level),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "800",
                            color: getLevelBadgeColor(program.level),
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {getLevelText(program.level)}
                        </Text>
                      </View>

                      {/* Premium Crown Badge */}
                      {isPremiumProgram && (
                        <View
                          style={{
                            backgroundColor: "#FFD70022",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#FFD700",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Crown color="#FFD700" size={12} fill="#FFD700" />
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "800",
                              color: "#FFD700",
                              textTransform: "uppercase",
                            }}
                          >
                            PRO
                          </Text>
                        </View>
                      )}
                    </View>

                    {index < 3 && !isPremiumProgram && (
                      <View
                        style={{
                          backgroundColor: COLORS.forgeOrange + "22",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: COLORS.forgeOrange,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: COLORS.forgeOrange,
                            textTransform: "uppercase",
                          }}
                        >
                          {t("popular")}
                        </Text>
                      </View>
                    )}

                    {/* Lock icon for non-premium users */}
                    {isPremiumProgram && !isPremium && (
                      <Lock color="#FFD700" size={18} />
                    )}
                  </View>

                  {/* Title */}
                  <Text
                    style={{
                      fontSize: 19,
                      fontWeight: "900",
                      color: "#fff",
                      marginBottom: 10,
                      letterSpacing: 0.3,
                    }}
                  >
                    {program.title}
                  </Text>

                  {/* Description */}
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.steelSilver,
                      lineHeight: 21,
                      marginBottom: 16,
                      fontWeight: "500",
                    }}
                    numberOfLines={2}
                  >
                    {program.description}
                  </Text>

                  {/* Meta Info */}
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                  >
                    {/* Goal */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.carbonBlack,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                      }}
                    >
                      {getGoalIcon(program.goal)}
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.steelSilver,
                          marginLeft: 6,
                          fontWeight: "700",
                        }}
                      >
                        {program.goal.replace("_", " ")}
                      </Text>
                    </View>

                    {/* Frequency */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.carbonBlack,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                      }}
                    >
                      <Dumbbell
                        color={COLORS.steelSilver}
                        size={16}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.steelSilver,
                          marginLeft: 6,
                          fontWeight: "700",
                        }}
                      >
                        {program.frequencyDays}x/week
                      </Text>
                    </View>

                    {/* Duration */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.carbonBlack,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: COLORS.ironGrey,
                      }}
                    >
                      <Clock
                        color={COLORS.steelSilver}
                        size={16}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.steelSilver,
                          marginLeft: 6,
                          fontWeight: "700",
                        }}
                      >
                        {program.weeks} weeks
                      </Text>
                    </View>
                  </View>

                  {/* View Details Button */}
                  <TouchableOpacity
                    onPress={() => router.push(`/program/${program.id}`)}
                    style={{
                      marginTop: 16,
                      backgroundColor: COLORS.forgeOrange,
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: COLORS.moltenEmber,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: "900",
                        letterSpacing: 0.5,
                      }}
                    >
                      {t("viewDetails")}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.carbonBlack,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 24,
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 20,
              maxHeight: "80%",
              borderTopWidth: 3,
              borderTopColor: COLORS.forgeOrange,
            }}
          >
            {/* Modal Header */}
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
                  fontSize: 24,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                {t("filters")}
              </Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X color="#fff" size={28} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Level Filter */}
              <View style={{ marginBottom: 28 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: COLORS.forgeOrange,
                    marginBottom: 14,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {t("experience")}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {["beginner", "intermediate", "advanced"].map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() =>
                        setSelectedLevel(selectedLevel === level ? null : level)
                      }
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor:
                          selectedLevel === level
                            ? getLevelBadgeColor(level)
                            : COLORS.forgedSteel,
                        borderWidth: 1,
                        borderColor:
                          selectedLevel === level
                            ? getLevelBadgeColor(level)
                            : COLORS.ironGrey,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color:
                            selectedLevel === level
                              ? "#fff"
                              : COLORS.steelSilver,
                          letterSpacing: 0.3,
                        }}
                      >
                        {getLevelText(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Goal Filter */}
              <View style={{ marginBottom: 28 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: COLORS.forgeOrange,
                    marginBottom: 14,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {t("goal")}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {GOALS.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() =>
                        setSelectedGoal(
                          selectedGoal === goal.value ? null : goal.value,
                        )
                      }
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor:
                          selectedGoal === goal.value
                            ? COLORS.forgeOrange
                            : COLORS.forgedSteel,
                        borderWidth: 1,
                        borderColor:
                          selectedGoal === goal.value
                            ? COLORS.moltenEmber
                            : COLORS.ironGrey,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color:
                            selectedGoal === goal.value
                              ? "#fff"
                              : COLORS.steelSilver,
                          letterSpacing: 0.3,
                        }}
                      >
                        {goal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Split Type Filter */}
              <View style={{ marginBottom: 28 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: COLORS.forgeOrange,
                    marginBottom: 14,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {t("splitType")}
                </Text>
                <View style={{ gap: 10 }}>
                  {SPLIT_TYPES.map((split) => (
                    <TouchableOpacity
                      key={split.id}
                      onPress={() =>
                        setSelectedSplitType(
                          selectedSplitType === split.value
                            ? null
                            : split.value,
                        )
                      }
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor:
                          selectedSplitType === split.value
                            ? COLORS.forgeOrange
                            : COLORS.forgedSteel,
                        borderWidth: 1,
                        borderColor:
                          selectedSplitType === split.value
                            ? COLORS.moltenEmber
                            : COLORS.ironGrey,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color:
                            selectedSplitType === split.value
                              ? "#fff"
                              : COLORS.steelSilver,
                          letterSpacing: 0.3,
                        }}
                      >
                        {split.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Apply Filters Button */}
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{
                backgroundColor: COLORS.forgeOrange,
                borderRadius: 14,
                paddingVertical: 18,
                alignItems: "center",
                marginTop: 20,
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
                {t("applyFilters")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
