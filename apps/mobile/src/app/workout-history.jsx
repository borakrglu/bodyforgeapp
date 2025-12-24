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
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Dumbbell,
  Calendar,
  RotateCcw,
} from "lucide-react-native";
import { useAuth } from "../utils/auth/useAuth";
import useLanguage from "../utils/i18n";
import { format, parseISO } from "date-fns";

const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
};

export default function WorkoutHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [filter, setFilter] = useState("all");
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && auth?.user?.id) {
      fetchWorkoutHistory();
    } else {
      setLoading(false);
    }
  }, [filter, isAuthenticated, auth?.user?.id]);

  const fetchWorkoutHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/workout-logs/history?filter=${filter}`,
      );
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
        setStats(
          data.stats || { totalWorkouts: 0, totalVolume: 0, avgDuration: 0 },
        );
      }
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatWorkout = (workout) => {
    // Navigate to active workout with this workout's data pre-filled
    router.push({
      pathname: "/workout/active",
      params: {
        workoutName: workout.workout_name,
        exercises: JSON.stringify(workout.exercises),
      },
    });
  };

  const FilterTab = ({ label, value }) => {
    const isActive = filter === value;
    return (
      <TouchableOpacity
        onPress={() => setFilter(value)}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 12,
          backgroundColor: isActive ? COLORS.forgeOrange : COLORS.forgedSteel,
          borderWidth: 1,
          borderColor: isActive ? COLORS.forgeOrange : COLORS.ironGrey,
        }}
      >
        <Text
          style={{
            color: isActive ? "#fff" : COLORS.steelSilver,
            fontWeight: isActive ? "800" : "600",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const StatCard = ({ icon: Icon, label, value, unit }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.ironGrey,
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.carbonBlack,
          borderRadius: 12,
          padding: 10,
          marginBottom: 12,
        }}
      >
        <Icon color={COLORS.forgeOrange} size={24} strokeWidth={2.5} />
      </View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          color: "#fff",
          marginBottom: 4,
        }}
      >
        {value}
        {unit && (
          <Text style={{ fontSize: 14, color: COLORS.steelSilver }}>
            {" "}
            {unit}
          </Text>
        )}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: COLORS.steelSilver,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );

  const WorkoutCard = ({ workout }) => {
    const exerciseCount = workout.exercises?.length || 0;
    const workoutDate = workout.workout_date
      ? format(parseISO(workout.workout_date), "MMM d, yyyy")
      : "Unknown Date";

    return (
      <View
        style={{
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 16,
          padding: 18,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: COLORS.ironGrey,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: "#fff",
                marginBottom: 6,
              }}
            >
              {workout.workout_name || "Workout"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar color={COLORS.steelSilver} size={14} strokeWidth={2} />
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.steelSilver,
                  marginLeft: 6,
                  fontWeight: "600",
                }}
              >
                {workoutDate}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleRepeatWorkout(workout)}
            style={{
              backgroundColor: COLORS.carbonBlack,
              borderRadius: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: COLORS.ironGrey,
            }}
          >
            <RotateCcw color={COLORS.forgeOrange} size={20} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: COLORS.ironGrey,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Dumbbell
                color={COLORS.forgeOrange}
                size={16}
                strokeWidth={2.5}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.steelSilver,
                  marginLeft: 6,
                  fontWeight: "600",
                }}
              >
                {t("exercises")}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#fff",
              }}
            >
              {exerciseCount}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Clock color={COLORS.forgeOrange} size={16} strokeWidth={2.5} />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.steelSilver,
                  marginLeft: 6,
                  fontWeight: "600",
                }}
              >
                {t("duration")}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#fff",
              }}
            >
              {workout.duration_minutes || 0}
              <Text style={{ fontSize: 14, color: COLORS.steelSilver }}>
                {" "}
                {t("minutes")}
              </Text>
            </Text>
          </View>
        </View>

        {/* Notes (if any) */}
        {workout.notes && (
          <View
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: COLORS.ironGrey,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: COLORS.steelSilver,
                fontStyle: "italic",
                lineHeight: 18,
              }}
            >
              "{workout.notes}"
            </Text>
          </View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 100,
          padding: 30,
          marginBottom: 24,
          borderWidth: 2,
          borderColor: COLORS.ironGrey,
        }}
      >
        <Dumbbell color={COLORS.steelSilver} size={48} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "900",
          color: "#fff",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        {t("noWorkoutsYet")}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: COLORS.steelSilver,
          textAlign: "center",
          marginBottom: 30,
          paddingHorizontal: 40,
          lineHeight: 22,
        }}
      >
        {t("startTraining") || "Complete workouts to see your history here"}
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/training")}
        style={{
          backgroundColor: COLORS.forgeOrange,
          borderRadius: 14,
          paddingVertical: 16,
          paddingHorizontal: 32,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          {t("startTraining")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 14 }}
          >
            <ChevronLeft color="#fff" size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("workoutHistory")}
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: COLORS.forgeOrange,
            marginLeft: 42,
            borderRadius: 2,
          }}
        />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={COLORS.forgeOrange} size="large" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Filter Tabs */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 20,
              marginBottom: 24,
            }}
          >
            <FilterTab label={t("thisWeek")} value="week" />
            <FilterTab label={t("thisMonth")} value="month" />
            <FilterTab label={t("allTime")} value="all" />
          </View>

          {/* Stats Cards */}
          {workouts.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 20,
                marginBottom: 28,
              }}
            >
              <StatCard
                icon={Dumbbell}
                label={t("totalWorkouts")}
                value={stats.totalWorkouts}
              />
              <StatCard
                icon={Clock}
                label={t("avgDuration")}
                value={stats.avgDuration}
                unit="min"
              />
            </View>
          )}

          {/* Workout List */}
          <View style={{ paddingHorizontal: 20 }}>
            {workouts.length === 0 ? (
              <EmptyState />
            ) : (
              workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
