import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFinance } from '../FinanceContext';

const money = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
const categories = ['Todas', 'Alimentação', 'Casa', 'Transporte', 'Lazer', 'Salário', 'Saúde', 'Outros'];

const TransactionsScreen = ({ navigation }: any) => {
  const { transactions, removeTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => transactions.filter(item => {
    const matchesSearch = `${item.title} ${item.notes || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === 'Todas' || item.category === category);
  }), [transactions, search, category]);
  const visible = useMemo(() => filtered.slice(0, page * 8), [filtered, page]);

  const deleteItem = (id: string) => Alert.alert('Excluir transação?', 'Esta ação não pode ser desfeita.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => removeTransaction(id) }]);
  return <View style={styles.screen}><View style={styles.header}><View><Text style={styles.eyebrow}>MOVIMENTAÇÕES</Text><Text style={styles.title}>Transações</Text></View><TouchableOpacity style={styles.add} onPress={() => navigation.navigate('TransactionForm')}><Text style={styles.addText}>+</Text></TouchableOpacity></View>
    <TextInput style={styles.search} placeholder="Buscar por título ou observação" placeholderTextColor="#89918a" value={search} onChangeText={value => { setSearch(value); setPage(1); }} />
    <FlatList horizontal showsHorizontalScrollIndicator={false} data={categories} keyExtractor={item => item} contentContainerStyle={styles.filters} renderItem={({ item }) => <TouchableOpacity style={[styles.filter, category === item && styles.filterActive]} onPress={() => { setCategory(item); setPage(1); }}><Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>} />
    <FlatList data={visible} keyExtractor={item => item.id} initialNumToRender={8} maxToRenderPerBatch={8} windowSize={5} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Nenhuma transação encontrada.</Text>} renderItem={({ item }) => <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('TransactionForm', { transaction: item })} onLongPress={() => deleteItem(item.id)}><View style={[styles.icon, { backgroundColor: item.type === 'income' ? '#d9e6d7' : '#fae1d5' }]}><Text style={styles.iconText}>{item.type === 'income' ? '+' : '-'}</Text></View><View style={styles.info}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.meta}>{item.category} · {item.date}</Text></View><Text style={[styles.amount, { color: item.type === 'income' ? '#347b5c' : '#c95832' }]}>{item.type === 'income' ? '+' : '-'} {money(item.amount)}</Text></TouchableOpacity>} onEndReached={() => visible.length < filtered.length && setPage(value => value + 1)} onEndReachedThreshold={0.4} ListFooterComponent={visible.length < filtered.length ? <Text style={styles.loading}>Carregando mais...</Text> : null} />
  </View>;
};
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#f4f0e8', padding: 22 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, eyebrow: { color: '#e36b3d', fontSize: 11, letterSpacing: 2, fontWeight: '800' }, title: { color: '#18352f', fontSize: 28, fontWeight: '800', marginTop: 5 }, add: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#18352f', alignItems: 'center', justifyContent: 'center' }, addText: { color: '#fffdf9', fontSize: 28, lineHeight: 30 }, search: { backgroundColor: '#fffdf9', borderRadius: 12, padding: 14, color: '#18352f', borderWidth: 1, borderColor: '#e4ddcf', marginBottom: 12 }, filters: { gap: 8, paddingBottom: 18 }, filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#e8e3d9' }, filterActive: { backgroundColor: '#18352f' }, filterText: { color: '#60716b', fontSize: 12, fontWeight: '700' }, filterTextActive: { color: '#fffdf9' }, list: { paddingBottom: 28 }, row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e4ddcf' }, icon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, iconText: { color: '#18352f', fontSize: 20, fontWeight: '800' }, info: { flex: 1 }, rowTitle: { color: '#18352f', fontSize: 15, fontWeight: '700' }, meta: { color: '#89918a', fontSize: 12, marginTop: 4 }, amount: { fontSize: 13, fontWeight: '800' }, empty: { textAlign: 'center', color: '#89918a', marginTop: 60 }, loading: { textAlign: 'center', color: '#89918a', padding: 16 }, });
export default TransactionsScreen;