import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const POSITION_OPTIONS = [
  'นักกายภาพบำบัด ระดับปฏิบัติการ',
  'นักกายภาพบำบัด ระดับชำนาญการ',
  'นักกายภาพบำบัด ระดับชำนาญการพิเศษ',
  'นักกายภาพบำบัด ระดับเชี่ยวชาญ',
  'นักกายภาพบำบัด ระดับเชี่ยวชาญพิเศษ',
];

export default function RegisterDoctorScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNo, setLicenseNo] = useState('ก. ');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('แผนกเวชศาสตร์ฟื้นฟูและกายภาพบำบัด');
  const [position, setPosition] = useState(POSITION_OPTIONS[0]);

  const handleLicenseChange = (text: string) => {
    if (!text.startsWith('ก. ')) {
      setLicenseNo('ก. ');
    } else {
      setLicenseNo(text);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !firstName || !licenseNo || licenseNo === 'ก. ') {
      if (Platform.OS === 'web') {
        alert('กรุณากรอกข้อมูลสำคัญ (อีเมล, รหัสผ่าน, ชื่อ, เลขทะเบียนวิชาชีพ) ให้ครบถ้วน');
      } else {
        Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลสำคัญ (อีเมล, รหัสผ่าน, ชื่อ, เลขทะเบียนวิชาชีพ) ให้ครบถ้วน');
      }
      return;
    }

    try {
      // 🟢 บังคับชี้ไปพอร์ต 3000 ตาม Backend จริงที่รันอยู่
      const response = await fetch('http://localhost:3000/api/doctor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          licenseNumber: licenseNo.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          department: department.trim(),
          position: position,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 🟢 ลงทะเบียนสำเร็จ เด้งไปหน้า Patient ทันทีโดยไม่มีป๊อปอัพกวนใจ
        if (navigation?.navigate) {
          navigation.navigate('Patient', { staffId: result.staffId || 1 });
        }
      } else {
        const errorMsg = result.message || 'ไม่สามารถลงทะเบียนได้';
        if (Platform.OS === 'web') alert(errorMsg);
        else Alert.alert('ผิดพลาด', errorMsg);
      }
    } catch (error) {
      console.error('Error registering doctor:', error);
      const connErr = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Backend ที่พอร์ต 3000 ได้ กรุณาตรวจสอบว่ารัน Node.js อยู่หรือไม่';
      if (Platform.OS === 'web') alert(connErr);
      else Alert.alert('ข้อผิดพลาด', connErr);
    }
  };

  return (
    <View style={styles.appContainer}>
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.titleHeader}>
              <Text style={styles.titleHeaderText}>🩺 สมัครสมาชิกบุคลากรทางการแพทย์ใหม่</Text>
              <Text style={styles.titleHeaderSub}>สร้างบัญชีแพทย์/นักกายภาพบำบัดเพื่อเข้าสู่ระบบ ReMotion Rehab</Text>
            </View>

            <View style={styles.formGrid2}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>อีเมลสำหรับเข้าสู่ระบบ (Email)</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="เช่น doctor2@remotion.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>รหัสผ่าน (Password)</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="กำหนดรหัสผ่าน"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>เลขทะเบียนประกอบวิชาชีพ</Text>
                <TextInput
                  style={styles.input}
                  value={licenseNo}
                  onChangeText={handleLicenseChange}
                  placeholder="ก. 54321"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ชื่อ</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="กรอกชื่อจริง..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>นามสกุล</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="กรอกนามสกุล..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>แผนกสังกัด (Department)</Text>
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="ระบุแผนก..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* ตำแหน่งทางวิชาชีพ แบบ Dropdown */}
              <View style={styles.formGroupFull}>
                <Text style={styles.label}>ตำแหน่งทางวิชาชีพ</Text>
                {Platform.OS === 'web' ? (
                  <select
                    value={position}
                    onChange={(e: any) => setPosition(e.target.value)}
                    style={styles.selectWeb}
                  >
                    {POSITION_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.pickerWrapperMobile}>
                    {POSITION_OPTIONS.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.optionBtnMobile,
                          position === opt && styles.optionBtnMobileSelected,
                        ]}
                        onPress={() => setPosition(opt)}
                      >
                        <Text
                          style={[
                            styles.optionTextMobile,
                            position === opt && styles.optionTextMobileSelected,
                          ]}
                        >
                          {position === opt ? '🔘 ' : '⚪ '} {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.btnSecondaryText}>กลับไปหน้าเข้าสู่ระบบ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
                <Text style={styles.btnPrimaryText}>ลงทะเบียน</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    ...Platform.select({ web: { minHeight: '100vh' } as any }),
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 24,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' } as any,
      default: { elevation: 3 },
    }),
  },
  titleHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  titleHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  titleHeaderSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  formGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formGroup: {
    width: '48%',
    minWidth: 260,
    marginBottom: 16,
  },
  formGroupFull: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  selectWeb: {
    width: '100%',
    height: '42px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '14px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
  } as any,
  pickerWrapperMobile: {
    gap: 8,
  },
  optionBtnMobile: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  optionBtnMobileSelected: {
    borderColor: '#0288D1',
    backgroundColor: '#E0F7FA',
  },
  optionTextMobile: {
    fontSize: 14,
    color: '#475569',
  },
  optionTextMobileSelected: {
    color: '#0288D1',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  btnSecondaryText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#0288D1',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});