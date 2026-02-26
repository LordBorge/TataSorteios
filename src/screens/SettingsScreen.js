import { useContext } from 'react'; // <-- Importamos o useContext
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

// IMPORTAMOS O MEGAFONE
import { ThemeContext } from '../context/ThemeContext';

export function SettingsScreen({ navigation }) {
  // ESCUTANDO O MEGAFONE: Pegamos se está escuro e a função de trocar
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const user = auth.currentUser;

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair do Tata Sorteia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            if (user) {
              signOut(auth).then(() => navigation.replace('Login'));
            } else {
              navigation.replace('Login');
            }
          } 
        }
      ]
    );
  }

  return (
    // Olha a mágica aqui: Se isDarkMode for true, ele aplica o estilo escuro junto com o claro!
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Minha Conta</Text>
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.userName, isDarkMode && styles.darkTitle]}>
            {user?.displayName ? user.displayName : 'Visitante'}
          </Text>
          <Text style={[styles.userEmail, isDarkMode && styles.darkText]}>
            {user?.email ? user.email : 'Nenhuma conta conectada'}
          </Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Preferências</Text>
        <View style={[styles.card, styles.rowCard, isDarkMode && styles.darkCard]}>
          <View>
            <Text style={[styles.settingName, isDarkMode && styles.darkTitle]}>Modo Escuro</Text>
            <Text style={[styles.settingDescription, isDarkMode && styles.darkText]}>Tema escuro para o aplicativo</Text>
          </View>
          
          {/* LIGAMOS O BOTÃO AO MEGAFONE AQUI */}
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#D4E6F1', true: '#FFB6C1' }} 
            thumbColor={'#FFF'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Sobre</Text>
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.settingName, isDarkMode && styles.darkTitle]}>Tata Sorteia</Text>
          <Text style={[styles.settingDescription, isDarkMode && styles.darkText]}>Versão 1.0.0</Text>
          <Text style={[styles.settingDescription, isDarkMode && styles.darkText, { marginTop: 10 }]}>Desenvolvido com carinho.</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ESTILOS CLAROS (Originais)
  container: { flexGrow: 1, backgroundColor: '#FDF8F5', padding: 20, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 40 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#8C7A80', marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: '#FADBD8' },
  rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#5C4B51', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#8C7A80', marginBottom: 20 },
  logoutButton: { backgroundColor: '#FFEBEE', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2' },
  logoutButtonText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },
  settingName: { fontSize: 18, fontWeight: 'bold', color: '#5C4B51' },
  settingDescription: { fontSize: 14, color: '#8C7A80', marginTop: 2 },

  // ESTILOS ESCUROS (Novos!)
  darkContainer: { backgroundColor: '#121212' }, // Fundo cinza bem escuro
  darkCard: { backgroundColor: '#1E1E1E', borderColor: '#333' }, // Cartões um pouco mais claros que o fundo
  darkTitle: { color: '#FFF' }, // Títulos brancos
  darkText: { color: '#B0B0B0' } // Textos secundários em cinza claro
});