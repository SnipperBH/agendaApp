import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaskInput, { Masks } from "react-native-mask-input";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import axios from "axios";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("MG");
  const [celular, setCelular] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const buscarEndereco = async (cepLimpo: string | any[]) => {
    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch (err) {
      console.log("Erro ao buscar CEP:", err);
    }
  };

  const handleCepChange = (
    formatted: React.SetStateAction<string>,
    extracted: string | any[]
  ) => {
    setCep(formatted);
    if (extracted?.length === 8) buscarEndereco(extracted);
  };

  const handleRegister = async () => {
    if (
      !name ||
      !sobrenome ||
      !cep ||
      !rua ||
      !numero ||
      !bairro ||
      !cidade ||
      !estado ||
      !celular ||
      !email ||
      !password
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Erro", "Email inválido.");
      return;
    }

    const payload = {
      name,
      sobrenome,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      celular,
      whatsapp: whatsapp ? "Sim" : "Não",
      email,
      password,
      role: "user",
    };
    try {
      const response = await api.post("/users/create", payload);

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Sucesso", "Usuário registrado com sucesso!", [
          { text: "OK", onPress: () => router.replace("./LoginScreen") },
        ]);
      } else {
        Alert.alert("Erro", "Falha ao registrar usuário.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || error.message || "Erro desconhecido"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.replace("./LoginScreen")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.hr} />

        <TextInput
          placeholder="Nome"
          placeholderTextColor="#fff"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Sobrenome"
          placeholderTextColor="#fff"
          style={styles.input}
          value={sobrenome}
          onChangeText={setSobrenome}
        />

        <MaskInput
          placeholder="CEP"
          placeholderTextColor="#fff"
          style={styles.input}
          value={cep}
          onChangeText={handleCepChange}
          mask={Masks.ZIP_CODE}
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <TextInput
            placeholder="Rua"
            placeholderTextColor="#fff"
            style={[styles.input, styles.half]}
            value={rua}
            onChangeText={setRua}
          />
          <TextInput
            placeholder="Número"
            placeholderTextColor="#fff"
            style={[styles.input, styles.half]}
            value={numero}
            onChangeText={(text) => setNumero(text.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />
        </View>

        <TextInput
          placeholder="Bairro"
          placeholderTextColor="#fff"
          style={styles.input}
          value={bairro}
          onChangeText={setBairro}
        />

        <View style={styles.row}>
          <TextInput
            placeholder="Cidade"
            placeholderTextColor="#fff"
            style={[styles.input, styles.half]}
            value={cidade}
            onChangeText={setCidade}
          />
          <View style={[styles.pickerContainer, styles.half]}>
            <Picker
              selectedValue={estado}
              onValueChange={setEstado}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              {estados.map((uf) => (
                <Picker.Item key={uf} label={uf} value={uf} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <MaskInput
            placeholder="Celular"
            placeholderTextColor="#fff"
            style={[styles.input, styles.half]}
            value={celular}
            onChangeText={setCelular}
            keyboardType="phone-pad"
            mask={[
              "(",
              /\d/,
              /\d/,
              ")",
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              "-",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
          />
          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>WhatsApp?</Text>
            <Switch
              value={whatsapp}
              onValueChange={setWhatsapp}
              thumbColor="#fff"
              trackColor={{ true: "#CA1F76", false: "#ccc" }}
            />
          </View>
        </View>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#fff"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#fff"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#C91F75",
    alignItems: "center",
    paddingVertical: 80,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: "#fff",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  half: {
    width: "48%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    marginBottom: 12,
    justifyContent: "center",
  },
  picker: {
    color: "#fff",
    height: 50,
    width: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    color: "#fff",
    marginRight: 8,
  },
  button: {
    backgroundColor: "#D2568D",
    paddingVertical: 14,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    marginTop: 20,

    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    // Sombra para Android
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 10,
  },
  backText: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 6,
  },
  hr: {
    width: "80%",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    marginBottom: 20,
  },
});
