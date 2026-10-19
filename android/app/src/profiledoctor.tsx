import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
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

export default function ProfileDoctorScreen({ navigation, route }: { navigation?: any; route?: any }) {
  const [licenseNo, setLicenseNo] = useState('ก. ');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState(POSITION_OPTIONS[0]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // ดึง staffId ที่ส่งมาจากหน้าอื่น (ถ้าไม่มีให้ fallback ไปที่ 1)
  const staffId = route?.params?.staffId || 1;

  useEffect(() => {
    if (staffId) {
      fetchDoctorProfile();
    }
  }, [staffId]);

  // ดึงข้อมูลโปรไฟล์ตาม staffId จริงที่ล็อกอินหรือสมัครเข้ามา
  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/doctor/profile/${staffId}`);
      const data = await response.json();

      if (response.ok && data) {
        let rawLicense = data.License_Number || '';
        let cleanNumber = rawLicense.replace(/^(PT-|PT|ก\.\s*)/i, '').trim();
        rawLicense = 'ก. ' + cleanNumber;

        setLicenseNo(rawLicense);
        setFirstName(data.First_Name || '');
        setLastName(data.Last_Name || '');
        setDepartment(data.Department || 'แผนกเวชศาสตร์ฟื้นฟูและกายภาพบำบัด');
        setPosition(data.Position || POSITION_OPTIONS[0]);
        if (data.Profile_Image) {
          setProfileImage(data.Profile_Image);
        }
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const handleLicenseChange = (text: string) => {
    if (!text.startsWith('ก. ')) {
      setLicenseNo('ก. ');
    } else {
      setLicenseNo(text);
    }
  };

  // ฟังก์ชันช่วยให้พอกดคลิกช่อง input แล้วไฮไลต์เลือกข้อความทั้งหมดให้ทันที (แก้/ลบง่ายในคลิกเดียว)
  const handleSelectAll = (e: any) => {
    if (Platform.OS === 'web') {
      const target = e.target || e.nativeEvent?.target;
      if (target && typeof target.select === 'function') {
        target.select();
      }
    }
  };

  const handlePickImage = () => {
    if (Platform.OS === 'web') {
      const input = (window as any).document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (uploadEvent: any) => {
            setProfileImage(uploadEvent.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const goToPatient = () => {
    if (navigation?.navigate) {
      // ส่ง staffId กลับไปด้วยเพื่อให้หน้า Patient แสดงข้อมูลหมอคนปัจจุบันถูกต้อง
      navigation.navigate('Patient', { staffId: staffId });
    }
  };

  // เมื่อกดบันทึก จะอัปเดตข้อมูลและเด้งไปหน้า Patient ทันที (ไม่มีป๊อปอัพกวนใจ)
  const handleSave = async () => {
    if (!firstName || !licenseNo || licenseNo === 'ก. ') {
      if (Platform.OS === 'web') {
        alert('กรุณากรอกเลขทะเบียนประกอบวิชาชีพและชื่อให้ครบถ้วน');
      } else {
        Alert.alert('แจ้งเตือน', 'กรุณากรอกเลขทะเบียนประกอบวิชาชีพและชื่อให้ครบถ้วน');
      }
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/doctor/profile/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseNumber: licenseNo,
          firstName: firstName,
          lastName: lastName,
          department: department,
          position: position,
          profileImage: profileImage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 🟢 บันทึกสำเร็จแล้วเด้งไปหน้า Patient ทันทีโดยไม่มีป๊อปอัพแจ้งเตือน
        goToPatient();
      } else {
        const errorMsg = 'อัปเดตไม่สำเร็จ: ' + (result.error || result.message);
        if (Platform.OS === 'web') alert(errorMsg);
        else Alert.alert('ผิดพลาด', errorMsg);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const connErr = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Backend ได้';
      if (Platform.OS === 'web') alert(connErr);
      else Alert.alert('ข้อผิดพลาด', connErr);
    }
  };

  const fullNameDisplay = `${firstName} ${lastName}`.trim();

  return (
    <View style={styles.appContainer}>
      {/* 1. SIDEBAR MENU */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarBrand}>
          <Image
            source={require('./img/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>ReMotion Rehab</Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>เมนูระบบ</Text>
          
          <Pressable style={styles.menuItem} onPress={goToPatient}>
            <Text style={styles.menuItemText}>📊 แดชบอร์ด</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => navigation?.navigate('Exercise', { staffId: staffId })}>
            <Text style={styles.menuItemText}>📁 คลังท่ากายภาพ</Text>
          </Pressable>
        </View>

        <View style={styles.sidebarFooter}>
          <Pressable style={styles.logoutButton} onPress={() => navigation?.navigate('Login')}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. MAIN CONTENT WRAPPER */}
      <View style={styles.mainContent}>
        {/* TOP NAVIGATION BAR */}
        <View style={styles.topNavbar}>
          <View style={styles.searchBoxContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหาชื่อ หรือ รหัสผู้ป่วย (เช่น HN00145)..."
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.doctorProfile}>
            <View style={styles.doctorAvatar}>
              <Image
                source={profileImage ? { uri: profileImage } : require('./img/jenohighschool.jpg')}
                style={styles.doctorAvatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.doctorName}>{fullNameDisplay || 'กำลังโหลด...'}</Text>
          </View>
        </View>

        {/* SCROLLABLE BODY CONTENT */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            
            {/* Title Header */}
            <View style={styles.titleHeader}>
              <Text style={styles.titleHeaderText}>
                ตั้งค่าบัญชีผู้ใช้ (แพทย์ / นักกายภาพบำบัด)
              </Text>
            </View>

            {/* Profile Info Box */}
            <View style={styles.profileInfoCard}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={profileImage ? { uri: profileImage } : require('./img/jenohighschool.jpg')}
                  style={styles.profileAvatar}
                />
                <TouchableOpacity onPress={handlePickImage}>
                  <Text style={styles.btnEditPhoto}>แก้ไขรูปภาพ</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profileTextWrapper}>
                <Text style={styles.doctorNameMain}>{fullNameDisplay || 'กำลังโหลด...'}</Text>
                <Text style={styles.doctorDeptMain}>
                  {department || 'แผนกเวชศาสตร์ฟื้นฟูและกายภาพบำบัด'}
                </Text>
                <Text style={styles.doctorDeptSub}>
                  {position ? `(${position})` : '(Rehabilitation Department)'}
                </Text>
              </View>
            </View>

            {/* Form Title */}
            <Text style={styles.sectionTitle}>
              ข้อมูลทางวิชาชีพและโรงพยาบาล
            </Text>

            {/* Form Grid */}
            <View style={styles.formGrid2}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>เลขทะเบียนประกอบวิชาชีพ</Text>
                <TextInput
                  style={styles.input}
                  value={licenseNo}
                  onChangeText={handleLicenseChange}
                  placeholder="ก. 54321"
                  placeholderTextColor="#94A3B8"
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ชื่อ</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="กรอกชื่อ..."
                  placeholderTextColor="#94A3B8"
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
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
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>แผนกสังกัด (Department)</Text>
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="กรอกแผนกสังกัด..."
                  placeholderTextColor="#94A3B8"
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
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

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={goToPatient}
              >
                <Text style={styles.btnSecondaryText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
                <Text style={styles.btnPrimaryText}>บันทึก</Text>
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
    ...Platform.select({
      web: { minHeight: '100vh' } as any,
    }),
  },
  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    padding: 20,
    justifyContent: 'space-between',
    ...Platform.select({
      web: { height: '100vh', position: 'sticky', top: 0 } as any,
    }),
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  brandLogo: {
    width: 100,
    height: 100,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0288D1',
  },
  menuSection: {
    flex: 1,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  topNavbar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: 350,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    padding: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  doctorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  doctorAvatarImage: {
    width: '100%',
    height: '100%',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollContainer: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        elevation: 3,
      },
    }),
  },
  titleHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  titleHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  profileInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },
  avatarWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  btnEditPhoto: {
    color: '#0288D1',
    fontSize: 12,
    fontWeight: '600',
  },
  profileTextWrapper: {
    justifyContent: 'center',
  },
  doctorNameMain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  doctorDeptMain: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  doctorDeptSub: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  formGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formGroup: {
    width: '48%',
    minWidth: 260,
    marginBottom: 15,
  },
  formGroupFull: {
    width: '100%',
    marginBottom: 15,
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
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
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
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0288D1',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});