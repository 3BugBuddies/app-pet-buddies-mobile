import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { onSessionExpired } from '../../repository/apiClient';
import { login, saveSession } from '../../repository/authRepository';
import { AuthContext } from '../../context/authContext';
import { colors, radii, spacing } from '../../styles/theme';

export function SessionExpiredModal() {
  const { clearSession, setSession } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setVisible(true);
      setError('');
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!visible) return null;

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const newSession = await login({ email, senha });
      await saveSession(newSession);
      setSession(newSession);
      setVisible(false);
      setSenha('');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    clearSession();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>⚠️ Sessão Expirada</Text>
          <Text style={styles.text}>
            Por segurança, precisamos confirmar que é você. Fique tranquilo, o que você estava digitando não foi perdido.
          </Text>
          
          <Input 
            label="E-mail" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input 
            label="Senha" 
            value={senha} 
            onChangeText={setSenha} 
            secureTextEntry
          />
          
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <View style={styles.flexHalf}>
              <Button label="Sair" variant="secondary" onPress={handleCancel} disabled={loading} />
            </View>
            <View style={styles.flexHalf}>
              <Button label="Entrar" onPress={handleLogin} loading={loading} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radii.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  error: {
    color: colors.error,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flexHalf: {
    flex: 1,
  },
});
