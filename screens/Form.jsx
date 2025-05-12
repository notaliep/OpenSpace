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
  const {
    qrData,
    seatId,
    date,
    startTime: initialStartTime,
    endTime: initialEndTime,
  } = route.params || {};

  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState(() =>
    initialStartTime ? new Date(initialStartTime) : new Date()
  );
  const [endTime, setEndTime] = useState(() =>
    initialEndTime
      ? new Date(initialEndTime)
      : new Date(new Date().getTime() + 60 * 60 * 1000)
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

  useEffect(() => {
    if (!qrData || !seatId || !date) {
      Alert.alert("Błąd", "Brak wymaganych danych! Spróbuj ponownie.");
      navigation.goBack();
    } else if (!user) {
      Alert.alert("Błąd", "Musisz być zalogowany, aby zarezerwować miejsce.");
      navigation.goBack();
    }
  }, [qrData, seatId, date, user, navigation]);

  if (!qrData || !seatId || !date || !user) {
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
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("seatId", "==", seatId),
      where("date", "==", date),
      where("startTime", "<", endTime.toISOString()),
      where("endTime", ">", startTime.toISOString())
    );

    const snapshot = await getDocs(reservationsQuery);
    return snapshot.empty;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Błąd", "Musisz podać imię!");
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
      Alert.alert("Sukces", "Rezerwacja została pomyślnie dodana!");
      navigation.goBack();
    } catch (error) {
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
        accessibilityLabel="nameInput"
      />
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowStartTimePicker(true)}
      >
        <Text>
          ⏰ Start:{" "}
          {startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          onChange={handleStartTimeChange}
        />
      )}
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowEndTimePicker(true)}
      >
        <Text>
          ⏳ Koniec:{" "}
          {endTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          onChange={handleEndTimeChange}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>✅ ZAREZERWUJ</Text>
      </TouchableOpacity>
    </View>
  );
};

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

export default Form;
