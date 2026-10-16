import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen({ navigation }: { navigation?: any }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      if (Platform.OS === 'web') {
        window.alert('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      } else {
        Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      }
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // นำทางไปที่หน้า Patient (หน้ารายชื่อผู้ป่วย)
      if (navigation?.navigate) {
        navigation.navigate('Patient');
      }
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.loginBody}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loginCard}>
          {/* Left Side Banner */}
          <View style={styles.loginBanner}>
            <View style={styles.brandHeader}>
              <Text style={styles.brandTitleMain}>ReMotion</Text>
              <Text style={styles.brandTitleSub}>Rehab</Text>
            </View>

            <View style={styles.bannerImgWrapper}>
              <Image
                source={require('./img/logo.png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Right Side Form */}
          <View style={styles.loginFormSection}>
            <Text style={styles.formTitle}>
              เข้าสู่ระบบสำหรับบุคลากรทางการแพทย์
            </Text>

            {/* Username / Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อผู้ใช้งาน / อีเมล</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIconText}>👤</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={styles.inputField}
                  placeholder="กรอกชื่อผู้ใช้งานหรืออีเมล..."
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รหัสผ่าน</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIconText}>🔒</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.inputField, { paddingRight: 50 }]}
                  placeholder="กรอกรหัสผ่าน..."
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.inputIconToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordWrapper}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.alert('กรุณาติดต่อผู้ดูแลระบบเพื่อขอรหัสผ่านใหม่');
                  } else {
                    Alert.alert('รีเซ็ตรหัสผ่าน', 'กรุณาติดต่อผู้ดูแลระบบเพื่อขอรหัสผ่านใหม่');
                  }
                }}
              >
                <Text style={styles.forgotPasswordLink}>ลืมรหัสผ่าน?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.btnSubmit, loading && styles.btnSubmitDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="large" />
              ) : (
                <Text style={styles.btnSubmitText}>เข้าสู่ระบบ (Login)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loginBody: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      } as any,
    }),
  },
  loginCard: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1300,
    minHeight: 650,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    flexWrap: 'wrap',
  },
  loginBanner: {
    flex: 1.2, // ปรับอัตราส่วนฝั่งรูปโลโก้ให้กว้างขึ้น
    minWidth: 450,
    backgroundColor: '#E3F2FD',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 25,
  },
  brandTitleMain: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  brandTitleSub: {
    fontSize: 34,
    fontWeight: '600',
    color: '#0288D1',
    marginLeft: 10,
  },
  bannerImgWrapper: {
    width: '100%',
    maxWidth: 450, // ขยายขนาดความกว้างโลโก้เพิ่มขึ้น
    height: 400,    // ขยายความสูงให้รูปเด่นตระการตา
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  loginFormSection: {
    flex: 1.3,
    minWidth: 450,
    padding: 60,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 26,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    height: 58,
  },
  inputIconText: {
    fontSize: 20,
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 17,
    color: '#1E293B',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  inputIconToggle: {
    position: 'absolute',
    right: 16,
    padding: 6,
  },
  forgotPasswordWrapper: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordLink: {
    color: '#0288D1',
    fontSize: 15,
    fontWeight: '500',
  },
  btnSubmit: {
    backgroundColor: '#0288D1',
    height: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSubmitDisabled: {
    backgroundColor: '#94A3B8',
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});