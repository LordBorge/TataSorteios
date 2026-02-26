import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { auth } from '../config/firebase';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // 1. ADICIONAMOS A CAIXA PARA GUARDAR OS ERROS AQUI!
  const [erros, setErros] = useState({});

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'SEU_CLIENT_ID_AQUI',
  });

  // 2. VALIDAÇÃO EM TEMPO REAL (Atualiza os erros enquanto o usuário digita)
  useEffect(() => {
    let novosErros = {};

    // Só avisa erro no e-mail se ele já começou a digitar e estiver inválido
    if (email !== '' && !/\S+@\S+\.\S+/.test(email)) {
      novosErros.email = "Digite um e-mail válido (ex: email@gmail.com)";
    }

    // Só avisa erro na senha se ele já começou a digitar e for menor que 6
    if (senha !== '' && senha.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    // Só avisa erro de confirmação se ele já digitou algo na segunda senha
    if (confirmarSenha !== '' && senha !== confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não são iguais.";
    }

    setErros(novosErros);
  }, [nome, email, senha, confirmarSenha]);

  // 3. O BOTÃO SÓ ACENDE SE TUDO ESTIVER PREENCHIDO E SEM ERROS
  const formularioValido =
    nome.trim() !== '' &&
    email.trim() !== '' &&
    /\S+@\S+\.\S+/.test(email) &&
    senha.length >= 6 &&
    senha === confirmarSenha;

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => {
          navigation.replace('Menu');
        })
        .catch(() => {
          Alert.alert('Erro no Google', 'Não foi possível cadastrar com esta conta.');
        });
    }
  }, [response]);

  function handleCadastroReal() {
    if (!formularioValido) return;

    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, { displayName: nome }).then(() => {
          navigation.replace('Menu');
        });
      })
      .catch((error) => {
        // Se o Firebase avisar que o e-mail já existe, mostramos na tela também!
        if (error.code === 'auth/email-already-in-use') {
          setErros({ ...erros, email: 'Este e-mail já está cadastrado.' });
        } else {
          Alert.alert('Erro ao criar conta', error.message);
        }
      });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FDF8F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Tata Sorteia</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Como quer ser chamado?"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, erros.email && styles.inputError]} // Fica com borda vermelha se tiver erro
            placeholder="Digite seu melhor e-mail"
            value={email}
            // MÁGICA: Força TUDO a ficar minúsculo enquanto ele digita!
            onChangeText={(texto) => setEmail(texto.toLowerCase())} 
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {/* MENSAGEM DE ERRO ESPECÍFICA */}
          {erros.email && <Text style={styles.errorText}>{erros.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erros.senha && styles.inputError]}
            placeholder="Crie uma senha forte"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />
          {erros.senha && <Text style={styles.errorText}>{erros.senha}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={[styles.input, erros.confirmarSenha && styles.inputError]}
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            autoCapitalize="none"
          />
          {erros.confirmarSenha && <Text style={styles.errorText}>{erros.confirmarSenha}</Text>}
        </View>

        {/* 🔥 BOTÃO DINÂMICO QUE ACENDE QUANDO ESTÁ VÁLIDO */}
        <TouchableOpacity
          style={[styles.button, !formularioValido && styles.buttonDisabled]}
          onPress={handleCadastroReal}
          disabled={!formularioValido}
        >
          <Text style={styles.buttonText}>CADASTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Image
            source={require('../../assets/images/google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            Cadastrar com o Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>
            Já tem uma conta? <Text style={styles.backTextBold}>Faça Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 30, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 40 : 60, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#5C4B51', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#8C7A80', marginBottom: 30, textAlign: 'center' },
  inputContainer: { width: '100%', marginBottom: 15 },
  label: { fontSize: 16, color: '#5C4B51', fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#FFF', height: 55, borderRadius: 15, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#FADBD8', color: '#5C4B51' },
  
  // 🔥 NOVOS ESTILOS DE ERRO
  inputError: { borderColor: '#E74C3C', borderWidth: 2 }, // Borda vermelha chamativa
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 5, fontWeight: 'bold', marginLeft: 5 }, // Texto vermelho embaixo

  button: { backgroundColor: '#FF6B9D', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 15, elevation: 2 },
  buttonDisabled: { backgroundColor: '#F8C9D0', elevation: 0 }, // Cor clarinha quando incompleto
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  googleButton: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFF', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#CCC' },
  googleIcon: { width: 24, height: 24, marginRight: 10, resizeMode: 'contain' },
  googleButtonText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  backButton: { marginTop: 25, padding: 10 },
  backText: { fontSize: 16, color: '#8C7A80' },
  backTextBold: { color: '#FF6B9D', fontWeight: 'bold' },
});