import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../config/firebase";

const db = getFirestore(app);

const Form = ({ route, navigation }) => {
  const { qrData, seatId, date } = route.params || {};
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    new Date(startTime.getTime() + 60 * 60 * 1000)
  );
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    navigation.setOptions({
      title: "Formularz",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
      },
    });
  }, [navigation]);

  if (!qrData || !seatId || !date) {
    Alert.alert("Błąd", "Brak wymaganych danych! Spróbuj ponownie.");
    navigation.goBack();
    return null;
  }

  if (!user) {
    Alert.alert("Błąd", "Musisz być zalogowany, aby zarezerwować miejsce.");
    navigation.goBack();
    return null;
  }

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime && selectedTime >= new Date()) {
      setStartTime(selectedTime);
      if (selectedTime >= endTime) {
        setEndTime(new Date(selectedTime.getTime() + 60 * 60 * 1000));
      }
    } else {
      Alert.alert("Błąd", "Nie można wybrać przeszłej godziny!");
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime && selectedTime > startTime) {
      setEndTime(selectedTime);
    } else {
      Alert.alert(
        "Błąd",
        "Godzina zakończenia musi być późniejsza niż rozpoczęcia!"
      );
    }
  };

  const checkAvailability = async () => {
    try {
      const startISO = startTime.toISOString();
      const endISO = endTime.toISOString();

      const reservationsQuery = query(
        collection(db, "reservations"),
        where("seatId", "==", seatId),
        where("date", "==", date),
        where("startTime", "<", endISO),
        where("endTime", ">", startISO)
      );

      const snapshot = await getDocs(reservationsQuery);

      console.log(`📋 Rezerwacje znalezione: ${snapshot.size}`);
      snapshot.forEach((doc) => console.log("➡️", doc.data()));

      return snapshot.empty;
    } catch (error) {
      console.error("❌ Błąd podczas sprawdzania dostępności:", error);
      return true;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Błąd", "Musisz podać imię!");
      return;
    }

    if (!(startTime instanceof Date) || !(endTime instanceof Date) || !date) {
      Alert.alert("Błąd", "Niepoprawne dane czasu lub daty.");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert(
        "Błąd",
        "Godzina rozpoczęcia musi być wcześniejsza niż zakończenia."
      );
      return;
    }

    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      Alert.alert("Błąd", "To miejsce jest już zarezerwowane w tym czasie.");
      return;
    }

    try {
      const reservationData = {
        name,
        seatId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date,
        qrData,
        userId: user.uid,
      };

      await addDoc(collection(db, "reservations"), reservationData);

      console.log("✅ Rezerwacja dodana:", reservationData);

      Alert.alert("Sukces", "Rezerwacja została pomyślnie dodana!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Błąd przy zapisywaniu rezerwacji: ", error);
      Alert.alert("Błąd", `Wystąpił błąd: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formularz rezerwacji</Text>

      <TextInput
        style={styles.input}
        placeholder="Imię"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowStartTimePicker(true)}
      >
        <Text style={styles.timeText}>
          ⏰ Start:{" "}
          {startTime.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowEndTimePicker(true)}
      >
        <Text style={styles.timeText}>
          ⏳ Koniec:{" "}
          {endTime.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>✅ ZAREZERWUJ</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Form;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6A0DAD",
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    backgroundColor: "#fff",
    fontSize: 18,
    color: "#333",
  },
  timePicker: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
