import React, { useMemo, useState, useEffect } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Category = 'easy' | 'hard';
type FilterCategory = 'all' | Category;

type Exercise = {
  id: number;
  name: string;
  category: Category;
  video: string;
};

type SelectedExercise = {
  exerciseId: number;
  checked: boolean;
  reps: string;
  sets: string;
};

type PatientItem = {
  id: string;
  name: string;
  hn: string;
  symptom: string;
};

const videoSources: Record<string, any> = {
  'calf_raises.mp4': require('./video/calf_raises.mp4'),
  'gait_toe_walk.mp4': require('./video/gait_toe_walk.mp4'),
  'hamstring_curls.mp4': require('./video/hamstring_curls.mp4'),
  'heel_raise.mp4': require('./video/heel_raise.mp4'),
  'heel_toe_walking.mp4': require('./video/heel_toe _walking.mp4'),
  'seated_knee_extensions.mp4': require('./video/seated_knee_extensions.mp4'),
  'side_leg_raise.mp4': require('./video/side_leg_raise.mp4'),
  'sit_to_stand.mp4': require('./video/sit_to_stand.mp4'),
  'squat.mp4': require('./video/squat.mp4'),
  'standing_knee_raise.mp4': require('./video/standing_knee_raise.mp4'),
  'step_touch.mp4': require('./video/step_touch.mp4'),
  'toe_raises.mp4': require('./video/toe_raises.mp4'),
};

const initialExercises: Exercise[] = [
  { id: 1, name: 'ท่านั่งเหยียดเข่า', category: 'easy', video: 'seated_knee_extensions.mp4' },
  { id: 2, name: 'ท่างอเข่า', category: 'easy', video: 'hamstring_curls.mp4' },
  { id: 3, name: 'ท่ายกขาออกไปด้านข้าง', category: 'easy', video: 'side_leg_raise.mp4' },
  { id: 4, name: 'ท่างอสะโพก', category: 'easy', video: 'standing_knee_raise.mp4' },
  { id: 5, name: 'ท่าลุกยืนและนั่งลงบนเก้าอี้', category: 'easy', video: 'sit_to_stand.mp4' },
  { id: 6, name: 'ท่าสควอท', category: 'hard', video: 'squat.mp4' },
  { id: 7, name: 'ท่าเขย่งปลายเท้า', category: 'hard', video: 'toe_raises.mp4' },
  { id: 8, name: 'ท่าเขย่งส้นเท้า', category: 'hard', video: 'calf_raises.mp4' },
  { id: 9, name: 'ท่าก้าวชิด', category: 'hard', video: 'step_touch.mp4' },
  { id: 10, name: 'ท่าเดินตรงด้วยส้นเท้า', category: 'hard', video: 'gait_toe_walk.mp4' },
  { id: 11, name: 'ท่ายืนวางส้นเท้าต่อกับปลายเท้า', category: 'hard', video: 'heel_toe_walking.mp4' },
  { id: 12, name: 'ท่ายืนตรงเดินด้วยปลายเท้า', category: 'hard', video: 'gait_toe_walk.mp4' },
];

const monthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function formatDate(date: Date): string {
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
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function getDayDifference(start: Date, end: Date): number {
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUTC - startUTC) / 86400000) + 1;
}

function formatHN(id: any) {
  if (!id || id === '-') return '-';
  if (String(id).startsWith('HN')) return id;
  const paddedId = String(id).padStart(5, '0');
  return `HN${paddedId}`;
}

function CalendarModal({
  visible,
  initialDate,
  minimumDate,
  onClose,
  onSelect,
  onClear,
  onToday,
}: {
  visible: boolean;
  initialDate: string;
  minimumDate?: string;
  onClose: () => void;
  onSelect: (date: string) => void;
  onClear: () => void;
  onToday: () => void;
}) {
  const initial = parseDate(initialDate) ?? new Date();
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
  const minDate = parseDate(minimumDate ?? '');

  function changeMonth(amount: number) {
    const next = new Date(viewYear, viewMonth + amount, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function isDisabled(day: number) {
    if (!minDate) return false;
    const current = new Date(viewYear, viewMonth, day);
    return current.getTime() < minDate.getTime();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.calendarBackdrop}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>เลือกวันที่</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.monthNavigation}>
            <Pressable style={styles.monthArrow} onPress={() => changeMonth(-1)}>
              <Text style={styles.monthArrowText}>‹</Text>
            </Pressable>
            <Text style={styles.monthTitle}>
              {monthNames[viewMonth]} {viewYear}
            </Text>
            <Pressable style={styles.monthArrow} onPress={() => changeMonth(1)}>
              <Text style={styles.monthArrowText}>›</Text>
            </Pressable>
          </View>
          <View style={styles.calendarGrid}>
            {weekDays.map((day, index) => (
              <View key={`${day}-${index}`} style={styles.calendarCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.calendarCell} />;
              }
              const currentDate = formatDate(new Date(viewYear, viewMonth, day));
              const selected = selectedDate !== null && currentDate === formatDate(selectedDate);
              const disabled = isDisabled(day);

              return (
                <Pressable
                  key={currentDate}
                  disabled={disabled}
                  style={[
                    styles.calendarCell,
                    styles.calendarDay,
                    selected && styles.calendarDaySelected,
                    disabled && styles.calendarDayDisabled,
                  ]}
                  onPress={() => {
                    onSelect(currentDate);
                  }}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      selected && styles.calendarDayTextSelected,
                      disabled && styles.calendarDayTextDisabled,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.calendarFooterActions}>
            <Pressable style={styles.calendarFooterBtn} onPress={onClear}>
              <Text style={styles.calendarFooterBtnText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.calendarFooterBtn} onPress={onToday}>
              <Text style={styles.calendarFooterBtnText}>Today</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ExerciseScreen({ navigation, route }: { navigation: any; route?: any }) {
  const params = route?.params || {};
  const [displayPatientName, setDisplayPatientName] = useState(params.patientName ?? '');
  const [displayHN, setDisplayHN] = useState(params.hn ?? '');
  const [selectedPatientId, setSelectedPatientId] = useState(params.patientId ?? null);

  const [patientSelectModalVisible, setPatientSelectModalVisible] = useState(false);
  const [patientsList, setPatientsList] = useState<PatientItem[]>([]);

  // อัปเดตข้อมูลผู้ป่วยทันทีที่มีการส่ง params ใหม่มา
  useEffect(() => {
    if (params.patientName) {
      setDisplayPatientName(params.patientName);
      setDisplayHN(params.hn || '');
      setSelectedPatientId(params.patientId || null);
    }
  }, [params.patientName, params.hn, params.patientId]);

  // โหลดรายชื่อคนไข้ทั้งหมดมารองรับการเลือก
  useEffect(() => {
    fetch('http://localhost:3000/api/doctor/patients')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.PatientID ? item.PatientID.toString() : '',
            name: `${item.First_Name || ''} ${item.Last_Name || ''}`.trim() || 'ไม่ระบุชื่อ',
            hn: formatHN(item.PatientID),
            symptom: item.Medical_Condition || 'ไม่ระบุ',
          }));
          setPatientsList(formatted);

          // ถ้าไม่มีข้อมูลถูกส่งมาทาง params เลย ให้ตั้งค่าเป็นผู้ป่วยคนแรกในฐานข้อมูล
          if (!params.patientName && formatted.length > 0) {
            setDisplayPatientName(formatted[0].name);
            setDisplayHN(formatted[0].hn);
            setSelectedPatientId(formatted[0].id);
          }
        }
      })
      .catch((err) => console.error('Error fetching patients:', err));
  }, []);

  const [searchText, setSearchText] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selections, setSelections] = useState<SelectedExercise[]>(
    initialExercises.map((exercise) => ({
      exerciseId: exercise.id,
      checked: false,
      reps: '10 ครั้ง',
      sets: '1 เซต',
    })),
  );

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('easy');
  const [newVideo, setNewVideo] = useState('');
  const [newCategoryDropdownOpen, setNewCategoryDropdownOpen] = useState(false);
  
  const [confirmed, setConfirmed] = useState(false);
  const [programSummary, setProgramSummary] = useState('');
  const [activeSetsDropdown, setActiveSetsDropdown] = useState<number | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end' | null>(null);
  
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');

  function showMessage(title: string, message: string) {
    setMessageTitle(title);
    setMessageBody(message);
    setMessageVisible(true);
  }

  function closeMessage() {
    setMessageVisible(false);
  }

  function resetConfirmation() {
    setConfirmed(false);
    setProgramSummary('');
  }

  const filteredExercises = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesName = exercise.name.toLowerCase().includes(normalizedKeyword);
      const matchesCategory = category === 'all' || exercise.category === category;
      return matchesName && matchesCategory;
    });
  }, [exercises, keyword, category]);

  const selectedItems = selections.filter((item) => item.checked);
  const selectedCount = selectedItems.length;

  function toggleExercise(exerciseId: number) {
    setSelections((previous) =>
      previous.map((item) =>
        item.exerciseId === exerciseId ? { ...item, checked: !item.checked } : item,
      ),
    );
    resetConfirmation();
  }

  function updateSets(exerciseId: number, sets: string) {
    setSelections((previous) =>
      previous.map((item) => (item.exerciseId === exerciseId ? { ...item, sets } : item)),
    );
    setActiveSetsDropdown(null);
    resetConfirmation();
  }

  function addNewExercise() {
    const name = newName.trim();
    if (!name) {
      showMessage('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อท่ากายภาพ');
      return;
    }

    const nextId =
      exercises.length > 0 ? Math.max(...exercises.map((exercise) => exercise.id)) + 1 : 1;
    const videoName = newVideo.trim();
    const newExercise: Exercise = {
      id: nextId,
      name,
      category: newCategory,
      video: videoSources[videoName] ? videoName : 'seated_knee_extensions.mp4',
    };

    setExercises((previous) => [...previous, newExercise]);
    setSelections((previous) => [
      ...previous,
      { exerciseId: nextId, checked: false, reps: '10 ครั้ง', sets: '1 เซต' },
    ]);
    
    setKeyword('');
    setCategory('all');
    setNewName('');
    setNewVideo('');
    setNewCategory('easy');
    setAddModalVisible(false);
    resetConfirmation();
    showMessage('เพิ่มท่ากายภาพสำเร็จ', 'เพิ่มท่ากายภาพลงในรายการจำลองแล้ว');
  }

  async function confirmProgram() {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) {
      showMessage('ยังไม่ได้กำหนดวันที่', 'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุดจากปฏิทิน');
      return;
    }

    if (start.getTime() > end.getTime()) {
      showMessage('วันที่ไม่ถูกต้อง', 'วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด');
      return;
    }

    if (selectedCount === 0) {
      showMessage('ยังไม่ได้เลือกท่าฝึก', 'กรุณาเลือกท่ากายภาพอย่างน้อย 1 ท่า');
      return;
    }

    const selectedExercisePayload = selectedItems.map((item) => {
      const exercise = exercises.find((entry) => entry.id === item.exerciseId);
      const targetReps = parseInt(item.reps, 10) || 10;
      const targetSets = parseInt(item.sets, 10) || 1;

      return {
        exerciseId: item.exerciseId,
        targetReps: targetReps,
        targetSets: targetSets,
        videoUrl: exercise ? exercise.video : 'seated_knee_extensions.mp4',
      };
    });

    try {
      const response = await fetch('http://localhost:3000/api/doctor/assign-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatientId || 1,
          startDate: formatDate(start),
          endDate: formatDate(end),
          exercises: selectedExercisePayload,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const duration = getDayDifference(start, end);
        const exerciseDetails = selectedItems
          .map((item) => {
            const exercise = exercises.find((entry) => entry.id === item.exerciseId);
            if (!exercise) return '';
            return `${exercise.name} (${item.reps}, ${item.sets})`;
          })
          .filter(Boolean)
          .join(', ');

        const summary =
          `ผู้ป่วย: ${displayPatientName}` +
          ` ${displayHN ? `(${displayHN})` : ''}` +
          `\nระยะเวลาโปรแกรม: ${duration} วัน (${formatDate(start)} ถึง ${formatDate(end)})` +
          `\nรวม ${selectedCount} ท่า` +
          `\nรายการ: ${exerciseDetails}`;

        setProgramSummary(summary);
        setConfirmed(true);
        showMessage(
          'จัดโปรแกรมสำเร็จ',
          'บันทึกและส่งมอบหมายโปรแกรมพร้อมวิดีโอไปยังแอปคนไข้เรียบร้อยแล้ว',
        );
      } else {
        showMessage('จัดโปรแกรมไม่สำเร็จ', result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Error assigning program:', error);
      showMessage('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Backend ได้');
    }
  }

  function goToDashboard() {
    navigation.navigate('Patient');
  }

  function goToLogin() {
    navigation.navigate('Login');
  }

  const calendarInitialDate =
    calendarTarget === 'end'
      ? endDate || startDate || formatDate(new Date())
      : startDate || formatDate(new Date());

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        {/* SIDEBAR */}
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
            <Pressable style={[styles.menuItem, styles.menuItemActive]}>
              <Text style={styles.menuItemTextActive}>📁 คลังท่ากายภาพ</Text>
            </Pressable>
          </View>
          <View style={styles.sidebarFooter}>
            <Pressable style={styles.logoutButton} onPress={goToLogin}>
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </Pressable>
          </View>
        </View>

        {/* MAIN CONTENT WRAPPER */}
        <View style={styles.mainContent}>
          {/* TOP NAVBAR */}
          <View style={styles.topNavbar}>
            <View style={styles.searchBoxContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหาชื่อ หรือ รหัสผู้ป่วย (เช่น HN00145)..."
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
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

          {/* SCROLLABLE CONTENT BODY */}
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>&lt; กลับไปหน้ารายชื่อทั้งหมด</Text>
            </Pressable>

            <View style={styles.card}>
              <View style={styles.pageHeader}>
                <View style={styles.headerTextBlock}>
                  <Text style={styles.pageTitle}>
                    จัดการโปรแกรมท่ากายภาพสำหรับ:{' '}
                    <Pressable onPress={() => setPatientSelectModalVisible(true)}>
                      <Text style={styles.patientNameFixedText}>
                        {displayPatientName || 'กำลังโหลดข้อมูล...'} {displayHN ? `(${displayHN})` : ''} 🔄
                      </Text>
                    </Pressable>
                  </Text>
                </View>
                <Pressable style={styles.primaryButton} onPress={() => setAddModalVisible(true)}>
                  <Text style={styles.primaryButtonText}>+ เพิ่มท่ากายภาพใหม่</Text>
                </Pressable>
              </View>

              {/* FILTERS */}
              <View style={styles.filterBarRow}>
                <TextInput
                  style={styles.exerciseSearchInput}
                  value={keyword}
                  onChangeText={setKeyword}
                  placeholder="พิมพ์ชื่อท่าเพื่อค้นหา..."
                  placeholderTextColor="#888"
                />
                <View style={styles.categoryDropdownWrapper}>
                  <Pressable
                    style={styles.categorySelectBtn}
                    onPress={() => {
                      setCategoryDropdownOpen((previous) => !previous);
                      setActiveSetsDropdown(null);
                    }}
                  >
                    <Text style={styles.categorySelectText}>
                      {category === 'all'
                        ? 'หมวดหมู่: ทั้งหมด'
                        : category === 'easy'
                        ? 'ง่าย (5 ท่า)'
                        : 'ยาก (7 ท่า)'}
                    </Text>
                    <Text style={styles.dropdownArrow}>{categoryDropdownOpen ? '▲' : '▼'}</Text>
                  </Pressable>

                  {categoryDropdownOpen && (
                    <View style={styles.categoryDropdownMenu}>
                      {[
                        { label: 'หมวดหมู่: ทั้งหมด', value: 'all' },
                        { label: 'ง่าย (5 ท่า)', value: 'easy' },
                        { label: 'ยาก (7 ท่า)', value: 'hard' },
                      ].map((item) => (
                        <Pressable
                          key={item.value}
                          style={[
                            styles.categoryDropdownItem,
                            category === item.value && styles.categoryDropdownItemActive,
                          ]}
                          onPress={() => {
                            setCategory(item.value as FilterCategory);
                            setCategoryDropdownOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.categoryDropdownItemText,
                              category === item.value && styles.categoryDropdownItemTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* วันที่เริ่มต้น - สิ้นสุด */}
                <View style={styles.datePickerGroup}>
                  <Pressable
                    style={styles.dateInputWrapper}
                    onPress={() => {
                      setCalendarTarget('start');
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dateInputText, !startDate && styles.datePlaceholder]}>
                      {startDate || 'วันที่เริ่มต้น'}
                    </Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </Pressable>

                  <Pressable
                    style={styles.dateInputWrapper}
                    onPress={() => {
                      setCalendarTarget('end');
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dateInputText, !endDate && styles.datePlaceholder]}>
                      {endDate || 'วันที่สิ้นสุด'}
                    </Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={styles.listHeading}>รายการท่าฝึกทั้งหมดในระบบ</Text>

              {/* EXERCISE GRID */}
              <View style={styles.exerciseGrid}>
                {filteredExercises.map((exercise, index) => {
                  const selection = selections.find((item) => item.exerciseId === exercise.id);
                  const checked = selection?.checked ?? false;
                  const videoSource =
                    videoSources[exercise.video] ?? videoSources['seated_knee_extensions.mp4'];

                  return (
                    <View 
                      key={exercise.id} 
                      style={[
                        styles.exerciseCard, 
                        { zIndex: activeSetsDropdown === exercise.id ? 999 : (100 - index) }
                      ]}
                    >
                      <View style={styles.videoContainer}>
                        {Platform.OS === 'web' ? (
                          React.createElement('video', {
                            src: videoSource,
                            controls: true,
                            playsInline: true,
                            preload: 'metadata',
                            style: {
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              backgroundColor: '#111827',
                            },
                          })
                        ) : (
                          <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 60 }}>
                            กรุณาเปิดวิดีโอผ่านหน้าจอเล่นวิดีโอของแอป
                          </Text>
                        )}

                        <Pressable
                          style={styles.checkboxOverlay}
                          onPress={() => toggleExercise(exercise.id)}
                        >
                          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                            {checked && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                        </Pressable>
                      </View>

                      <Text style={styles.exerciseName}>{exercise.name}</Text>

                      <View style={styles.dropdownRow}>
                        {/* 10 ครั้ง แสดงนิ่งๆ */}
                        <View style={styles.disabledSelectBox}>
                          <Text style={styles.disabledSelectBoxText}>10 ครั้ง</Text>
                        </View>

                        {/* Sets Dropdown */}
                        <View style={styles.cardDropdownWrapper}>
                          <Pressable
                            style={styles.selectBox}
                            onPress={() => {
                              setActiveSetsDropdown(
                                activeSetsDropdown === exercise.id ? null : exercise.id,
                              );
                              setCategoryDropdownOpen(false);
                            }}
                          >
                            <Text style={styles.selectBoxText}>
                              {selection?.sets || '1 เซต'}
                            </Text>
                            <Text style={styles.smallArrow}>▼</Text>
                          </Pressable>

                          {activeSetsDropdown === exercise.id && (
                            <View style={styles.cardDropdownList}>
                              {['1 เซต', '2 เซต', '3 เซต', '4 เซต', '5 เซต'].map((sets) => (
                                <Pressable
                                  key={sets}
                                  style={styles.cardDropdownItem}
                                  onPress={() => updateSets(exercise.id, sets)}
                                >
                                  <Text style={styles.cardDropdownText}>{sets}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {filteredExercises.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>ไม่พบท่าฝึกที่ค้นหา</Text>
                </View>
              )}

              {/* SUMMARY BOX */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryTextBlock}>
                  <Text style={styles.summaryTitle}>สรุปโปรแกรมการรักษา</Text>
                  <Text style={styles.summaryText}>
                    {confirmed && programSummary
                      ? programSummary
                      : `ระยะเวลาโปรแกรม: ยังไม่ได้กำหนด | รวม ${selectedCount} ท่าที่เลือก`}
                  </Text>
                </View>
                <Pressable style={styles.confirmButton} onPress={confirmProgram}>
                  <Text style={styles.confirmButtonText}>ยืนยันและส่งโปรแกรมไปยังแอปคนไข้</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* MODAL เลือกคนไข้ */}
      <Modal
        visible={patientSelectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPatientSelectModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 เลือกผู้ป่วยที่ต้องการจัดโปรแกรม</Text>
              <Pressable onPress={() => setPatientSelectModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {patientsList.length > 0 ? (
                patientsList.map((pat) => (
                  <Pressable
                    key={pat.id}
                    style={styles.patientOptionItem}
                    onPress={() => {
                      setDisplayPatientName(pat.name);
                      setDisplayHN(pat.hn);
                      setSelectedPatientId(pat.id);
                      setPatientSelectModalVisible(false);
                      resetConfirmation();
                    }}
                  >
                    <Text style={styles.patientOptionName}>{pat.name}</Text>
                    <Text style={styles.patientOptionSub}>{pat.hn} | อาการ: {pat.symptom}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={{ textAlign: 'center', padding: 20, color: '#888' }}>กำลังโหลดรายชื่อผู้ป่วย...</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CALENDAR MODAL */}
      <CalendarModal
        key={calendarTarget ?? 'closed'}
        visible={calendarTarget !== null}
        initialDate={calendarInitialDate}
        minimumDate={calendarTarget === 'end' ? startDate : undefined}
        onClose={() => setCalendarTarget(null)}
        onSelect={(date) => {
          if (calendarTarget === 'start') {
            setStartDate(date);
            if (endDate && date > endDate) setEndDate('');
          } else {
            setEndDate(date);
          }
          resetConfirmation();
          setCalendarTarget(null);
        }}
        onClear={() => {
          if (calendarTarget === 'start') setStartDate('');
          if (calendarTarget === 'end') setEndDate('');
          resetConfirmation();
          setCalendarTarget(null);
        }}
        onToday={() => {
          const todayStr = formatDate(new Date());
          if (calendarTarget === 'start') {
            setStartDate(todayStr);
            if (endDate && todayStr > endDate) setEndDate('');
          } else {
            setEndDate(todayStr);
          }
          resetConfirmation();
          setCalendarTarget(null);
        }}
      />

      {/* ADD EXERCISE MODAL */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ เพิ่มท่ากายภาพใหม่</Text>
              <Pressable onPress={() => setAddModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>ชื่อท่ากายภาพ</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="เช่น knee_flexion.mp4"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>หมวดหมู่</Text>
            <View style={styles.modalCategoryDropdownWrapper}>
              <Pressable
                style={styles.modalCategorySelectBtn}
                onPress={() => setNewCategoryDropdownOpen((prev) => !prev)}
              >
                <Text style={styles.modalCategorySelectText}>
                  {newCategory === 'easy' ? 'ง่าย' : 'ยาก'}
                </Text>
                <Text style={styles.dropdownArrow}>{newCategoryDropdownOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {newCategoryDropdownOpen && (
                <View style={styles.modalCategoryDropdownMenu}>
                  {[
                    { label: 'ง่าย', value: 'easy' },
                    { label: 'ยาก', value: 'hard' },
                  ].map((item) => (
                    <Pressable
                      key={item.value}
                      style={[
                        styles.modalCategoryDropdownItem,
                        newCategory === item.value && styles.modalCategoryDropdownItemActive,
                      ]}
                      onPress={() => {
                        setNewCategory(item.value as Category);
                        setNewCategoryDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalCategoryDropdownItemText,
                          newCategory === item.value && styles.modalCategoryDropdownItemTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.fieldLabel}>เลือกไฟล์วิดีโอจากเครื่อง (.mp4)</Text>
            <View style={styles.fileInputContainer}>
              {Platform.OS === 'web' ? (
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewVideo(file.name);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    backgroundColor: '#F9F9F9',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <TextInput
                  style={styles.modalInput}
                  value={newVideo}
                  onChangeText={setNewVideo}
                  placeholder="พิมพ์ชื่อไฟล์วิดีโอในระบบ"
                  placeholderTextColor="#999"
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setAddModalVisible(false);
                  setNewName('');
                  setNewVideo('');
                  setNewCategory('easy');
                }}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={addNewExercise}>
                <Text style={styles.primaryButtonText}>บันทึกท่าใหม่</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MESSAGE MODAL */}
      <Modal visible={messageVisible} transparent animationType="fade" onRequestClose={closeMessage}>
        <View style={styles.modalBackdrop}>
          <View style={styles.messageModalContent}>
            <View style={styles.messageIconCircle}>
              <Text style={styles.messageIcon}>
                {confirmed && messageTitle === 'จัดโปรแกรมสำเร็จ' ? '✓' : 'i'}
              </Text>
            </View>
            <Text style={styles.messageTitle}>{messageTitle}</Text>
            <Text style={styles.messageBody}>{messageBody}</Text>
            <Pressable style={styles.messageConfirmButton} onPress={closeMessage}>
              <Text style={styles.messageConfirmText}>ตกลง</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
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
  menuItemActive: {
    backgroundColor: '#E3F2FD',
  },
  menuItemText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  menuItemTextActive: {
    fontSize: 14,
    color: '#0288D1',
    fontWeight: '600',
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
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
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
  backButton: {
    paddingVertical: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    color: '#37474F',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        elevation: 3,
      },
    }),
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 20,
  },
  headerTextBlock: {
    flex: 1,
  },
  pageTitle: {
    color: '#263238',
    fontSize: 16,
    fontWeight: '700',
  },
  patientNameFixedText: {
    color: '#0288D1',
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  patientOptionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  patientOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  patientOptionSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
    position: 'relative',
    zIndex: 100,
    ...Platform.select({
      web: { isolation: 'isolate' } as any,
    }),
  },
  exerciseSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    width: 240,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  categoryDropdownWrapper: {
    width: 190,
    position: 'relative',
    zIndex: 1000,
    ...Platform.select({
      web: { zIndex: 1000 } as any,
    }),
  },
  categorySelectBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 11,
    color: '#333',
  },
  categoryDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'visible',
    zIndex: 1001,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    ...Platform.select({
      web: { zIndex: 1001 } as any,
    }),
  },
  categoryDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  categoryDropdownItemActive: {
    backgroundColor: '#E3F2FD',
  },
  categoryDropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
  categoryDropdownItemTextActive: {
    color: '#0288D1',
    fontWeight: '700',
  },
  datePickerGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 150,
  },
  dateInputText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  datePlaceholder: {
    color: '#888',
  },
  calendarIcon: {
    fontSize: 14,
    marginLeft: 4,
  },
  listHeading: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
    position: 'relative',
    zIndex: 0,
  },
  exerciseCard: {
    width: '31%',
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    position: 'relative',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#111827',
    overflow: 'hidden',
    marginBottom: 10,
  },
  checkboxOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0288D1',
    borderColor: '#0288D1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseName: {
    color: '#263238',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 5,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    position: 'relative',
  },
  disabledSelectBox: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSelectBoxText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  cardDropdownWrapper: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },
  selectBox: {
    height: 36,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxText: {
    fontSize: 12,
    color: '#1E293B',
  },
  smallArrow: {
    fontSize: 9,
    color: '#64748B',
  },
  cardDropdownList: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardDropdownItem: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardDropdownText: {
    fontSize: 12,
    color: '#334155',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 15,
  },
  summaryBox: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 15,
    position: 'relative',
    zIndex: 1,
  },
  summaryTextBlock: {
    flex: 1,
    minWidth: 200,
  },
  summaryTitle: {
    color: '#263238',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 5,
  },
  summaryText: {
    color: '#555',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0077B6',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#888',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  modalCategoryDropdownWrapper: {
    position: 'relative',
    zIndex: 30,
  },
  modalCategorySelectBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCategorySelectText: {
    fontSize: 14,
    color: '#333',
  },
  modalCategoryDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCategoryDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  modalCategoryDropdownItemActive: {
    backgroundColor: '#E3F2FD',
  },
  modalCategoryDropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  modalCategoryDropdownItemTextActive: {
    color: '#0288D1',
    fontWeight: '700',
  },
  fileInputContainer: {
    width: '100%',
    marginVertical: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 25,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#334155',
    fontWeight: '600',
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
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthArrow: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E0F7FA',
  },
  monthArrowText: {
    color: '#0288D1',
    fontSize: 27,
  },
  monthTitle: {
    color: '#263238',
    fontSize: 16,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: '#77838B',
    fontWeight: '700',
  },
  calendarDay: {
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: '#0288D1',
  },
  calendarDayDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#263238',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayTextDisabled: {
    color: '#999999',
  },
  calendarFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  calendarFooterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  calendarFooterBtnText: {
    color: '#0288D1',
    fontSize: 14,
    fontWeight: '600',
  },
  messageModalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  messageIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  messageIcon: {
    color: '#0288D1',
    fontSize: 28,
    fontWeight: '800',
  },
  messageTitle: {
    color: '#263238',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageBody: {
    color: '#5D6970',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  messageConfirmButton: {
    width: '100%',
    backgroundColor: '#0288D1',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  messageConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});