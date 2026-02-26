import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// IMPORTAMOS O NOSSO MEGAFONE AQUI!
import { ThemeProvider } from './src/context/ThemeContext';

// Importando as nossas telas
import { GroupScreen } from './src/screens/GroupScreen';
import { ListasScreen } from './src/screens/ListasScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { NumbersScreen } from './src/screens/NumbersScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // ABRAÇAMOS O APP INTEIRO COM O THEME PROVIDER
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login" 
          screenOptions={{
            headerStyle: { backgroundColor: '#D4E6F1' }, 
            headerTintColor: '#5C4B51', 
            headerTitleStyle: { fontWeight: 'bold' },
            headerTitleAlign: 'center', 
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
          
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
          <Stack.Screen name="Listas" component={ListasScreen} options={{ title: 'Minhas Listas' }} />
          <Stack.Screen name="Group" component={GroupScreen} options={{ title: 'Sorteador de Nomes' }} />
          <Stack.Screen name="Numbers" component={NumbersScreen} options={{ title: 'Sorteador de Números' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}