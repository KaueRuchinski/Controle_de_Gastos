import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, signInWithEmailAndPassword } from '../firebase';
import { PrimaryButton, SecondaryButton } from '../components/Button.js';
import { EmailInput, PasswordInput } from '../components/CustomInput.js';
import { MaterialIcons } from '@expo/vector-icons'; // ícone de login

export default function LoginScreen() {
  const navigation = useNavigation();

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const login = async () => {
    if (!email || !password) {
      setErrorMessage('Informe o e-mail e senha.');
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

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log(user);
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  useEffect(() => {
    setErrorMessage('');
  }, [email, password]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name="login" size={48} color="#1976D2" />
        </View>

        <Text style={styles.title}>Bem-vindo!</Text>

        <EmailInput value={email} setValue={setEmail} />
        <PasswordInput value={password} setValue={setPassword} />

        <TouchableOpacity onPress={() => navigation.push('ForgotPassword')}>
          <Text style={styles.forgotText}>Esqueci a senha</Text>
        </TouchableOpacity>

        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        <PrimaryButton text={'Login'} action={login} />

        <Text style={styles.prompt}>Ainda não tem uma conta?</Text>

        <SecondaryButton
          text={'Registrar-se'}
          action={() => navigation.push('Register')}
        />
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
  forgotText: {
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 20,
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 16,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 10,
    fontWeight: '500',
  },
  prompt: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
});
