import React, { useState } from 'react';
import {
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

export default function ProfileDoctorScreen({ navigation }: { navigation?: any }) {
  const [licenseNo, setLicenseNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  // ฟังก์ชันนำทางไปหน้ารายชื่อผู้ป่วย (Patient)
  const goToPatient = () => {
    if (navigation?.navigate) {
      navigation.navigate('Patient');
    }
  };

  const goToDashboard = () => {
    if (navigation?.navigate) {
      navigation.navigate('Dashboard');
    }
  };

  const goToExercise = () => {
    if (navigation?.navigate) {
      navigation.navigate('Exercise');
    }
  };

  const goToLogin = () => {
    if (navigation?.navigate) {
      navigation.navigate('Login');
    }
  };

  // กดบันทึกแล้วเปลี่ยนหน้าไปที่ Patient ทันทีโดยไม่มี Alert/Pop-up
  const handleSave = () => {
    goToPatient();
  };

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
          
          <Pressable style={styles.menuItem} onPress={goToDashboard}>
            <Text style={styles.menuItemText}>📊 แดชบอร์ด</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={goToExercise}>
            <Text style={styles.menuItemText}>📁 คลังท่ากายภาพ</Text>
          </Pressable>
        </View>

        <View style={styles.sidebarFooter}>
          <Pressable style={styles.logoutButton} onPress={goToLogin}>
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
                source={require('./img/jenohighschool.jpg')}
                style={styles.doctorAvatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.doctorName}>หมอดิน</Text>
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
                  source={require('./img/jenohighschool.jpg')}
                  style={styles.profileAvatar}
                />
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.btnEditPhoto}>แก้ไขรูปภาพ</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profileTextWrapper}>
                <Text style={styles.doctorNameMain}>นักกายภาพ หมอดิน</Text>
                <Text style={styles.doctorDeptMain}>
                  แผนกเวชศาสตร์ฟื้นฟูและกายภาพบำบัด
                </Text>
                <Text style={styles.doctorDeptSub}>
                  (Rehabilitation Department)
                </Text>
              </View>
            </View>

            {/* Form Title */}
            <Text style={styles.sectionTitle}>
              ข้อมูลทางวิชาชีพและโรงพยาบาล
            </Text>

            {/* Form Grid (2 Columns) */}
            <View style={styles.formGrid2}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>เลขทะเบียนประกอบวิชาชีพ</Text>
                <TextInput
                  style={styles.input}
                  value={licenseNo}
                  onChangeText={setLicenseNo}
                  placeholder="กรอกเลขทะเบียนประกอบวิชาชีพ..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ชื่อ-นามสกุล</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="กรอกชื่อ-นามสกุล..."
                  placeholderTextColor="#94A3B8"
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
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ตำแหน่งทางวิชาชีพ</Text>
                <TextInput
                  style={styles.input}
                  value={position}
                  onChangeText={setPosition}
                  placeholder="กรอกตำแหน่งทางวิชาชีพ..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {/* ปุ่มยกเลิก -> ไปหน้า Patient */}
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={goToPatient}
              >
                <Text style={styles.btnSecondaryText}>ยกเลิก</Text>
              </TouchableOpacity>

              {/* ปุ่มบันทึก -> ไปหน้า Patient ทันที */}
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