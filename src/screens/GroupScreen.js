import { useContext, useEffect, useRef, useState } from 'react'; // <-- Adicionamos o useRef aqui!
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemeContext } from '../context/ThemeContext';

export function GroupScreen({ route }) {
  const { grupo, atualizarAlunos } = route.params;

  const [alunoNome, setAlunoNome] = useState('');
  const [alunos, setAlunos] = useState(grupo.alunos || []);
  
  const [modalVisible, setModalVisible] = useState(false); 
  const [ganhadorAtual, setGanhadorAtual] = useState(''); 

  const [permitirRepeticao, setPermitirRepeticao] = useState(true);
  const [nomesSorteados, setNomesSorteados] = useState([]); 
  const [ultimosSorteados, setUltimosSorteados] = useState([]); 

  const { isDarkMode } = useContext(ThemeContext);

  // 1. CRIAMOS O "ÍMÃ" PARA SEGURAR O FOCO DO TECLADO
  const inputRef = useRef(null);

  useEffect(() => {
    setNomesSorteados([]);
    setUltimosSorteados([]);
  }, [permitirRepeticao]);

  useEffect(() => {
    if (atualizarAlunos) {
      atualizarAlunos(grupo.id, alunos);
    }
  }, [alunos]);

  function handleAddAluno() {
    if (alunoNome.trim() === '') return;
    setAlunos([...alunos, alunoNome]);
    setAlunoNome('');
    
    // 2. MÁGICA DO FOCO: Força o teclado a continuar aberto após clicar no "+"
    inputRef.current?.focus(); 
  }

  function handleRemoveAluno(nomeDoAluno) {
    Alert.alert("Remover Participante", `Deseja remover ${nomeDoAluno} da lista?`, [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => setAlunos(alunos.filter(aluno => aluno !== nomeDoAluno)) }
    ]);
  }

  function handleRemoverTodos() {
    Alert.alert("Atenção", "Tem certeza que deseja apagar todos os participantes deste grupo?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => { setAlunos([]); setUltimosSorteados([]); setNomesSorteados([]); } }
    ]);
  }

  function handleSorteio() {
    if (alunos.length < 2) {
      Alert.alert("Atenção", "Adicione pelo menos dois participantes para realizar o sorteio.");
      return;
    }

    let disponiveis = [];

    if (!permitirRepeticao) {
      disponiveis = alunos.filter(a => !nomesSorteados.includes(a));
      
      if (disponiveis.length === 0) {
        Alert.alert("Sorteio Concluído!", "Todos os participantes já foram sorteados. O histórico será resetado.");
        setNomesSorteados([]);
        return;
      }
    } else {
      const maxHistorico = Math.min(3, alunos.length - 1); 
      disponiveis = alunos.filter(a => !ultimosSorteados.includes(a));
      if (disponiveis.length === 0) disponiveis = alunos;
    }

    const numeroSorteado = Math.floor(Math.random() * disponiveis.length);
    const ganhador = disponiveis[numeroSorteado];

    if (!permitirRepeticao) {
      setNomesSorteados([...nomesSorteados, ganhador]);
    } else {
      let novoHistorico = [...ultimosSorteados, ganhador];
      if (novoHistorico.length > 3) novoHistorico.shift(); 
      setUltimosSorteados(novoHistorico);
    }

    setGanhadorAtual(ganhador); 
    setModalVisible(true); 
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#FDF8F5' }} 
      contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.darkScrollContainer]}
      // "handled" garante que clicar fora do teclado ou dos botões feche o teclado!
      keyboardShouldPersistTaps="handled" 
    >
      
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)} >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>🎉TEMOS UM VENCEDOR!🎉</Text>
            <Text style={[styles.modalWinnerName, isDarkMode && styles.darkModalWinnerName]}>{ganhadorAtual}</Text>
            <TouchableOpacity style={[styles.closeButton, isDarkMode && styles.darkCloseButton]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeButtonText, isDarkMode && styles.darkCloseButtonText]}>Incrível!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Grupo: {grupo.nome}</Text>

      <View style={[styles.switchContainer, isDarkMode && styles.darkSwitchContainer]}>
        <Text style={[styles.switchLabel, isDarkMode && styles.darkLabel]}>Permitir repetição de nomes?</Text>
        <Switch
          value={permitirRepeticao}
          onValueChange={setPermitirRepeticao}
          trackColor={{ false: '#D1D1D1', true: '#3dd5f0' }}
          thumbColor={'#FFF'}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput 
          ref={inputRef} // 3. CONECTAMOS O ÍMÃ AQUI
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Nome do participante..."
          placeholderTextColor={isDarkMode ? '#888' : '#C0C0C0'}
          value={alunoNome}
          onChangeText={setAlunoNome}
          onSubmitEditing={handleAddAluno}
          blurOnSubmit={false} // 4. IMPEDE O TECLADO DE FECHAR AO APERTAR "CONCLUÍDO/ENTER"
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.button, isDarkMode && styles.darkButton]} onPress={handleAddAluno}>
          <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {alunos.map((item, index) => (
          <View key={index.toString()} style={[styles.cardAluno, isDarkMode && styles.darkCardAluno]}>
            <Text style={[styles.textoAluno, isDarkMode && styles.darkTextoAluno]}>{item}</Text>
            
            {!permitirRepeticao && nomesSorteados.includes(item) && (
              <Text style={[styles.jaSorteadoText, isDarkMode && styles.darkJaSorteadoText]}>(Já saiu)</Text>
            )}
            
            <TouchableOpacity 
              style={{ padding: 10 }} 
              onPress={() => handleRemoveAluno(item)}
            >
              <Text style={[styles.deleteText, isDarkMode && styles.darkDeleteText]}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {alunos.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleRemoverTodos}>
          <Text style={[styles.clearText, isDarkMode && styles.darkClearText]}>APAGAR TODOS</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.sorteioButton, isDarkMode && styles.darkSorteioButton]} onPress={handleSorteio}>
        <Text style={[styles.sorteioText, isDarkMode && styles.darkSorteioText]}>SORTEAR NOME</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20 },
  listContainer: { flex: 1, marginBottom: 10 }, 
  title: { fontSize: 24, fontWeight: 'bold', color: '#5C4B51', marginBottom: 15, textAlign: 'center' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  switchLabel: { fontSize: 16, color: '#5C4B51', fontWeight: 'bold' },
  jaSorteadoText: { fontSize: 12, color: '#8C7A80', fontStyle: 'italic', marginRight: 10 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#FFF', height: 55, borderRadius: 15, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#FADBD8', color: '#5C4B51' },
  button: { width: 55, height: 55, backgroundColor: '#FADBD8', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  buttonText: { color: '#5C4B51', fontSize: 24, fontWeight: 'bold' },
  cardAluno: { backgroundColor: '#FFF', padding: 10, paddingHorizontal: 15, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  textoAluno: { fontSize: 16, color: '#5C4B51', fontWeight: '500', flex: 1 },
  deleteText: { color: '#FFB6C1', fontWeight: 'bold' },
  clearButton: { padding: 15, alignItems: 'center', marginBottom: 10 },
  clearText: { color: '#FFB6C1', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },
  sorteioButton: { backgroundColor: '#D4E6F1', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  sorteioText: { color: '#5C4B51', fontSize: 20, fontWeight: 'bold' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { width: '85%', backgroundColor: '#3dd5f0', borderRadius: 25, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#5C4B51', marginBottom: 20 },
  modalWinnerName: { fontSize: 46, fontWeight: '900', color: '#ffffff', textAlign: 'center', marginBottom: 30, textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  closeButton: { backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 15, paddingHorizontal: 40, elevation: 2 },
  closeButtonText: { color: '#000000fb', fontWeight: 'bold', fontSize: 18 },

  darkScrollContainer: { backgroundColor: '#121212' },
  darkTitle: { color: '#FFF' },
  darkSwitchContainer: { backgroundColor: '#1E1E1E' },
  darkLabel: { color: '#E0E0E0' },
  darkInput: { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#FFF' },
  darkButton: { backgroundColor: '#333' }, 
  darkButtonText: { color: '#FFF' }, 
  darkCardAluno: { backgroundColor: '#1E1E1E', borderColor: '#333', borderWidth: 1 },
  darkTextoAluno: { color: '#FFF' },
  darkJaSorteadoText: { color: '#888' },
  darkDeleteText: { color: '#B71C1C' }, 
  darkClearText: { color: '#FFB6C1' }, 
  darkSorteioButton: { backgroundColor: '#1E1E1E', borderColor: '#333', borderWidth: 1 },
  darkSorteioText: { color: '#3dd5f0' }, 
  darkModalView: { backgroundColor: '#1E1E1E', borderColor: '#3dd5f0', borderWidth: 2 }, 
  darkModalTitle: { color: '#B0B0B0' },
  darkModalWinnerName: { color: '#3dd5f0', textShadowColor: 'rgba(61, 213, 240, 0.4)' },
  darkCloseButton: { backgroundColor: '#3dd5f0' },
  darkCloseButtonText: { color: '#000' }
});