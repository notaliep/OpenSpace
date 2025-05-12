import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  getFirestore,
} from "firebase/firestore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import { app } from "../config/firebase";

const db = getFirestore(app);

const GraphicReservation = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Zarezerwuj miejsce",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
      },
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchSeats(selectedDateStr);
    }, [selectedDateStr, startTime, endTime])
  );

  const fetchSeats = async (day) => {
    try {
      setLoading(true);
      const [seatsSnapshot, reservationsSnapshot] = await Promise.all([
        getDocs(collection(db, "seats")),
        getDocs(collection(db, "reservations")),
      ]);

      const reservedSeatIds = reservationsSnapshot.docs
        .map((doc) => doc.data())
        .filter((r) => {
          const isSameDate = r.date === day;
          if (!isSameDate || !r.startTime || !r.endTime) return false;
          const rStart = new Date(r.startTime);
          const rEnd = new Date(r.endTime);
          return rStart < endTime && rEnd > startTime;
        })
        .map((r) => r.seatId);

      const fetchedSeats = seatsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isReserved: reservedSeatIds.includes(doc.id),
      }));

      if (fetchedSeats.length === 0) {
        await generateSeats();
        setTimeout(() => fetchSeats(day), 500);
      } else {
        setSeats(fetchedSeats);
      }
    } catch (error) {
      console.error("❌ Błąd podczas pobierania miejsc:", error);
      Alert.alert("Błąd", "Nie udało się pobrać miejsc.");
    } finally {
      setLoading(false);
    }
  };

  const generateSeats = async () => {
    try {
      for (let i = 1; i <= 10; i++) {
        const seatId = `seat-${i}`;
        const qrData = seatId;
        const seatRef = doc(db, "seats", seatId);
        const seatDoc = await getDoc(seatRef);

        if (!seatDoc.exists()) {
          const seatData = { id: seatId, qrData };
          await setDoc(seatRef, seatData);
        }
      }
    } catch (error) {
      console.error("❌ Błąd podczas generowania miejsc:", error);
      Alert.alert("Błąd", "Nie udało się wygenerować miejsc.");
    }
  };

  const handleReserve = (seat) => {
    if (seat.isReserved) {
      Alert.alert(
        "Informacja",
        `Miejsce ${seat.id} jest już zarezerwowane na ten czas.`
      );
      return;
    }

    navigation.navigate("Form", {
      qrData: seat.qrData,
      seatId: seat.id,
      date: selectedDateStr,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        Alert.alert("Błąd", "Nie możesz wybrać daty z przeszłości.");
        return;
      }
      setSelectedDate(date);
      setSelectedDateStr(date.toISOString().split("T")[0]);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartPicker(false);
    if (selectedTime && selectedTime < endTime) {
      setStartTime(selectedTime);
    } else {
      Alert.alert(
        "Błąd",
        "Godzina rozpoczęcia musi być wcześniejsza niż zakończenia."
      );
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndPicker(false);
    if (selectedTime && selectedTime > startTime) {
      setEndTime(selectedTime);
    } else {
      Alert.alert(
        "Błąd",
        "Godzina zakończenia musi być późniejsza niż rozpoczęcia."
      );
    }
  };

  const refreshSeats = () => fetchSeats(selectedDateStr);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.labelText}>
          Wybierz dzień: {selectedDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <Text style={styles.labelText}>
          Godzina rozpoczęcia:{" "}
          {startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <Text style={styles.labelText}>
          Godzina zakończenia:{" "}
          {endTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={refreshSeats}>
        <Text style={styles.refreshButtonText}>Odśwież listę miejsc</Text>
      </TouchableOpacity>

      <FlatList
        data={seats}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.seatsContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`seat_${item.id}`}
            style={[styles.seat, item.isReserved && styles.reserved]}
            onPress={() => handleReserve(item)}
          >
            <QRCode value={item.qrData} size={100} />
            <Text style={styles.seatText}>{item.id}</Text>
            <Text
              style={[
                styles.statusText,
                item.isReserved ? styles.reservedText : styles.availableText,
              ]}
            >
              {item.isReserved ? "Zajęte" : "Dostępne"}
            </Text>
          </TouchableOpacity>
        )}
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
  labelText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: "#6A0DAD",
    fontWeight: "bold",
  },
  seatsContainer: {
    justifyContent: "space-between",
  },
  seat: {
    width: "48%",
    aspectRatio: 1,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 10,
  },
  reserved: {
    backgroundColor: "#F44336",
  },
  seatText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  statusText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  reservedText: {
    color: "#FFF",
  },
  availableText: {
    color: "#E8F5E9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  refreshButton: {
    backgroundColor: "#6A0DAD",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default GraphicReservation;
