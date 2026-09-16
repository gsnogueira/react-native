import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { useFinance } from '../FinanceContext';
import { Transaction, TransactionInput, TransactionType } from '../../types/finance';

const categories = ['Alimentação', 'Casa', 'Transporte', 'Lazer', 'Salário', 'Saúde', 'Outros'];
const today = new Date().toISOString().slice(0, 10);
const TransactionFormScreen = ({ route, navigation }: any) => {
  const { saveTransaction } = useFinance();
  const existing = route?.params?.transaction as Transaction | undefined;
  const [title, setTitle] = useState(existing?.title || '');
  const [amount, setAmount] = useState(existing ? String(existing.amount).replace('.', ',') : '');
  const [type, setType] = useState<TransactionType>(existing?.type || 'expense');
  const [category, setCategory] = useState(existing?.category || 'Alimentação');
  const [date, setDate] = useState(existing?.date || today);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [receiptUri, setReceiptUri] = useState(existing?.receiptUrl || '');
  const chooseReceipt = async () => {
    try {
      const document = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.images, DocumentPicker.types.pdf], presentationStyle: 'fullScreen' });
      setReceiptUri(document.uri);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) Alert.alert('Anexo indisponível', 'Não foi possível selecionar o documento.');
    }
  };
  const submit = async () => {
    const numericAmount = Number(amount.replace(',', '.'));
    if (title.trim().length < 2 || !numericAmount || numericAmount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { Alert.alert('Dados inválidos', 'Informe título, valor maior que zero e data no formato AAAA-MM-DD.'); return; }
    const input: TransactionInput = { title, amount, type, category, date, notes, receiptUri };
    try { await saveTransaction(input, existing?.id); navigation.goBack(); } catch (error) { Alert.alert('Erro ao salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>{existing ? 'EDITAR' : 'NOVO LANÇAMENTO'}</Text><Text style={styles.title}>{existing ? 'Atualize os detalhes' : 'Onde foi seu dinheiro?'}</Text><View style={styles.segment}><TouchableOpacity style={[styles.segmentItem, type === 'expense' && styles.segmentActive]} onPress={() => setType('expense')}><Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Saída</Text></TouchableOpacity><TouchableOpacity style={[styles.segmentItem, type === 'income' && styles.segmentActiveGreen]} onPress={() => setType('income')}><Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Entrada</Text></TouchableOpacity></View><Text style={styles.label}>Título</Text><TextInput style={styles.input} placeholder="Ex.: Mercado do mês" placeholderTextColor="#89918a" value={title} onChangeText={setTitle} /><Text style={styles.label}>Valor</Text><TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#89918a" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} /><Text style={styles.label}>Categoria</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>{categories.map(item => <TouchableOpacity key={item} style={[styles.category, category === item && styles.categoryActive]} onPress={() => setCategory(item)}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></TouchableOpacity>)}</ScrollView><Text style={styles.label}>Data</Text><TextInput style={styles.input} placeholder="AAAA-MM-DD" placeholderTextColor="#89918a" value={date} onChangeText={setDate} /><Text style={styles.label}>Observação</Text><TextInput style={[styles.input, styles.notes]} placeholder="Um detalhe útil para o futuro" placeholderTextColor="#89918a" multiline value={notes} onChangeText={setNotes} /><Text style={styles.label}>Recibo ou anexo</Text><TouchableOpacity style={styles.attachment} onPress={chooseReceipt}><Text style={styles.attachmentText}>{receiptUri ? 'Recibo selecionado' : 'Selecionar imagem ou PDF'}</Text></TouchableOpacity><TextInput style={styles.input} placeholder="Ou cole a URI do documento" placeholderTextColor="#89918a" value={receiptUri} onChangeText={setReceiptUri} autoCapitalize="none" /><TouchableOpacity style={styles.save} onPress={submit}><Text style={styles.saveText}>{existing ? 'Salvar alterações' : 'Salvar transação'}</Text></TouchableOpacity></ScrollView></KeyboardAvoidingView>;
};
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#f4f0e8' }, content: { padding: 22, paddingBottom: 40 }, eyebrow: { color: '#e36b3d', fontSize: 11, letterSpacing: 2, fontWeight: '800' }, title: { color: '#18352f', fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 24 }, segment: { flexDirection: 'row', backgroundColor: '#e8e3d9', borderRadius: 12, padding: 4, marginBottom: 22 }, segmentItem: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 9 }, segmentActive: { backgroundColor: '#e36b3d' }, segmentActiveGreen: { backgroundColor: '#347b5c' }, segmentText: { color: '#60716b', fontWeight: '800' }, segmentTextActive: { color: '#fffdf9' }, label: { color: '#52615a', fontSize: 12, fontWeight: '800', marginBottom: 7, marginTop: 12 }, input: { backgroundColor: '#fffdf9', borderWidth: 1, borderColor: '#e4ddcf', borderRadius: 11, padding: 14, color: '#18352f', fontSize: 15 }, notes: { minHeight: 92, textAlignVertical: 'top' }, categoryList: { gap: 8 }, category: { borderRadius: 18, backgroundColor: '#e8e3d9', paddingHorizontal: 12, paddingVertical: 9 }, categoryActive: { backgroundColor: '#18352f' }, categoryText: { color: '#60716b', fontSize: 12, fontWeight: '700' }, categoryTextActive: { color: '#fffdf9' }, attachment: { backgroundColor: '#fffdf9', borderWidth: 1, borderStyle: 'dashed', borderColor: '#e36b3d', borderRadius: 11, padding: 14, alignItems: 'center' }, attachmentText: { color: '#e36b3d', fontWeight: '800' }, save: { backgroundColor: '#18352f', borderRadius: 12, alignItems: 'center', padding: 16, marginTop: 28 }, saveText: { color: '#fffdf9', fontWeight: '800', fontSize: 16 }, });
export default TransactionFormScreen;