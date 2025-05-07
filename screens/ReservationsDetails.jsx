import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import { app } from "../config/firebase";

const db = getFirestore(app);

const ReservationDetails = ({ route }) => {
  const navigation = useNavigation();
  const { reservation, reservationId } = route.params || {};

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Szczegóły rezerwacji",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
      },
    });
  }, [navigation]);

  if (!reservation || !reservationId) {
    Alert.alert("Błąd", "Brak danych rezerwacji.");
    navigation.goBack();
    return null;
  }

  const startTime = new Date(reservation.startTime);
  const endTime = new Date(reservation.endTime);
  const now = new Date();
  const isFuture = startTime > now;

  let status = "Nadchodząca";
  if (endTime < now) {
    status = "Zakończona";
  } else if (startTime <= now && endTime >= now) {
    status = "Trwa";
  }

  const handleCancel = () => {
    Alert.alert(
      "Potwierdzenie",
      "Czy na pewno chcesz anulować tę rezerwację?",
      [
        { text: "Nie", style: "cancel" },
        {
          text: "Tak",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "reservations", reservationId));
              Alert.alert("Anulowano", "Rezerwacja została usunięta.");
              navigation.goBack();
            } catch (error) {
              console.error("❌ Błąd przy anulowaniu:", error);
              Alert.alert("Błąd", "Nie udało się anulować rezerwacji.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Szczegóły rezerwacji</Text>

      <Text style={styles.statusText}>
        📌 Status: <Text style={styles.bold}>{status}</Text>
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <MaterialIcons name="event-seat" size={24} color="#007bff" />
          <Text style={styles.label}>Miejsce:</Text>
          <Text style={styles.value}>{reservation.seatId}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="calendar-today" size={24} color="#007bff" />
          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{reservation.date}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="schedule" size={24} color="#007bff" />
          <Text style={styles.label}>Godzina:</Text>
          <Text style={styles.value}>
            {startTime.toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {endTime.toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, !isFuture && styles.disabledButton]}
        disabled={!isFuture}
        onPress={handleCancel}
      >
        <Text style={styles.buttonText}>
          {isFuture ? "❌ Anuluj rezerwację" : "🔒 Nie można anulować"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#6c757d", marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Powrót</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 15,
  },
  bold: {
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  value: {
    fontSize: 18,
    marginLeft: 10,
    color: "#555",
  },
  button: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ReservationDetails;
