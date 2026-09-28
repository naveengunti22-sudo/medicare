export type LanguageCode = 'en' | 'te' | 'hi';

export interface TranslationDict {
  appName: string;
  heroTitle: string;
  heroSubtitle: string;
  findDoctor: string;
  consultNow: string;
  emergencyInfo: string;
  popularSpecialties: string;
  howItWorks: string;
  benefits: string;
  verifiedDoctors: string;
  testimonials: string;
  faq: string;
  doctorSearch: string;
  specialization: string;
  language: string;
  consultationType: string;
  experience: string;
  consultationFee: string;
  availableNow: string;
  inConsultation: string;
  offline: string;
  onBreak: string;
  queuePosition: string;
  patientsAhead: string;
  estimatedWaitTime: string;
  youAreNext: string;
  consultationInProgress: string;
  consultationCompleted: string;
  bookAppointment: string;
  cancelAppointment: string;
  rescheduleAppointment: string;
  medicalVault: string;
  healthTimeline: string;
  digitalPrescriptions: string;
  followUpDue: string;
  physicalExamRecommended: string;
  aiAssistantTitle: string;
  aiDisclaimer: string;
  video: string;
  audio: string;
  chat: string;
  connectionExcellent: string;
  connectionUnstable: string;
  connectionPoor: string;
  demoLogin: string;
}

export const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: 'MediLink',
    heroTitle: 'Healthcare, Without the Waiting Room.',
    heroSubtitle: 'Find a doctor, book your appointment, consult online, manage your prescriptions and continue your healthcare journey in one place.',
    findDoctor: 'Find a Doctor',
    consultNow: 'Consult Now',
    emergencyInfo: 'Emergency Information',
    popularSpecialties: 'Popular Specialties',
    howItWorks: 'How MediLink Works',
    benefits: 'Why Patients Trust Us',
    verifiedDoctors: 'Verified Medical Specialists',
    testimonials: 'Patient Experiences',
    faq: 'Frequently Asked Questions',
    doctorSearch: 'Search doctors, specialties, or symptoms...',
    specialization: 'Specialization',
    language: 'Language',
    consultationType: 'Consultation Mode',
    experience: 'Experience',
    consultationFee: 'Consultation Fee',
    availableNow: 'Available Now',
    inConsultation: 'In Consultation',
    offline: 'Offline',
    onBreak: 'On Break',
    queuePosition: 'Queue Position',
    patientsAhead: 'Patients Ahead',
    estimatedWaitTime: 'Estimated Waiting Time',
    youAreNext: "You're next. Please get ready.",
    consultationInProgress: 'Consultation in progress',
    consultationCompleted: 'Consultation completed',
    bookAppointment: 'Book Appointment',
    cancelAppointment: 'Cancel Appointment',
    rescheduleAppointment: 'Reschedule',
    medicalVault: 'Medical Report Vault',
    healthTimeline: 'Health Timeline',
    digitalPrescriptions: 'Digital Prescriptions',
    followUpDue: 'Follow-up Due',
    physicalExamRecommended: 'Physical examination recommended',
    aiAssistantTitle: 'AI Health Navigation Assistant',
    aiDisclaimer: 'This assistant guides you to appropriate medical specialties and does not diagnose diseases or prescribe treatment.',
    video: 'Video Call',
    audio: 'Audio Call',
    chat: 'Instant Chat',
    connectionExcellent: 'Excellent',
    connectionUnstable: 'Unstable',
    connectionPoor: 'Poor',
    demoLogin: 'Quick Demo Login',
  },
  te: {
    appName: 'మెడిలింక్ (MediLink)',
    heroTitle: 'వేచి ఉండే గది అవసరం లేని వైద్య సంరక్షణ.',
    heroSubtitle: 'వైద్యులను కనుగొనండి, అపాయింట్‌మెంట్ బుక్ చేసుకోండి, ఆన్‌లైన్‌లో సంప్రదించండి, ప్రిస్క్రిప్షన్లను పొందండి మరియు మీ ఆరోగ్య ప్రయాణాన్ని కొనసాగించండి.',
    findDoctor: 'వైద్యుడిని వెతకండి',
    consultNow: 'ఇప్పుడే సంప్రదించండి',
    emergencyInfo: 'అత్యవసర సమాచారం',
    popularSpecialties: 'ప్రముఖ వైద్య విభాగాలు',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    benefits: 'రోగులు మమ్మల్ని ఎందుకు నమ్ముతారు',
    verifiedDoctors: 'ధృవీకరించబడిన వైద్య నిపుణులు',
    testimonials: 'రోగుల అనుభవాలు',
    faq: 'తరచుగా అడిగే ప్రశ్నలు',
    doctorSearch: 'వైద్యులు, రోగ లక్షణాలు లేదా ప్రత్యేకతను వెతకండి...',
    specialization: 'ప్రత్యేకత (Specialization)',
    language: 'భాష',
    consultationType: 'సంప్రదింపు విధానం',
    experience: 'అనుభవం',
    consultationFee: 'ఫీజు',
    availableNow: 'ప్రస్తుతం అందుబాటులో ఉన్నారు',
    inConsultation: 'మరొక రోగితో సంప్రదింపులో ఉన్నారు',
    offline: 'ఆఫ్‌లైన్',
    onBreak: 'విశ్రాంతిలో ఉన్నారు',
    queuePosition: 'మీ క్యూ సంఖ్య',
    patientsAhead: 'మీ ముందు ఉన్న రోగులు',
    estimatedWaitTime: 'వేచి ఉండే సమయం',
    youAreNext: 'మీ వంతు వచ్చింది. దయచేసి సిద్ధంగా ఉండండి.',
    consultationInProgress: 'సంప్రదింపు జరుగుతోంది',
    consultationCompleted: 'సంప్రదింపు పూర్తయింది',
    bookAppointment: 'అపాయింట్‌మెంట్ బుక్ చేయండి',
    cancelAppointment: 'రద్దు చేయండి',
    rescheduleAppointment: 'సమయాన్ని మార్చుకోండి',
    medicalVault: 'వైద్య నివేదికల వాల్ట్',
    healthTimeline: 'ఆరోగ్య కాలక్రమం',
    digitalPrescriptions: 'డిజిటల్ ప్రిస్క్రిప్షన్లు',
    followUpDue: 'ఫాలో-అప్ సమయం ఆసన్నమైంది',
    physicalExamRecommended: 'ప్రత్యక్ష శారీరక పరీక్ష సిఫార్సు చేయబడింది',
    aiAssistantTitle: 'AI ఆరోగ్య మార్గదర్శక సహాయకుడు',
    aiDisclaimer: 'ఈ AI సహాయకుడు తగిన వైద్య విభాగాన్ని సూచిస్తుంది మాత్రమే. వ్యాధులను నిర్ధారించదు.',
    video: 'వీడియో కాల్',
    audio: 'ఆడియో కాల్',
    chat: 'చాట్',
    connectionExcellent: 'అద్భుతమైన కనెక్షన్',
    connectionUnstable: 'అస్థిరమైన కనెక్షన్',
    connectionPoor: 'పేలవమైన కనెక్షన్',
    demoLogin: 'డెమో లాగిన్',
  },
  hi: {
    appName: 'मेडीलिंक (MediLink)',
    heroTitle: 'स्वास्थ्य सेवा, बिना किसी इंतज़ार के।',
    heroSubtitle: 'डॉक्टर ढूंढें, अपॉइंटमेंट बुक करें, ऑनलाइन परामर्श लें, डिजिटल पर्चे प्रबंधित करें और अपनी संपूर्ण स्वास्थ्य यात्रा एक ही स्थान पर जारी रखें।',
    findDoctor: 'डॉक्टर खोजें',
    consultNow: 'अभी परामर्श लें',
    emergencyInfo: 'आपातकालीन जानकारी',
    popularSpecialties: 'लोकप्रिय विशेषज्ञताएं',
    howItWorks: 'यह कैसे काम करता है',
    benefits: 'मरीजों का हम पर भरोसा क्यों है',
    verifiedDoctors: 'सत्यापित डॉक्टर विशेषज्ञ',
    testimonials: 'मरीजों के अनुभव',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    doctorSearch: 'डॉक्टर, लक्षण या विशेषज्ञता खोजें...',
    specialization: 'विशेषज्ञता',
    language: 'भाषा',
    consultationType: 'परामर्श माध्यम',
    experience: 'अनुभव',
    consultationFee: 'परामर्श शुल्क',
    availableNow: 'अभी उपलब्ध हैं',
    inConsultation: 'मरीज के साथ परामर्श में हैं',
    offline: 'ऑफ़लाइन',
    onBreak: 'विश्राम पर हैं',
    queuePosition: 'कतार संख्या',
    patientsAhead: 'आपसे आगे मरीज',
    estimatedWaitTime: 'अनुमानित प्रतीक्षा समय',
    youAreNext: 'अगला नंबर आपका है। कृपया तैयार रहें।',
    consultationInProgress: 'परामर्श प्रगति पर है',
    consultationCompleted: 'परामर्श पूर्ण हुआ',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    cancelAppointment: 'रद्द करें',
    rescheduleAppointment: 'पुनर्निर्धारित करें',
    medicalVault: 'मेडिकल रिपोर्ट वॉल्ट',
    healthTimeline: 'स्वास्थ्य टाइमलाइन',
    digitalPrescriptions: 'डिजिटल पर्चे (Prescriptions)',
    followUpDue: 'फॉलो-अप बकाया है',
    physicalExamRecommended: 'शारीरिक जांच की सिफारिश की गई है',
    aiAssistantTitle: 'AI स्वास्थ्य नेविगेशन सहायक',
    aiDisclaimer: 'यह सहायक आपको सही विशेषज्ञ चुनने में मार्गदर्शन करता है, यह रोगों का निदान या उपचार नहीं करता।',
    video: 'वीडियो कॉल',
    audio: 'ऑडियो कॉल',
    chat: 'चैट',
    connectionExcellent: 'उत्कृष्ट नेटवर्क',
    connectionUnstable: 'अस्थिर नेटवर्क',
    connectionPoor: 'कमजोर नेटवर्क',
    demoLogin: 'त्वरित डेमो लॉगिन',
  },
};
