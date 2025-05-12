import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { app } from "../config/firebase";

const db = getFirestore(app);

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Moje rezerwacje",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, []);

  const fetchReservations = async () => {
    try {
      const reservationsQuery = query(
        collection(db, "reservations"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(reservationsQuery);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sorted = data.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      setReservations(sorted);
    } catch (error) {
      console.error("❌ Błąd przy pobieraniu rezerwacji:", error);
      Alert.alert("Błąd", "Nie udało się pobrać rezerwacji.");
    } finally {
      setLoading(false);
    }
  };

  const handleReservationPress = (reservation) => {
    navigation.navigate("ReservationDetails", {
      reservation,
      reservationId: reservation.id,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A0DAD" />
        <Text>Ładowanie rezerwacji...</Text>
      </View>
    );
  }

  if (reservations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Nie masz jeszcze żadnych rezerwacji 😢
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const now = new Date();
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);

          let status = "Nadchodząca";
          let statusColor = "#4CAF50";

          if (end < now) {
            status = "Zakończona";
            statusColor = "#ccc";
          } else if (start <= now && end >= now) {
            status = "Trwa";
            statusColor = "#FFA500";
          }

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: statusColor }]}
              onPress={() => handleReservationPress(item)}
              accessibilityLabel={
                index === 0 ? "firstReservationCard" : undefined
              }
            >
              <Text style={styles.statusLabel}>{status}</Text>
              <Text style={styles.seatText}>📌 Miejsce: {item.seatId}</Text>
              <Text style={styles.dateText}>📅 {item.date}</Text>
              <Text style={styles.timeText}>
                🕒{" "}
                {start.toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {end.toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  seatText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dateText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  timeText: {
    fontSize: 16,
    color: "#555",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    color: "#888",
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 8,
  },
});

export default MyReservations;
