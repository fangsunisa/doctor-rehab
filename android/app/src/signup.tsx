import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- ฟังก์ชันช่วยเหลือสำหรับจัดการปฏิทินเลือกวันเกิด ---
const monthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function formatDate(date: Date): string {
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

// Component ปฏิทินเลือกวันเกิด
function BirthCalendarModal({
  visible,
  initialDate,
  onClose,
  onSelect,
}: {
  visible: boolean;
  initialDate: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}) {
  const initial = parseDate(initialDate) ?? new Date(1995, 0, 1);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const selectedDate = parseDate(initialDate);

  const changeMonth = (amount: number) => {
    const next = new Date(viewYear, viewMonth + amount, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const changeYear = (amount: number) => {
    setViewYear((prev) => prev + amount);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.calendarBackdrop}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>เลือกวันเดือนปีเกิด</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.yearMonthNav}>
            <View style={styles.navGroup}>
              <TouchableOpacity style={styles.monthArrow} onPress={() => changeYear(-1)}>
                <Text style={styles.monthArrowText}>«</Text>
              </TouchableOpacity>
              <Text style={styles.navTitleText}>{viewYear}</Text>
              <TouchableOpacity style={styles.monthArrow} onPress={() => changeYear(1)}>
                <Text style={styles.monthArrowText}>»</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navGroup}>
              <TouchableOpacity style={styles.monthArrow} onPress={() => changeMonth(-1)}>
                <Text style={styles.monthArrowText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.navTitleText}>{monthNames[viewMonth]}</Text>
              <TouchableOpacity style={styles.monthArrow} onPress={() => changeMonth(1)}>
                <Text style={styles.monthArrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarGrid}>
            {weekDays.map((day, index) => (
              <View key={`wd-${index}`} style={styles.calendarCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.calendarCell} />;
              }
              const currentDate = formatDate(new Date(viewYear, viewMonth, day));
              const selected = selectedDate !== null && currentDate === formatDate(selectedDate);

              return (
                <TouchableOpacity
                  key={currentDate}
                  style={[styles.calendarCell, styles.calendarDay, selected && styles.calendarDaySelected]}
                  onPress={() => onSelect(currentDate)}
                >
                  <Text style={[styles.calendarDayText, selected && styles.calendarDayTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SignupHnScreen({ route, navigation }: { route?: any; navigation: any }) {
  const patientId = route?.params?.patientId || (Platform.OS === 'web' ? new URLSearchParams(window.location.search).get('patientId') : null);

  // --- Form State (เพิ่ม password กลับเข้ามา) ---
  const [hn, setHn] = useState('HN');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // 🟢 เพิ่ม State สำหรับรหัสผ่าน
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');

  // Caregiver
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverRelation, setCaregiverRelation] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('');

  // Assessment
  const [severity, setSeverity] = useState('');
  const [symptom, setSymptom] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Calendar Modal State
  const [calendarVisible, setCalendarVisible] = useState(false);

  // 🟢 ดึงข้อมูลเดิมมาแสดงอัตโนมัติเมื่อมี patientId
  useEffect(() => {
    if (patientId && patientId !== '--' && patientId !== '-') {
      console.log('กำลังดึงข้อมูลผู้ป่วย ID:', patientId);
      console.log('รหัสผ่านที่จะส่งไป:', password);
      fetch(`http://localhost:3000/api/doctor/patient/${patientId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            const formatHnVal = data.HN || data.hn || (data.PatientID ? `HN${String(data.PatientID).padStart(5, '0')}` : `HN${String(patientId).padStart(5, '0')}`);
            setHn(formatHnVal);
            setNationalId(data.National_ID || data.nationalId || '');
            setPhone(data.Phone || data.phone || '');
            setPassword(data.Password || data.password || ''); // 🟢 ดึงรหัสผ่านเดิมมาแสดง (ถ้ามี)
            setTitle(data.Title || data.title || '');
            setFirstName(data.First_Name || data.firstName || '');
            setLastName(data.Last_Name || data.lastName || '');
            setGender(data.Gender || data.gender || '');

            const rawDob = data.DOB || data.dob;
            if (rawDob) {
              const d = new Date(rawDob);
              if (!isNaN(d.getTime())) {
                setBirthDate(formatDate(d));
              }
            }

            setNationality(data.Nationality || data.nationality || '');
            setCaregiverName(data.Caregiver_Name || data.caregiverName || '');
            setCaregiverRelation(data.Caregiver_Relation || data.caregiverRelation || '');
            setCaregiverPhone(data.Caregiver_Phone || data.caregiverPhone || '');
            setSeverity(data.Baseline_Assessment || data.baselineAssessment || '');
            setSymptom(data.Medical_Condition || data.medicalCondition || '');
            setDoctorNotes(data.Doctor_Notes || data.doctorNotes || '');
          }
        })
        .catch((err) => console.error('Error fetching patient details:', err));
    }
  }, [patientId]);

  const handleHnChange = (text: string) => {
    if (!text.startsWith('HN')) {
      setHn('HN');
    } else {
      setHn(text);
    }
  };

const handleSubmit = async () => {
    if (!firstName || !lastName || !nationalId || !hn || !phone) {
      const warningMsg = 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รหัส HN, เลขบัตรประชาชน, เบอร์โทร, ชื่อ, นามสกุล)';
      if (Platform.OS === 'web') alert(warningMsg);
      else Alert.alert('แจ้งเตือน', warningMsg);
      return;
    }

    const endpoint = patientId
      ? `http://localhost:3000/api/doctor/patient/${patientId}`
      : 'http://localhost:3000/api/doctor/add-patient';

    const method = patientId ? 'PUT' : 'POST';

   try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: 1,
          hn: hn,
          phone: phone,
          password: password, // 🟢 ต้องมีบรรทัดนี้ เพื่อส่งรหัสผ่านไปที่ Backend
          firstName: firstName,
          lastName: lastName,
          gender: gender || '',
          dob: birthDate || null,
          nationality: nationality || '',
          caregiverName: caregiverName || '',
          caregiverRelation: caregiverRelation || '',
          caregiverPhone: caregiverPhone || '',
          baselineAssessment: severity || '',
          medicalCondition: symptom || '',
          doctorNotes: doctorNotes || '',
          nationalId: nationalId,
        }),
      });
      
      const result = await response.json();

      if (response.ok) {
        if (navigation?.navigate) {
          navigation.navigate('Patient');
        }
      } else {
        const errorMsg = 'บันทึกไม่สำเร็จ: ' + (result.error || result.message);
        if (Platform.OS === 'web') alert(errorMsg);
        else Alert.alert('ผิดพลาด', errorMsg);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      const connErr = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Backend ได้';
      if (Platform.OS === 'web') alert(connErr);
      else Alert.alert('ข้อผิดพลาด', connErr);
    }
  };

  const handleSelectAll = (e: any) => {
    if (Platform.OS === 'web') {
      const target = e.target || e.nativeEvent?.target;
      if (target && typeof target.select === 'function') {
        target.select();
      }
    }
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Patient')}
          >
            <Text style={styles.menuItemText}>📊 แดชบอร์ด</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Exercise')}
          >
            <Text style={styles.menuItemText}>📁 คลังท่ากายภาพ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </TouchableOpacity>
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

          <TouchableOpacity
            style={styles.doctorProfile}
            onPress={() => navigation.navigate('ProfileDoctor')}
          >
            <View style={styles.doctorAvatar}>
              <Image
                source={require('./img/jenohighschool.jpg')}
                style={styles.doctorAvatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.doctorName}>หมอดิน</Text>
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE BODY CONTENT */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.pageHeaderTitle}>
              {patientId ? '✏️ แก้ไขข้อมูลส่วนตัวผู้ป่วย' : 'ระบุข้อมูลส่วนตัวผู้ป่วย (สร้างบัญชีเข้าใช้งานแอป)'}
            </Text>

            {/* Row 1: HN & National ID */}
            <View style={styles.grid2}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>รหัส HN (Hospital Number)</Text>
                <TextInput
                  style={[styles.input, patientId ? { backgroundColor: '#F1F5F9' } : {}]}
                  placeholder="เช่น HN66001"
                  placeholderTextColor="#94A3B8"
                  value={hn}
                  onChangeText={handleHnChange}
                  autoCapitalize="characters"
                  editable={!patientId}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>เลขบัตรประจำตัวประชาชน</Text>
                <TextInput
                  style={styles.input}
                  placeholder="เลขบัตร 13 หลัก"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={17}
                  value={nationalId}
                  onChangeText={setNationalId}
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
            </View>

            {/* Row 2: Highlight Phone & Password Box */}
            <View style={styles.highlightBox}>
              <View style={styles.grid2}>
                <View style={styles.formGroupFlex}>
                  <Text style={styles.highlightLabel}>
                    📱 เบอร์โทรศัพท์ผู้ป่วย (ใช้สำหรับเข้าสู่ระบบแอป)
                  </Text>
                  <TextInput
                    style={[styles.input, styles.bgWhite]}
                    placeholder="เช่น 0812345678"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    selectTextOnFocus={true}
                    onFocus={handleSelectAll}
                    onPressIn={handleSelectAll}
                  />
                </View>
                <View style={styles.formGroupFlex}>
                  <Text style={styles.highlightLabel}>
                    🔒 รหัสผ่านสำหรับเข้าสู่ระบบแอป (Password)
                  </Text>
                  <TextInput
                    style={[styles.input, styles.bgWhite]}
                    placeholder="กำหนดรหัสผ่าน"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    selectTextOnFocus={true}
                    onFocus={handleSelectAll}
                    onPressIn={handleSelectAll}
                  />
                </View>
              </View>
            </View>

            {/* Row 3: Title, FirstName, LastName */}
            <View style={styles.grid3}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>คำนำหน้า</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={title}
                    onValueChange={(val: any) => setTitle(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- เลือกคำนำหน้า --" value="" />
                    <Picker.Item label="นาย" value="นาย" />
                    <Picker.Item label="นาง" value="นาง" />
                    <Picker.Item label="นางสาว" value="นางสาว" />
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>ชื่อ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ชื่อจริง"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={setFirstName}
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>นามสกุล</Text>
                <TextInput
                  style={styles.input}
                  placeholder="นามสกุล"
                  placeholderTextColor="#94A3B8"
                  value={lastName}
                  onChangeText={setLastName}
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
            </View>

            {/* Row 4: Gender, BirthDate, Nationality */}
            <View style={styles.grid3}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>เพศ</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={(val: any) => setGender(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- เลือกเพศ --" value="" />
                    <Picker.Item label="ชาย" value="ชาย" />
                    <Picker.Item label="หญิง" value="หญิง" />
                  </Picker>
                </View>
              </View>

              {/* ช่องวันเดือนปีเกิดเปิดปฏิทิน */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>วันเดือนปีเกิด</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }]}
                  onPress={() => setCalendarVisible(true)}
                >
                  <Text style={{ flex: 1, color: birthDate ? '#1E293B' : '#94A3B8', fontSize: 14 }}>
                    {birthDate || 'YYYY-MM-DD'}
                  </Text>
                  <Text style={{ fontSize: 14 }}>📅</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>สัญชาติ</Text>
                <TextInput
                  style={styles.input}
                  value={nationality}
                  onChangeText={setNationality}
                  placeholder="สัญชาติ"
                  placeholderTextColor="#94A3B8"
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
            </View>

            {/* Caregiver Section */}
            <Text style={styles.sectionTitle}>
              ข้อมูลติดต่อผู้ดูแล (Caregiver / ญาติฉุกเฉิน)
            </Text>
            <View style={styles.grid3}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>ชื่อ-นามสกุลผู้ดูแล</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ชื่อญาติหรือผู้ดูแล"
                  placeholderTextColor="#94A3B8"
                  value={caregiverName}
                  onChangeText={setCaregiverName}
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>ความสัมพันธ์กับผู้ป่วย</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={caregiverRelation}
                    onValueChange={(val: any) => setCaregiverRelation(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- เลือกความสัมพันธ์ --" value="" />
                    <Picker.Item label="บิดา / มารดา" value="บิดา/มารดา" />
                    <Picker.Item label="บุตร" value="บุตร" />
                    <Picker.Item label="คู่สมรส" value="คู่สมรส" />
                    <Picker.Item label="อื่นๆ" value="อื่นๆ" />
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>เบอร์ติดต่อผู้ดูแล</Text>
                <TextInput
                  style={styles.input}
                  placeholder="เบอร์โทรศัพท์ผู้ดูแล"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={caregiverPhone}
                  onChangeText={setCaregiverPhone}
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
            </View>

            {/* Assessment Section */}
            <View style={styles.grid2}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>ประเมินระดับอาการเริ่มต้น</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={severity}
                    onValueChange={(val: any) => setSeverity(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- เลือกระดับอาการ --" value="" />
                    <Picker.Item label="เล็กน้อย" value="เล็กน้อย" />
                    <Picker.Item label="ปานกลาง" value="ปานกลาง" />
                    <Picker.Item label="รุนแรง" value="รุนแรง" />
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>อาการป่วย</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ระบุอาการป่วยเบื้องต้น"
                  placeholderTextColor="#94A3B8"
                  value={symptom}
                  onChangeText={setSymptom}
                  selectTextOnFocus={true}
                  onFocus={handleSelectAll}
                  onPressIn={handleSelectAll}
                />
              </View>
            </View>

            {/* Doctor Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                บันทึกข้อเสนอแนะจากนักกายภาพบำบัด (Doctor's Notes)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="พิมพ์คำแนะนำหรือข้อควรระวังในการทำกายภาพ..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={doctorNotes}
                onChangeText={setDoctorNotes}
                selectTextOnFocus={true}
                onFocus={handleSelectAll}
                onPressIn={handleSelectAll}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => navigation.navigate('Patient')}
              >
                <Text style={styles.btnSecondaryText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleSubmit}
              >
                <Text style={styles.btnPrimaryText}>
                  {patientId ? 'บันทึกการแก้ไข' : 'ยืนยันและบันทึกประวัติ'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal ปฏิทินเลือกวันเกิด */}
      <BirthCalendarModal
        visible={calendarVisible}
        initialDate={birthDate || '1995-01-01'}
        onClose={() => setCalendarVisible(false)}
        onSelect={(date) => {
          setBirthDate(date);
          setCalendarVisible(false);
        }}
      />
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
  pageHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  grid2: {
    flexDirection: 'row',
    gap: 16,
  },
  grid3: {
    flexDirection: 'row',
    gap: 16,
  },
  formGroup: {
    flex: 1,
    marginBottom: 15,
  },
  formGroupFlex: {
    flex: 1,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    height: 42,
  },
  picker: {
    height: 42,
    width: '100%',
  },
  highlightBox: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0288D1',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  highlightLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0288D1',
    marginBottom: 6,
  },
  bgWhite: {
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 90,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
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
  calendarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0288D1',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#888',
  },
  yearMonthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  monthArrow: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  monthArrowText: {
    color: '#0288D1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navTitleText: {
    color: '#263238',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 55,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: '#77838B',
    fontWeight: '700',
  },
  calendarDay: {
    borderRadius: 18,
  },
  calendarDaySelected: {
    backgroundColor: '#0288D1',
  },
  calendarDayText: {
    fontSize: 13,
    color: '#263238',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});