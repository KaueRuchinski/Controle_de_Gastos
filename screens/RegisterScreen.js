import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TextInput
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, createUserWithEmailAndPassword } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PrimaryButton, SecondaryButton } from '../components/Button.js';
import { EmailInput, PasswordInput } from '../components/CustomInput.js';
import { MaterialIcons } from '@expo/vector-icons'; // Ícone de registro

export default function RegisterScreen() {
  const navigation = useNavigation();

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const register = async () => {
    if (!name || !phone || !email || !password) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }

    if (!regexEmail.test(email)) {
      setErrorMessage('E-mail inválido');
      return;
    }

    if (!regexPassword.test(password)) {
      setErrorMessage('A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo');
      return;
    }

    setErrorMessage('');

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          name,
          phone,
          email
        });

        console.log('Usuário registrado:', user.uid);
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage(error.message);
      });
  };

  useEffect(() => {
    setErrorMessage('');
  }, [email, password, name, phone]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name="person-add-alt" size={48} color="#1976D2" />
        </View>

        <Text style={styles.title}>Registrar-se</Text>

        <TextInput
          placeholder="Nome completo"
          placeholderTextColor="#999"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Telefone"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <EmailInput value={email} setValue={setEmail} />
        <PasswordInput value={password} setValue={setPassword} />

        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        <PrimaryButton text={"Registrar-se"} action={register} />

        <Text style={styles.prompt}>Já tem uma conta?</Text>

        <SecondaryButton text={'Voltar para Login'} action={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 12,
    fontWeight: '500',
  },
  prompt: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
});
