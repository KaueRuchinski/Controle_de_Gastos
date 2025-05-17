import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from "react-native";
import { auth, signOut, db } from '../firebase';
import { DangerButton, PrimaryButton } from "../components/Button.js";
import { CustomTextInput } from "../components/CustomInput.js";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { MaterialIcons } from '@expo/vector-icons'; // ícones reais

export default function HomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'records'), where('user_id', '==', user.uid))
      );
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      const sorted = records.sort((a, b) => b.date.localeCompare(a.date));
      setList(sorted);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const add = async () => {
    if (!description || !value) {
      console.log('Preencha todos os campos.');
      return;
    }

    try {
      await addDoc(collection(db, 'records'), {
        description,
        value: parseFloat(value),
        date: moment().format('YYYY-MM-DD'),
        user_id: user.uid,
      });
      setDescription('');
      setValue('');
      loadRecords();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
    }
  };

  const updateRecord = async (id) => {
    if (!editingDescription || !editingValue) return;
    try {
      const recordRef = doc(db, "records", id);
      await updateDoc(recordRef, {
        description: editingDescription,
        value: parseFloat(editingValue),
      });
      setEditingId(null);
      setEditingDescription('');
      setEditingValue('');
      loadRecords();
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const recordRef = doc(db, "records", id);
      await deleteDoc(recordRef);
      loadRecords();
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const groupedByDate = list.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const totalValue = list.reduce((sum, item) => sum + item.value, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <Text style={styles.title}>Total de Gastos</Text>
      <Text style={styles.totalValue}>R$ {totalValue.toFixed(2)}</Text>

      <TouchableOpacity
        style={styles.accountButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.accountText}>👤 Minha Conta</Text>
      </TouchableOpacity>

      <DangerButton text={'Desconectar'} action={logout} />

      <CustomTextInput placeholder={'Descrição do gasto'} value={description} setValue={setDescription} />
      <CustomTextInput placeholder={'Valor'} value={value} setValue={setValue} keyboardType="numeric" />
      <PrimaryButton text="➕ Adicionar Gasto" action={add} />

      <ScrollView style={styles.scroll}>
        {Object.keys(groupedByDate).map(date => (
          <View key={date}>
            <Text style={styles.dateHeader}>{moment(date).format('DD/MM/YYYY')}</Text>
            {groupedByDate[date].map(item => (
              <View key={item.id} style={styles.row}>
                {editingId === item.id ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editingDescription}
                      onChangeText={setEditingDescription}
                      placeholder="Descrição"
                    />
                    <TextInput
                      style={styles.input}
                      value={String(editingValue)}
                      onChangeText={setEditingValue}
                      keyboardType="numeric"
                      placeholder="Valor"
                    />
                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => updateRecord(item.id)}>
                        <Text style={styles.save}>✔️ Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        setEditingId(null);
                        setEditingDescription('');
                        setEditingValue('');
                      }}>
                        <Text style={styles.cancel}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.inlineRow}>
                    <View style={styles.textBlock}>
                      <Text style={styles.recordText}>{item.description}</Text>
                      <Text style={styles.valueText}>R$ {item.value.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                      setEditingId(item.id);
                      setEditingDescription(item.description);
                      setEditingValue(String(item.value));
                    }}>
                      <MaterialIcons name="edit" size={24} color="#1976D2" style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteRecord(item.id)}>
                      <MaterialIcons name="delete" size={24} color="#D32F2F" style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#1976D2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  totalValue: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  accountButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginBottom: 20,
    minWidth: 170,
    alignItems: 'center',
    elevation: 3,
  },
  accountText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  scroll: {
    marginTop: 10,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  row: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
  },
  recordText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 6,
    marginBottom: 6,
    fontSize: 16,
  },
  icon: {
    marginLeft: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 8,
  },
  save: {
    color: '#388E3C',
    fontWeight: 'bold',
    marginRight: 16,
    fontSize: 16,
  },
  cancel: {
    color: '#757575',
    fontWeight: '500',
    fontSize: 16,
  },
});
