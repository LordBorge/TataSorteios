import { useContext, useEffect, useState } from 'react'; // Adicionamos useContext
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// IMPORTAMOS O MEGAFONE
import { ThemeContext } from '../context/ThemeContext';

export function NumbersScreen() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [resultado, setResultado] = useState(null);

  const [permitirRepeticao, setPermitirRepeticao] = useState(true);
  const [numerosSorteados, setNumerosSorteados] = useState([]);

  // ESCUTANDO O MEGAFONE
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    setNumerosSorteados([]);
    setResultado(null);
  }, [min, max, permitirRepeticao]);

  function handleSortear() {
    const numMin = parseInt(min);
    const numMax = parseInt(max);

    if (isNaN(numMin) || isNaN(numMax)) {
      Alert.alert('Ops!', 'Por favor, preencha os dois campos com números.');
      return;
    }
    if (numMin <= 0 || numMax <= 0) {
      Alert.alert('Atenção', 'Os números devem ser maiores que zero.');
      return;
    }
    if (numMin >= numMax) {
      Alert.alert('Ops!', 'O número inicial (De) deve ser menor que o número final (Até).');
      return;
    }

    const quantidadeTotal = numMax - numMin + 1;

    if (!permitirRepeticao) {
      if (numerosSorteados.length >= quantidadeTotal) {
        Alert.alert('Sorteio Concluído!', 'Todos os números deste intervalo já foram sorteados. O histórico foi resetado.');
        setNumerosSorteados([]); 
        return;
      }

      let numeroSorteado;
      do {
        numeroSorteado = Math.floor(Math.random() * quantidadeTotal) + numMin;
      } while (numerosSorteados.includes(numeroSorteado));

      setNumerosSorteados([...numerosSorteados, numeroSorteado]);
      setResultado(numeroSorteado);
    } else {
      const numeroSorteado = Math.floor(Math.random() * quantidadeTotal) + numMin;
      setResultado(numeroSorteado);
    }
  }

  return (
    // Aplicando a cor de fundo escura
    <ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.darkScrollContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Sortear um Número</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Defina o intervalo do sorteio</Text>

      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>De:</Text>
          <TextInput 
            style={[styles.input, isDarkMode && styles.darkInput]} // Input escuro
            value={min}
            onChangeText={setMin}
            keyboardType="numeric" 
            maxLength={6}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Até:</Text>
          <TextInput 
            style={[styles.input, isDarkMode && styles.darkInput]} // Input escuro
            value={max}
            onChangeText={setMax}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      </View>

      <View style={[styles.switchContainer, isDarkMode && styles.darkSwitchContainer]}>
        <Text style={[styles.switchLabel, isDarkMode && styles.darkLabel]}>Permitir repetição?</Text>
        <Switch
          value={permitirRepeticao}
          onValueChange={setPermitirRepeticao}
          trackColor={{ false: '#D1D1D1', true: '#3dd5f0' }}
          thumbColor={'#FFF'}
        />
      </View>

      <TouchableOpacity style={[styles.button, isDarkMode && styles.darkButton]} onPress={handleSortear}>
        <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>SORTEAR NÚMERO</Text>
      </TouchableOpacity>

      {resultado !== null && (
        <View style={[styles.resultContainer, isDarkMode && styles.darkResultContainer]}>
          <Text style={[styles.resultLabel, isDarkMode && styles.darkResultLabel]}>O número sorteado foi:</Text>
          <Text style={[styles.resultNumber, isDarkMode && styles.darkResultNumber]}>{resultado}</Text>
          
          {!permitirRepeticao && (
            <Text style={[styles.historicoText, isDarkMode && styles.darkHistoricoText]}>
              Sorteados: {numerosSorteados.length} de {parseInt(max) - parseInt(min) + 1}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // --- ESTILOS CLAROS (Originais) ---
  scrollContainer: { flexGrow: 1, backgroundColor: '#FDF8F5', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#5C4B51', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#8C7A80', marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 }, 
  inputGroup: { width: '45%' },
  label: { fontSize: 16, color: '#5C4B51', fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#FFF', height: 60, borderRadius: 15, fontSize: 24, textAlign: 'center', borderWidth: 2, borderColor: '#D4E6F1', color: '#5C4B51', fontWeight: 'bold' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  switchLabel: { fontSize: 16, color: '#5C4B51', fontWeight: 'bold' },
  historicoText: { marginTop: 15, fontSize: 14, color: '#FFF', fontWeight: 'bold' },
  button: { backgroundColor: '#D4E6F1', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  buttonText: { fontSize: 20, fontWeight: 'bold', color: '#5C4B51' },
  resultContainer: { marginTop: 30, alignItems: 'center', backgroundColor: '#3dd5f0', padding: 40, borderRadius: 20, width: '100%', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  resultLabel: { fontSize: 18, color: '#5C4B51', marginBottom: 10 },
  resultNumber: { fontSize: 80, fontWeight: 'bold', color: '#5C4B51' },

  // --- ESTILOS ESCUROS (A Mágica) ---
  darkScrollContainer: { backgroundColor: '#121212' },
  darkTitle: { color: '#FFF' },
  darkSubtitle: { color: '#B0B0B0' },
  darkLabel: { color: '#E0E0E0' },
  darkInput: { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#FFF' },
  darkSwitchContainer: { backgroundColor: '#1E1E1E' },
  darkButton: { backgroundColor: '#1E1E1E', borderColor: '#333', borderWidth: 1 },
  darkButtonText: { color: '#3dd5f0' }, // Texto do botão fica azul neon
  darkResultContainer: { backgroundColor: '#1E1E1E', borderColor: '#3dd5f0', borderWidth: 2 }, // Caixa escura com borda azul neon
  darkResultLabel: { color: '#B0B0B0' },
  darkResultNumber: { color: '#3dd5f0' }, // Número azul neon
  darkHistoricoText: { color: '#E0E0E0' }
});