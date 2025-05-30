import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import io from 'socket.io-client';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProtectedRoute from '../context/ProtectdRoute';

const socket = io(process.env.API_URL);
const { width, height } = Dimensions.get('window');

export default function FidelidadeScreen() {
  const { user, token } = useContext(AuthContext);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProdutos = async () => {
    try {
      const response = await api.get(`/produtos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProdutos(response.data);
      return;
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();

    socket.on('consulta-updated', () => {
      loadProdutos();
    });

    return () => {
      socket.off('produto-updated');
      socket.disconnect();
    };
  }, []);

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

          <Text style={styles.headerTitle}>Produtos Fidelidade</Text>

          <Ionicons name="cart" size={24} color="#FFFFFF" style={styles.iconRight} />
        </View>

        <View style={styles.separator} />

        <View style={styles.scrollContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            {loading ? (
              <Text style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</Text>
            ) : produtos.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 50 }}>
                Nenhum produto encontrado...
              </Text>
            ) : (
              produtos.map((item) => (
                <View key={item._id} style={styles.card}>
                  <View style={styles.cardContent}>
                    {/* Informações do produto */}
                    <View style={styles.productInfo}>
                      <Text style={styles.cardTitle}>{item.nome}</Text>
                      <Text style={styles.cardText}>Pontos: {item.pontos}</Text>
                      <Text style={styles.cardText}>Descrição: {item.descricao}</Text>

                      {user.pontos >= item.pontos && (
                        <TouchableOpacity style={styles.resgatarButton}>
                          <Text style={styles.resgatarText}>Resgatar Produto</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Imagem */}
                    <Image
                      source={{ uri: `data:image/png;base64,${item.imagem}` }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

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

          <TouchableOpacity style={styles.footerItem}>
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

  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  productImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 10,
    backgroundColor: '#eee',
  },

  resgatarButton: {
    width: width * 0.35,
    marginTop: width * 0.02,
    backgroundColor: '#CA1F76',
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.012,
    borderRadius: 12,
  },

  resgatarText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
