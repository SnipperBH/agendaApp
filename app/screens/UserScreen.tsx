import React, { useContext, useEffect, useState } from 'react';
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
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaskInput, { Masks } from 'react-native-mask-input';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import axios from 'axios';
import io from 'socket.io-client';

const { width, height } = Dimensions.get('window');
const socket = io(process.env.API_URL);

export default function UserScreen() {
  const router = useRouter();
  const { user, token } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [celular, setCelular] = useState('');
  const [whatsapp, setWhatsapp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const buscarUsuario = async () => {
    try {
      const response = await api.get(`/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      setName(data.name || '');
      setSobrenome(data.sobrenome || '');
      setCep(data.cep || '');
      setRua(data.rua || '');
      setNumero(data.numero || '');
      setBairro(data.bairro || '');
      setCidade(data.cidade || '');
      setEstado(data.estado || '');
      setCelular(data.celular || '');
      setWhatsapp(data.whatsapp === 'Sim');
      setEmail(data.email || '');
    } catch (err) {
      console.log('Erro ao buscar dados do usuario:', err);
    }
  };

  const buscarEndereco = async (cep: string) => {
    if (cep.length === 9) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
        const data = response.data;
        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
          setEstado(data.uf);
        }
      } catch (err) {
        console.log('Erro ao buscar endereço:', err);
      }
    }
  };

  useEffect(() => {
    buscarUsuario();

    socket.on('user-updated', () => {
      buscarUsuario();
    });

    return () => {
      socket.off('user-updated');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    buscarEndereco(cep);
  }, [cep]);

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
      !email
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Email inválido.');
      return;
    }

    const payload: any = {
      name,
      sobrenome,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      celular,
      whatsapp: whatsapp ? 'Sim' : 'Não',
      email,
    };

    if (password.trim() !== '') {
      payload.password = password;
    }

    try {
      const response = await api.put(`/users/${user._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Usuário atualizado com sucesso!', [
          { text: 'OK', onPress: () => router.push(`/screens/HomeScreen`) },
        ]);
      } else {
        Alert.alert('Erro', 'Falha ao atualizar usuário.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.message || error.message || 'Erro desconhecido');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Dados</Text>
        <Ionicons name="person-outline" size={24} color="#FFFFFF" />
      </View>

      <View style={styles.separator} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.containerForm}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            placeholder="Nome"
            placeholderTextColor="#CA1F76"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Sobrenome"
            placeholderTextColor="#CA1F76"
            style={styles.input}
            value={sobrenome}
            onChangeText={setSobrenome}
          />

          <MaskInput
            placeholder="CEP"
            placeholderTextColor="#CA1F76"
            style={styles.input}
            value={cep}
            onChangeText={setCep}
            mask={Masks.ZIP_CODE}
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <TextInput
              placeholder="Rua"
              placeholderTextColor="#CA1F76"
              style={[styles.input, styles.half]}
              value={rua}
              onChangeText={setRua}
            />
            <TextInput
              placeholder="Número"
              placeholderTextColor="#CA1F76"
              style={[styles.input, styles.half]}
              value={numero}
              onChangeText={(text) => setNumero(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            placeholder="Bairro"
            placeholderTextColor="#CA1F76"
            style={styles.input}
            value={bairro}
            onChangeText={setBairro}
          />

          <View style={styles.row}>
            <TextInput
              placeholder="Cidade"
              placeholderTextColor="#CA1F76"
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
              placeholderTextColor="#CA1F76"
              style={[styles.input, styles.half]}
              value={celular}
              onChangeText={setCelular}
              keyboardType="phone-pad"
              mask={Masks.BRL_PHONE}
            />
            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>WhatsApp?</Text>
              <Switch
                value={whatsapp}
                onValueChange={setWhatsapp}
                thumbColor="#fff"
                trackColor={{ true: '#CA1F76', false: '#ccc' }}
              />
            </View>
          </View>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#CA1F76"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Senha (opcional)"
            placeholderTextColor="#CA1F76"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => router.push(`/screens/ConsultasScreen`)}
          >
            <Ionicons name="calendar-outline" size={24} color="#fff" />
            <Text style={styles.footerText}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => router.push(`/screens/ProdutosScreen`)}
          >
            <Ionicons name="cart-outline" size={24} color="#fff" />
            <Text style={styles.footerText}>Produtos</Text>
          </TouchableOpacity>

          <View style={styles.homeButton}>
            <TouchableOpacity onPress={() => router.push(`/screens/HomeScreen`)}>
              <Ionicons name="home" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => router.push(`/screens/FidelidadeScreen`)}
          >
            <Ionicons name="star-outline" size={24} color="#fff" />
            <Text style={styles.footerText}>Fidelidade</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerItem}>
            <Ionicons name="person-outline" size={24} color="#fff" />
            <Text style={styles.footerText}>Usuário</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  containerForm: {
    alignItems: 'center',
    paddingVertical: height * 0.03,
  },
  input: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#CA1F76',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: '#000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  half: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginBottom: 12,
    justifyContent: 'center',
  },
  picker: {
    color: '#000',
    height: 50,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    color: '#000',
    marginRight: 8,
  },
  button: {
    backgroundColor: '#CA1F76',
    paddingVertical: 14,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,

    // Sombra para iOS
    shadowColor: '#000',
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
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginBottom: 10,
  },
  backText: {
    fontSize: 18,
    color: '#000',
    marginLeft: 6,
  },
  hr: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 20,
  },

  scrollContainer: {
    flex: 1,
    paddingBottom: height * 0.1,
  },
  header: {
    backgroundColor: '#CA1F76',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.01,
    paddingHorizontal: height * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // garante alinhamento dos 3 itens
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  separator: {
    height: height * 0.003,
    backgroundColor: '#000',
    width: '100%',
  },
  scroll: {
    padding: height * 0.015,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: height * 0.0,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: height * 0.015,
    marginBottom: height * 0.015,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardStatus: {
    marginTop: height * 0.01,
    fontSize: 14,
    fontWeight: '600',
    color: '#CA1F76',
  },
  footer: {
    backgroundColor: '#CA1F76',
    marginBottom: 0,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.08,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: width * 0.03,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
  },
  homeButton: {
    marginBottom: width * 0.05,
    width: height * 0.065,
    height: height * 0.065,
    backgroundColor: '#D2568D',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * -0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 10,
  },
});
