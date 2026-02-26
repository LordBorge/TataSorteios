import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

 const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // 1. Você PRECISA da sua chave WEB aqui (aquela que criamos lá no começo)
    webClientId: 'COLE_AQUI_A_SUA_CHAVE_WEB_DO_GOOGLE_CLOUD', 
    
    // 2. A sua chave Android que você me mandou está certinha!
    androidClientId: 'COLE_AQUI_A_SUA_CHAVE_ANDROID_DO_GOOGLE_CLOUD', 
  });
  
  useEffect(() => {
    async function handleGoogleLogin() {
      if (response?.type === 'success') {
        setLoading(true); 
        try {
          const { id_token } = response.params;
          const credential = GoogleAuthProvider.credential(id_token);

          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;

          // Tentativa de puxar do banco (Blindada)
          try {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists() && docSnap.data().grupos) {
              await AsyncStorage.setItem('@sorteio_grupos', JSON.stringify(docSnap.data().grupos));
            }
          } catch (dbError) {
            console.log("Banco de dados falhou, mas o login prossegue:", dbError);
          }

          navigation.replace('Menu');
        } catch (error) {
          Alert.alert('Erro no Google', 'Não foi possível entrar com esta conta.');
          setLoading(false);
        }
      }
    }
    handleGoogleLogin();
  }, [response]);

  async function handleLogin() {
    if (email === '' || senha === '') {
      Alert.alert('Atenção', 'Preencha seu e-mail e senha para entrar.');
      return;
    }

    setLoading(true); 

    try {
      const emailFormatado = email.toLowerCase().trim();
      
      // 1. FAZ O LOGIN (A prova de fogo!)
      const userCredential = await signInWithEmailAndPassword(auth, emailFormatado, senha);
      const user = userCredential.user;

      // 2. BUSCA AS LISTAS (Agora está blindado. Se a internet oscilar, ele entra mesmo assim)
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists() && docSnap.data().grupos) {
          await AsyncStorage.setItem('@sorteio_grupos', JSON.stringify(docSnap.data().grupos));
        }
      } catch (dbError) {
        console.log("Acesso ao Firestore bloqueado ou lento. Entrando no app mesmo assim...");
      }

      // Sucesso total, vai para o Menu!
      navigation.replace('Menu'); 
    } catch (error) {
      // 3. SE A SENHA ESTIVER REALMENTE ERRADA, MOSTRA O MOTIVO EXATO!
      let mensagemErro = 'Erro desconhecido. Verifique sua internet.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        mensagemErro = 'E-mail ou senha incorretos. Verifique e tente novamente.';
      } else {
        mensagemErro = error.message; 
      }
      
      Alert.alert('Erro no Login', mensagemErro);
      setLoading(false); 
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FDF8F5' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />

        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Faça login para sincronizar seus sorteios</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none" 
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordWrapper}>
            <TextInput 
              style={styles.passwordInput}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha} 
              autoCapitalize="none"
              autoCorrect={false} // <-- Evita bugs de teclado no Android
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Ionicons 
                name={mostrarSenha ? "eye-off" : "eye"} 
                size={24} 
                color="#8C7A80" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading} 
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divisor}>
          <View style={styles.linha} />
          <Text style={styles.textoDivisor}>OU</Text>
          <View style={styles.linha} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request || loading} 
          onPress={() => promptAsync()}
        >
          <Image
            source={require('../../assets/images/google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            Entre com o Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guestButton} 
          onPress={() => navigation.replace('Menu')}
        >
          <Text style={styles.guestButtonText}>Entrar como Visitante</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Ainda não tem conta? <Text style={styles.registerTextBold}>Cadastre-se</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 30, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 40 : 60, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 150, height: 150, marginBottom: 20, resizeMode: 'contain' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#5C4B51', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#8C7A80', marginBottom: 30, textAlign: 'center' },
  inputContainer: { width: '100%', marginBottom: 15 },
  label: { fontSize: 16, color: '#5C4B51', fontWeight: 'bold', marginBottom: 8 },
  
  input: { backgroundColor: '#FFF', height: 55, borderRadius: 15, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#D4E6F1', color: '#5C4B51' },
  
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#D4E6F1' },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 15, fontSize: 16, color: '#5C4B51' },
  eyeIcon: { padding: 15 },

  button: { backgroundColor: '#3dd5f0', width: '100%', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonDisabled: { backgroundColor: '#A0E8F5', elevation: 0 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  
  divisor: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 20 },
  linha: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  textoDivisor: { width: 40, textAlign: 'center', color: '#888', fontWeight: 'bold' },
  
  googleButton: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFF', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#CCC', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  googleIcon: { width: 24, height: 24, marginRight: 10, resizeMode: 'contain' },
  googleButtonText: { fontSize: 18, fontWeight: 'bold', color: '#555' },

  guestButton: { backgroundColor: '#FFF', width: '100%', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CCC', elevation: 1 },
  guestButtonText: { fontSize: 16, fontWeight: 'bold', color: '#555' },

  registerButton: { marginTop: 35, padding: 10 },
  registerText: { color: '#8C7A80', fontSize: 16 },
  registerTextBold: { color: '#FFB6C1', fontWeight: 'bold' },
});