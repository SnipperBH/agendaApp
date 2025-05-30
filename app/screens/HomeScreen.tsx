import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext'; // ajuste o caminho
import api from '../services/api';
import io from 'socket.io-client';
import { router } from 'expo-router';
import ProtectedRoute from '../context/ProtectdRoute';

const socket = io(process.env.API_URL);

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, logout, token, updateUser } = useContext(AuthContext);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProdutos = async () => {
    try {
      const response = await api.get(`/produtos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const shuffled = response.data.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      setProdutos(selected);
    } catch (err) {
      console.error('Erro ao carregar produtos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();

    // Atualiza produtos quando socket notificar
    socket.on('produto-updated', () => {
      loadProdutos();
    });

    // Atualiza dados do usuário automaticamente
    socket.on('user-updated', () => {
      updateUser();
    });

    return () => {
      socket.off('produtos-updated');
      socket.off('user-updated');
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('./LoginScreen');
  };

  const renderMenuItem = (icon: any, text: string, route: string) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        console.log('Pressed:', route), router.push(`/screens/${route}`);
      }}
    >
      <Ionicons style={styles.iconesmenu} name={icon} />
      <Text style={styles.menuItemText}>{text}</Text>
    </TouchableOpacity>
  );

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
        <View style={styles.section1} />
        <View style={styles.section2} />
        <View style={styles.section3} />

        <View style={styles.content}>
          <View style={styles.wrapper}>
            <View style={styles.headerTop} />

            <View style={styles.headerContent}>
              <View style={styles.leftHeader}>
                <View style={styles.shadowWrapper}>
                  <Image
                    source={user?.foto ? { uri: user.foto } : require('../../assets/face.png')}
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    Nome: {`${user?.name || '...'} ${user?.sobrenome || ''}`}
                  </Text>
                  <Text style={styles.userFidelidade}>Fidelidade: {user?.pontos ?? 0}</Text>
                </View>
              </View>

              <View style={styles.rightHeader}>
                <Image
                  source={require('../../assets/logoindexbranca.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <MaterialIcons name="logout" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.menuContainer}>
              <View style={styles.menuRow}>
                {renderMenuItem('calendar', 'Agenda', 'ConsultasScreen')}
                {renderMenuItem('medkit', 'Tratamentos', 'TratamentoScreen')}
              </View>
              <View style={[styles.menuRow, { marginTop: 5 }]}>
                {renderMenuItem('cart', 'Produtos', 'ProdutosScreen')}
                {renderMenuItem('star', 'Fidelidade', 'FidelidadeScreen')}
              </View>
              <FlatList
                data={produtos}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.produtoCard}>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${item.imagem}` }}
                      style={styles.produtoImg}
                    />
                    <Text style={styles.produtoText}>{item.nome}</Text>
                  </View>
                )}
                contentContainerStyle={styles.slider}
              />
            </View>



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
                <TouchableOpacity>
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
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section1: {
    flex: 2,
    backgroundColor: '#C91F75',
  },
  section2: {
    flex: 7,
    backgroundColor: '#fff',
  },
  section3: {
    flex: 0.9,
    backgroundColor: '#CA1F76',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    padding: width * 0.03,
  },
  wrapper: {
    flex: 1,
  },
  headerTop: {
    borderWidth: 2,
    marginTop: height * 0.045,
    alignSelf: 'center',
    borderRadius: 30,
    width: width * 0.9,
    height: height * 0.25,
    borderColor: '#fff',
    backgroundColor: '#D2568D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  headerContent: {
    position: 'absolute',
    top: height * 0.07,
    left: width * 0.07,
    right: width * 0.28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftHeader: {
    alignItems: 'center',
  },
  shadowWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#CA1F76',
    shadowColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    marginEnd: width * 0.35,
  },
  avatar: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
  },
  userInfo: {
    marginStart: -width * 0,
    marginTop: width * 0.03,
    alignItems: 'flex-start',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userFidelidade: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
  },
  rightHeader: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.2,
    height: width * 0.2,
  },
  logoutButton: {
    marginTop: width * 0.15,
    marginInlineStart: width * 0.13,
  },
  menuContainer: {
    flexGrow: 1,
    marginTop: height * 0.014,
    alignItems: 'center',
    width: width * 0.95,
    height: height * 0.36,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.87,
    height: height * 0.18,
  },
  menuItem: {
    borderWidth: 2,
    borderColor: '#fff',
    width: width * 0.42,
    height: height * 0.17,
    backgroundColor: '#D2568D',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  menuItemText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 17,
  },
  iconesmenu: {
    fontSize: 50,
    color: '#fff',
  },
  slider: {
    paddingLeft: 20,
    marginTop: 20,
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderColor: '#D2568D',
    borderWidth: 2,
    borderRadius: 25,
    padding: 5,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    height: width * 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  produtoImg: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  produtoText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
  },
  homeButton: {
    width: 60,
    height: 60,
    backgroundColor: '#D2568D',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 10,
  },
});
