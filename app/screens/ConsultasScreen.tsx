import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import io from 'socket.io-client';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProtectedRoute from '../context/ProtectdRoute';
import { toZonedTime } from 'date-fns-tz';

const socket = io(process.env.API_URL);
const { width, height } = Dimensions.get('window');
const timeZone = 'America/Sao_Paulo';

export default function ConsultaScreen() {
  const { user, token } = useContext(AuthContext);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadConsultas = async () => {
    try {
      const response = await api.get(`/consultas/usuario/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const agoraUTC = toZonedTime(new Date(), timeZone);

      const consultasFiltradas = response.data
        .filter((consulta) => {
          if (consulta.status !== 'Aberta') return false;

          // Quebra data e hora manualmente para evitar UTC
          const [ano, mes, dia] = consulta.data.split('-').map(Number);
          const [hora, minuto] = consulta.hora.split(':').map(Number);

          // Cria objeto Date no horário local (sem UTC)
          const dataHoraConsulta = new Date(ano, mes - 1, dia, hora, minuto);

          return dataHoraConsulta >= agoraUTC;
        })
        .sort((a, b) => {
          const [aAno, aMes, aDia] = a.data.split('-').map(Number);
          const [aHora, aMinuto] = a.hora.split(':').map(Number);
          const dataA = new Date(aAno, aMes - 1, aDia, aHora, aMinuto);

          const [bAno, bMes, bDia] = b.data.split('-').map(Number);
          const [bHora, bMinuto] = b.hora.split(':').map(Number);
          const dataB = new Date(bAno, bMes - 1, bDia, bHora, bMinuto);

          return dataA - dataB;
        });

      setConsultas(consultasFiltradas);
      return;
    } catch (err) {
      console.error('Erro ao carregar consultas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultas();

    socket.on('consulta-updated', () => {
      loadConsultas();
    });

    return () => {
      socket.off('consulta-updated');
      socket.disconnect();
    };
  }, []);

  const formatDate = (iso: string): string => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleCancelar = async (id: string) => {
    try {
      await api.put(
        `/consultas/cancelar/${id}`,
        { status: 'Cancelada' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      loadConsultas(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#CA1F76" />
        <Text style={{ color: '#CA1F76', marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Minhas Consultas</Text>

          <Ionicons name="calendar-outline" size={24} color="#FFFFFF" style={styles.iconRight} />
        </View>

        <View style={styles.separator} />

        <View style={styles.scrollContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            {loading ? (
              <Text style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</Text>
            ) : consultas.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 50 }}>
                Nenhuma consulta encontrada
              </Text>
            ) : (
              consultas.map((item) => (
                <View key={item._id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.nome}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity onPress={() => handleCancelar(item._id)}>
                        <Ionicons name="close-circle" size={24} color="#CA1F76" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.cardText}>Procedimento: {item.procedimento}</Text>
                  <Text style={styles.cardText}>Data: {formatDate(item.data)}</Text>
                  <Text style={styles.cardText}>Hora: {item.hora}</Text>
                  <Text style={styles.cardText}>Valor: {item.valor}</Text>
                  <Text style={styles.cardText}>
                    Endereço: {`${item.rua}, ${item.numero} - ${item.bairro}, ${item.cidade}`}
                  </Text>
                  <Text style={styles.cardStatus}>Status: {item.status}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem}>
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
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => router.push(`/screens/UserScreen`)}
          >
            <Ionicons name="person-outline" size={24} color="#fff" />
            <Text style={styles.footerText}>Usuário</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
