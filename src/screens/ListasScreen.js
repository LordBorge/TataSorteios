import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// IMPORTAMOS O MEGAFONE E O FIREBASE
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { ThemeContext } from '../context/ThemeContext';

export function ListasScreen({ navigation }) {
  const [grupoNome, setGrupoNome] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const { isDarkMode } = useContext(ThemeContext);

  // 1. CARREGAR OS DADOS (Lógica Híbrida Super Rápida)
  useEffect(() => {
    async function carregarGrupos() {
      try {
        // PASSO A: Carrega do celular instantaneamente (Zero Delay)
        const dadosSalvos = await AsyncStorage.getItem('@sorteio_grupos');
        if (dadosSalvos !== null) {
          setGrupos(JSON.parse(dadosSalvos)); 
        }
        setCarregando(false); // Já libera a tela pro usuário usar na hora!

        // PASSO B: Tenta puxar da nuvem em segundo plano para manter sincronizado
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists() && docSnap.data().grupos) {
            // Se a nuvem tiver dados, atualiza a tela e o celular silenciosamente
            setGrupos(docSnap.data().grupos);
            await AsyncStorage.setItem('@sorteio_grupos', JSON.stringify(docSnap.data().grupos));
          }
        }
      } catch (error) {
        // Se der erro de internet aqui, não mostramos Alerta, pois o app já carregou do celular!
      }
    }
    carregarGrupos();
  }, []);

  // 2. SALVAR OS DADOS AUTOMATICAMENTE (Salva no celular primeiro)
  useEffect(() => {
    async function salvarGrupos() {
      if (carregando) return; 
      
      try {
        // PASSO A: Salva no celular na velocidade da luz
        await AsyncStorage.setItem('@sorteio_grupos', JSON.stringify(grupos));

        // PASSO B: Tenta salvar na nuvem
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { grupos: grupos }, { merge: true }); 
        }
      } catch (error) {
        // Ignora silenciosamente, pois se a internet cair, já está salvo no celular!
      }
    }
    salvarGrupos();
  }, [grupos, carregando]);

  function handleAddGrupo() {
    if (grupoNome.trim() === '') return;
    const novoGrupo = { id: Date.now().toString(), nome: grupoNome, alunos: [] };
    setGrupos([...grupos, novoGrupo]);
    setGrupoNome('');
  }

  function atualizarAlunosDoGrupo(idDoGrupo, novosAlunos) {
    setGrupos(gruposAntigos => 
      gruposAntigos.map(grupo => grupo.id === idDoGrupo ? { ...grupo, alunos: novosAlunos } : grupo)
    );
  }

  function handleRemoveGrupo(grupo) {
    if (grupo.alunos && grupo.alunos.length > 0) {
      Alert.alert("Ação Bloqueada", "Este grupo ainda tem participantes. Entre nele e apague os nomes primeiro.");
      return; 
    }
    Alert.alert("Remover Grupo", `Deseja mesmo apagar o grupo "${grupo.nome}"?`, [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => setGrupos(grupos.filter(g => g.id !== grupo.id)) }
    ]);
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#FDF8F5' }} 
      contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.darkScrollContainer]}
      keyboardShouldPersistTaps="always" 
    >
      <View style={styles.inputContainer}>
        <TextInput 
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Nome da nova lista..."
          placeholderTextColor={isDarkMode ? '#888' : '#C0C0C0'}
          value={grupoNome} 
          onChangeText={setGrupoNome}
          onSubmitEditing={handleAddGrupo}
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.button, isDarkMode && styles.darkButton]} onPress={handleAddGrupo}>
          <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {grupos.map((item) => (
          <View key={item.id} style={[styles.cardGrupo, isDarkMode && styles.darkCardGrupo]}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => navigation.navigate('Group', { grupo: item, atualizarAlunos: atualizarAlunosDoGrupo })}
            >
              <Text style={[styles.textoGrupo, isDarkMode && styles.darkTextoGrupo]}>{item.nome}</Text>
              <Text style={[styles.textoQuantidade, isDarkMode && styles.darkTextoQuantidade]}>
                {item.alunos ? item.alunos.length : 0} participantes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.deleteButton, isDarkMode && styles.darkDeleteButton]} 
              onPress={() => handleRemoveGrupo(item)}
            >
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20 },
  listContainer: { flex: 1, marginBottom: 20 }, 
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#FFF', height: 55, borderRadius: 15, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#FADBD8', color: '#5C4B51' },
  button: { width: 55, height: 55, backgroundColor: '#FADBD8', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  buttonText: { color: '#5C4B51', fontSize: 24, fontWeight: 'bold' },
  cardGrupo: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, borderLeftWidth: 6, borderLeftColor: '#FADBD8' },
  textoGrupo: { fontSize: 18, fontWeight: 'bold', color: '#5C4B51' },
  textoQuantidade: { fontSize: 14, color: '#8C7A80', marginTop: 4 },
  deleteButton: { backgroundColor: '#FFB6C1', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 15 }, 
  deleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },

  darkScrollContainer: { backgroundColor: '#121212' },
  darkInput: { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#FFF' },
  darkButton: { backgroundColor: '#333' }, 
  darkButtonText: { color: '#FFF' }, 
  darkCardGrupo: { backgroundColor: '#1E1E1E', borderColor: '#333', borderWidth: 1, borderLeftColor: '#FFB6C1' },
  darkTextoGrupo: { color: '#FFF' },
  darkTextoQuantidade: { color: '#B0B0B0' },
  darkDeleteButton: { backgroundColor: '#B71C1C' } 
});