import { useContext } from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// IMPORTAÇÕES NOVAS PARA A ENGRENAGEM E O MODO ESCURO
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export function MenuScreen({ navigation }) {
  // ESCUTANDO O MEGAFONE
  const { isDarkMode } = useContext(ThemeContext);

  return (
    // View principal para segurar a engrenagem no topo, independentemente da rolagem
    <View style={[styles.mainContainer, isDarkMode && styles.darkMainContainer]}>
      
      {/* --- ENGRENAGEM NO CANTO SUPERIOR DIREITO --- */}
      <TouchableOpacity 
        style={styles.settingsIcon} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons 
          name="settings-sharp" 
          size={32} 
          color={isDarkMode ? '#FFF' : '#5C4B51'} // Muda de cor no escuro
        />
      </TouchableOpacity>

      {/* --- O SEU CÓDIGO ORIGINAL COMEÇA AQUI --- */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo} 
        />

        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Sorteador</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Escolha o tipo de sorteio abaixo</Text>

        <TouchableOpacity 
          style={[styles.card, styles.cardBlue, isDarkMode && styles.darkCard]} 
          onPress={() => navigation.navigate('Numbers')} 
        >
          <Text style={[styles.cardTitle, isDarkMode && styles.darkCardTitle]}>🔢 Sortear Números</Text>
          <Text style={[styles.cardDescription, isDarkMode && styles.darkCardDescription]}>Sorteie números aleatórios</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.cardPink, isDarkMode && styles.darkCard]} 
          onPress={() => navigation.navigate('Listas')}
        >
          <Text style={[styles.cardTitle, isDarkMode && styles.darkCardTitle]}>🔤 Sortear Nomes</Text>
          <Text style={[styles.cardDescription, isDarkMode && styles.darkCardDescription]}>Gerencie seus grupos e sorteie nomes</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // CONTAINER PRINCIPAL (Novo, para segurar a tela)
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#FDF8F5' 
  },
  
  // ESTILO DA ENGRENAGEM FLUTUANTE
  settingsIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 50,
    right: 20,
    zIndex: 10, // Garante que a engrenagem fique por cima de tudo para poder ser clicada
  },

  // SEU CONTAINER ORIGINAL (com um pequeno ajuste no paddingTop)
  scrollContainer: { 
    flexGrow: 1, 
    padding: 20, 
    // Aumentei um pouquinho o paddingTop para o seu logo não bater na engrenagem
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 70 : 90, 
    justifyContent: 'center' 
  },
  logo: { width: 130, height: 130, alignSelf: 'center', marginBottom: 20, resizeMode: 'contain' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#5C4B51', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#8C7A80', textAlign: 'center', marginBottom: 40 },
  card: { 
    width: '100%', padding: 25, borderRadius: 15, marginBottom: 20, 
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
    // 🔥 A MÁGICA PARA TIRAR O CONTORNO FANTASMA:
    borderWidth: 1,
    borderColor: 'transparent' // No modo claro, a borda existe mas é invisível!
  },  cardBlue: { backgroundColor: '#D4E6F1' }, 
  cardPink: { backgroundColor: '#FADBD8' }, 
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardDescription: { fontSize: 14, color: '#555' },

  // --- CÓDIGOS DO MODO ESCURO ---
  darkMainContainer: { backgroundColor: '#121212' },
  darkTitle: { color: '#FFF' },
  darkSubtitle: { color: '#B0B0B0' },
  // No modo escuro, os cartões ficam num cinza chumbo com uma borda para não sumirem
  darkCard: { backgroundColor: '#1E1E1E', borderColor: '#333' }, 
  darkCardTitle: { color: '#FFF' },
  darkCardDescription: { color: '#B0B0B0' }


});