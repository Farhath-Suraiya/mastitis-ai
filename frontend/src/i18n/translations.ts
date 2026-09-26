export type Language = 'en' | 'ta' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    ta: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Navigation / Sidebar
  navDashboard: {
    en: 'Dashboard',
    ta: 'முகப்புப்பலகை',
    hi: 'डैशबोर्ड',
  },
  navAnimals: {
    en: 'Animals',
    ta: 'கால்நடைகள்',
    hi: 'पशु',
  },
  navSimulator: {
    en: 'IoT Simulator',
    ta: 'IoT சிமுலேட்டர்',
    hi: 'IoT सिम्युलेटर',
  },
  navAnalytics: {
    en: 'Herd Analytics',
    ta: 'மந்தை பகுப்பாய்வு',
    hi: 'झुंड विश्लेषण',
  },
  navAlerts: {
    en: 'Alerts',
    ta: 'எச்சரிக்கைகள்',
    hi: 'अलर्ट',
  },
  navRecommendations: {
    en: 'Recommendations',
    ta: 'பரிந்துரைகள்',
    hi: 'सिफारिशें',
  },
  navSettings: {
    en: 'Settings & Data',
    ta: 'அமைப்புகள் மற்றும் தரவு',
    hi: 'सेटिंग्स और डेटा',
  },
  headerSubtitle: {
    en: 'Early Bovine Mastitis Forecasting & Herd Health Platform',
    ta: 'ஆரம்ப கால்நடை மடிநோய் முன்னறிவிப்பு & மந்தை நல தளம்',
    hi: 'प्रारंभिक गोजातीय थनैला पूर्वानुमान और झुंड स्वास्थ्य मंच',
  },
  forecastLeadBadge: {
    en: 'Forecast Lead: 7–14 Days',
    ta: 'முன்னறிவிப்பு காலம்: 7–14 நாட்கள்',
    hi: 'पूर्वानुमान अवधि: 7–14 दिन',
  },
  mlActiveBadge: {
    en: 'Random Forest ML Active',
    ta: 'ரேண்டம் ஃபாரஸ்ட் ML செயலில் உள்ளது',
    hi: 'रैंडम फॉरेस्ट एमएल सक्रिय',
  },

  // IoT Simulator
  simulatorTitle: {
    en: 'IoT Sensor Simulator',
    ta: 'IoT சென்சார் சிமுலேட்டர்',
    hi: 'IoT सेंसर सिम्युलेटर',
  },
  softwareSimulation: {
    en: 'Software Simulation',
    ta: 'மென்பொருள் உருவகப்படுத்துதல்',
    hi: 'सॉफ्टवेयर सिमुलेशन',
  },
  simulatorSubtitle: {
    en: 'Search or select a cow, start the simulation, watch vitals update, then stop to receive the AI mastitis forecast.',
    ta: 'மாட்டைத் தேடவும் அல்லது தேர்ந்தெடுக்கவும், உருவகப்படுத்துதலைத் தொடங்கவும், அளவீடுகளைக் கண்காணிக்கவும், பின் AI மடிநோய் முன்னறிவிப்பைப் பெற நிறுத்தவும்.',
    hi: 'गाय खोजें या चुनें, सिमुलेशन शुरू करें, महत्वपूर्ण संकेत बदलते देखें, फिर एआई थनैला पूर्वानुमान प्राप्त करने के लिए रोकें।',
  },
  searchCow: {
    en: 'Search Cow',
    ta: 'மாட்டைத் தேடு',
    hi: 'गाय खोजें',
  },
  searchPlaceholder: {
    en: 'Search by Cow ID or breed...',
    ta: 'மாடு எண் அல்லது இனத்தை தேடவும்...',
    hi: 'गाय आईडी या नस्ल से खोजें...',
  },
  selectAnimal: {
    en: 'Select Animal',
    ta: 'மாட்டைத் தேர்ந்தெடுக்கவும்',
    hi: 'गाय चुनें',
  },
  selectedCow: {
    en: 'Selected Cow',
    ta: 'தேர்ந்தெடுக்கப்பட்ட மாடு',
    hi: 'चयनित गाय',
  },
  startSimulation: {
    en: 'START SIMULATION',
    ta: 'உருவகப்படுத்துதலைத் தொடங்கு',
    hi: 'सिमुलेशन शुरू करें',
  },
  stopSimulation: {
    en: 'STOP SIMULATION',
    ta: 'உருவகப்படுத்துதலை நிறுத்து',
    hi: 'सिमुलेशन रोकें',
  },
  simulationRunningNotice: {
    en: 'Simulation Running — Vitals Dynamically Changing',
    ta: 'உருவகப்படுத்துதல் இயங்குகிறது — அளவீடுகள் மாறுகின்றன',
    hi: 'सिमुलेशन चल रहा है — महत्वपूर्ण संकेत गतिशील रूप से बदल रहे हैं',
  },
  runningMlNotice: {
    en: 'Running Existing ML Model Prediction...',
    ta: 'தற்போதைய ML மாதிரி கணிப்பு இயங்குகிறது...',
    hi: 'मौजूदा एमएल मॉडल पूर्वानुमान चल रहा है...',
  },
  simulatedVitalsHeader: {
    en: 'Simulated Cow Vitals',
    ta: 'உருவகப்படுத்தப்பட்ட மாட்டின் அளவீடுகள்',
    hi: 'अनुकरण किए गए गाय के महत्वपूर्ण संकेत',
  },
  telemetryStreamNotice: {
    en: 'Continuous live telemetry stream',
    ta: 'நேரடி தொடர் தொலைஅளவியல் ஸ்ட்ரீம்',
    hi: 'निरंतर लाइव टेलीमेट्री स्ट्रीम',
  },
  currentTelemetryNotice: {
    en: 'Current simulated telemetry values',
    ta: 'தற்போதைய உருவகப்படுத்தப்பட்ட அளவீடுகள்',
    hi: 'वर्तमान अनुकरण किए गए टेलीमेट्री मान',
  },
  parameterNum: {
    en: 'Parameter',
    ta: 'அளவுரு',
    hi: 'पैरामीटर',
  },

  // 12 Parameters
  bodyTemp: {
    en: 'Body Temperature',
    ta: 'உடல் வெப்பநிலை',
    hi: 'शरीर का तापमान',
  },
  udderTemp: {
    en: 'Udder Surface Temperature',
    ta: 'மடி மேற்பரப்பு வெப்பநிலை',
    hi: 'अयन की सतह का तापमान',
  },
  milkConductivity: {
    en: 'Milk Electrical Conductivity',
    ta: 'பால் மின் கடத்துத்திறன்',
    hi: 'दूध की विद्युत चालकता',
  },
  milkTemp: {
    en: 'Milk Temperature',
    ta: 'பால் வெப்பநிலை',
    hi: 'दूध का तापमान',
  },
  milkYield: {
    en: 'Daily Milk Yield',
    ta: 'தினசரி பால் மகசூல்',
    hi: 'दैनिक दूध उत्पादन',
  },
  scc: {
    en: 'Somatic Cell Count (SCC)',
    ta: 'உயிரணு எண்ணிக்கை (SCC)',
    hi: 'दैहिक कोशिका गणना (SCC)',
  },
  activityLevel: {
    en: 'Cow Activity Level',
    ta: 'மாட்டின் செயல்பாட்டு நிலை',
    hi: 'गाय की गतिविधि स्तर',
  },
  ruminationTime: {
    en: 'Daily Rumination Time',
    ta: 'தினசரி அசைபோடும் நேரம்',
    hi: 'दैनिक जुगाली का समय',
  },
  waterIntake: {
    en: 'Daily Water Intake',
    ta: 'தினசரி குடிநீர் உட்கொள்ளல்',
    hi: 'दैनिक पानी का सेवन',
  },
  feedingScore: {
    en: 'Feeding Behavior Score',
    ta: 'உணவு உண்ணும் நடத்தை மதிப்பீடு',
    hi: 'आहार व्यवहार स्कोर',
  },
  ambientTemp: {
    en: 'Ambient Barn Temperature',
    ta: 'கொட்டகை சுற்றுச்சூழல் வெப்பநிலை',
    hi: 'परिवेशी गोशाला तापमान',
  },
  humidity: {
    en: 'Barn Relative Humidity',
    ta: 'கொட்டகை ஒப்பு ஈரப்பதம்',
    hi: 'गोशाला सापेक्ष आर्द्रता',
  },

  // Forecast & Risk Results
  aiForecastHeader: {
    en: 'AI Mastitis Forecast',
    ta: 'AI மடிநோய் முன்னறிவிப்பு',
    hi: 'एआई थनैला पूर्वानुमान',
  },
  cowLabel: {
    en: 'Cow',
    ta: 'மாடு',
    hi: 'गाय',
  },
  riskLevel: {
    en: 'Risk Level',
    ta: 'ஆபத்து நிலை',
    hi: 'जोखिम स्तर',
  },
  riskScore: {
    en: 'Risk Score',
    ta: 'ஆபத்து மதிப்பீடு',
    hi: 'जोखिम स्कोर',
  },
  forecastWindowLabel: {
    en: 'Forecast Window',
    ta: 'முன்னறிவிப்பு காலம்',
    hi: 'पूर्वानुमान अवधि',
  },
  noRisk: {
    en: 'No Risk',
    ta: 'ஆபத்து இல்லை',
    hi: 'कोई जोखिम नहीं',
  },
  lowRisk: {
    en: 'Low Risk',
    ta: 'குறைந்த ஆபத்து',
    hi: 'कम जोखिम',
  },
  moderateRisk: {
    en: 'Moderate Risk',
    ta: 'மிதமான ஆபத்து',
    hi: 'मध्यम जोखिम',
  },
  highRisk: {
    en: 'High Risk',
    ta: 'அதிக ஆபத்து',
    hi: 'उच्च जोखिम',
  },
  highRiskAlertCreatedTitle: {
    en: 'HIGH-RISK ALERT CREATED',
    ta: 'அதி தீவிர எச்சரிக்கை உருவாக்கப்பட்டது',
    hi: 'उच्च जोखिम अलर्ट बनाया गया',
  },

  // Disclaimer Banner
  syntheticDataNotice: {
    en: 'Simulated Platform Notice — Synthetic IoT Telemetry',
    ta: 'உருவகப்படுத்தப்பட்ட தள அறிவிப்பு — செயற்கை IoT தொலைஅளவியல்',
    hi: 'सिमुलेटेड प्लेटफॉर्म सूचना — सिंथेटिक IoT टेलीमेट्री',
  },
  simulatedPlatformDesc: {
    en: 'This software platform runs early bovine mastitis risk forecasting using a trained Random Forest model. Demonstrations use synthetic sensor telemetry.',
    ta: 'இந்த மென்பொருள் தளம் பயிற்றுவிக்கப்பட்ட ரேண்டம் ஃபாரஸ்ட் மாதிரியைப் பயன்படுத்தி ஆரம்ப மடிநோய் அபாய முன்னறிவிப்பை இயக்குகிறது.',
    hi: 'यह सॉफ्टवेयर प्लेटफॉर्म प्रशिक्षित रैंडम फॉरेस्ट मॉडल का उपयोग करके प्रारंभिक गोजातीय थनैला जोखिम पूर्वानुमान चलाता है।',
  },

  // Gauge & Forecast
  earlyWarningForecast: {
    en: 'AI Early-Warning Forecast',
    ta: 'AI ஆரம்ப எச்சரிக்கை முன்னறிவிப்பு',
    hi: 'एआई प्रारंभिक चेतावनी पूर्वानुमान',
  },
  today: {
    en: 'Today',
    ta: 'இன்று',
    hi: 'आज',
  },
  observation: {
    en: 'Observation',
    ta: 'கண்காணிப்பு',
    hi: 'अवलोकन',
  },
  days7: {
    en: '7 days',
    ta: '7 நாட்கள்',
    hi: '7 दिन',
  },
  days14: {
    en: '14 days',
    ta: '14 நாட்கள்',
    hi: '14 दिन',
  },
  gaugeDisclaimer: {
    en: 'Prototype forecast based on synthetic data. Not a clinical diagnosis.',
    ta: 'செயற்கை தரவுகளின் அடிப்படையிலான மாதிரி முன்னறிவிப்பு. மருத்துவ நோயறிதல் அல்ல.',
    hi: 'सिंथेटिक डेटा पर आधारित प्रोटोटाइप पूर्वानुमान। नैदानिक निदान नहीं है।',
  },

  // Feature Importance & Explainability
  modelExplainability: {
    en: 'Model Explainability & Key Risk Factors',
    ta: 'மாதிரி விளக்கம் & முக்கிய ஆபத்துக் காரணிகள்',
    hi: 'मॉडल व्याख्यात्मकता और प्रमुख जोखिम कारक',
  },
  modelExplainabilityDesc: {
    en: 'Random Forest tree-path decomposition identifying primary contributors for this animal',
    ta: 'இந்த மாட்டிற்கான முதன்மைக் காரணிகளைக் கண்டறியும் ரேண்டம் ஃபாரஸ்ட் மர-பாதை பகுப்பாய்வு',
    hi: 'इस गाय के लिए प्राथमिक कारकों की पहचान करने वाला रैंडम फॉरेस्ट ट्री-पाथ विश्लेषण',
  },
  globalImportance: {
    en: 'Global Importance',
    ta: 'ஒட்டுமொத்த முக்கியத்துவம்',
    hi: 'वैश्विक महत्व',
  },
  individualContribution: {
    en: 'Individual Contribution',
    ta: 'தனிப்பட்ட பங்களிப்பு',
    hi: 'व्यक्तिगत योगदान',
  },

  // Sensor Simulation Modal
  modalSimulateTitle: {
    en: 'Simulate Live IoT Sensor Telemetry',
    ta: 'நேரடி IoT சென்சார் தரவை உருவகப்படுத்து',
    hi: 'लाइव IoT सेंसर टेलीमेट्री अनुकरण करें',
  },
  modalSimulateDesc: {
    en: 'Adjust physiological and environmental parameters, then trigger the AI model to observe real-time risk assessment recalculation.',
    ta: 'உடலியல் மற்றும் சுற்றுச்சூழல் அளவீடுகளை மாற்றி, நிகழ்நேர AI மதிப்பீட்டைப் பார்க்கவும்.',
    hi: 'शारीरिक और पर्यावरणीय मापदंडों को समायोजित करें, फिर वास्तविक समय एआई जोखिम मूल्यांकन देखें।',
  },
  presetScenarios: {
    en: 'Preset Scenarios',
    ta: 'முன்னமைக்கப்பட்ட காட்சிகள்',
    hi: 'प्रीसेट परिदृश्य',
  },
  healthyScenario: {
    en: 'Healthy Cow',
    ta: 'ஆரோக்கியமான மாடு',
    hi: 'स्वस्थ गाय',
  },
  moderateScenario: {
    en: 'Moderate Risk',
    ta: 'மிதமான ஆபத்து',
    hi: 'मध्यम जोखिम',
  },
  highRiskScenario: {
    en: 'High Mastitis Risk',
    ta: 'அதிக மடிநோய் ஆபத்து',
    hi: 'उच्च थनैला जोखिम',
  },
  resetBaseline: {
    en: 'Reset Baseline',
    ta: 'அடிப்படைக்கு மீட்டமை',
    hi: 'बेसलाइन पर रीसेट करें',
  },
  applyAndForecast: {
    en: 'Apply Telemetry & Recalculate AI Forecast',
    ta: 'தரவைப் பதிவு செய்து AI கணிப்பை புதுப்பி',
    hi: 'टेलीमेट्री लागू करें और एआई पूर्वानुमान अपडेट करें',
  },
  close: {
    en: 'Close',
    ta: 'மூடு',
    hi: 'बंद करें',
  },
  cancel: {
    en: 'Cancel',
    ta: 'ரத்து செய்',
    hi: 'ரद्द करें',
  },
  save: {
    en: 'Save',
    ta: 'சேமி',
    hi: 'सहेजें',
  },

  // CSV Uploader
  csvUploadTitle: {
    en: 'Batch Dataset Upload',
    ta: 'தொகுதி தரவுத்தள பதிவேற்றம்',
    hi: 'बैच डेटासेट अपलोड',
  },
  dragDropCsv: {
    en: 'Drag and drop your CSV dataset here, or click to browse',
    ta: 'உங்கள் CSV தரவு கோப்பை இங்கே இழுத்து விடவும், அல்லது உலாவ கிளிக் செய்யவும்',
    hi: 'अपनी सीएसवी डेटासेट फ़ाइल यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
  },
  browseFiles: {
    en: 'Browse Files',
    ta: 'கோப்புகளை உலாவு',
    hi: 'फ़ाइलें ब्राउज़ करें',
  },
  uploading: {
    en: 'Uploading and validating...',
    ta: 'பதிவேற்றி சரிபார்க்கிறது...',
    hi: 'अपलोड और सत्यापन हो रहा है...',
  },

  // Dashboard Specific
  dashboardTitle: {
    en: 'Herd Mastitis Intelligence Dashboard',
    ta: 'மந்தை மடிநோய் நுண்ணறிவு முகப்புப்பலகை',
    hi: 'झुंड थनैला इंटेलिजेंस डैशबोर्ड',
  },
  dashboardSubtitle: {
    en: 'Continuous 7–14 day predictive risk monitoring across 500 monitored herd cows',
    ta: '500 கண்காணிக்கப்படும் மாடுகளின் 7–14 நாள் தொடர் முன்னெச்சரிக்கை கண்காணிப்பு',
    hi: '500 निगरानी वाली गायों में निरंतर 7–14 दिन की प्रारंभिक जोखिम निगरानी',
  },
  quickActions: {
    en: 'Quick Operations',
    ta: 'விரைவு செயல்பாடுகள்',
    hi: 'त्वरित संचालन',
  },
  launchSimulatorBtn: {
    en: 'Open IoT Simulator',
    ta: 'IoT சிமுலேட்டரைத் திற',
    hi: 'IoT सिम्युलेटर खोलें',
  },
  viewAlertsBtn: {
    en: 'Inspect Alerts',
    ta: 'எச்சரிக்கைகளைப் பார்',
    hi: 'अलर्ट देखें',
  },
  viewDirectoryBtn: {
    en: 'Animal Directory',
    ta: 'கால்நடை அடைவு',
    hi: 'पशु निर्देशिका',
  },
  herdOverview: {
    en: 'Herd Health Overview',
    ta: 'மந்தை நலக் கண்ணோட்டம்',
    hi: 'झुंड स्वास्थ्य अवलोकन',
  },
  overallHerdRisk: {
    en: 'Overall Herd Risk Status',
    ta: 'ஒட்டுமொத்த மந்தை ஆபத்து நிலை',
    hi: 'समग्र झुंड जोखिम स्थिति',
  },
  avgSccLabel: {
    en: 'Average Herd SCC',
    ta: 'சராசரி மந்தை உயிரணு எண்ணிக்கை',
    hi: 'औसत झुंड SCC',
  },
  avgYieldLabel: {
    en: 'Average Daily Yield',
    ta: 'சராசரி தினசரி மகசூல்',
    hi: 'औसत दैनिक उत्पादन',
  },
  avgConductivityLabel: {
    en: 'Average Conductivity',
    ta: 'சராசரி மின்கடத்துத்திறன்',
    hi: 'औसत विद्युत चालकता',
  },
  avgRuminationLabel: {
    en: 'Average Rumination',
    ta: 'சராசரி அசைபோடுதல்',
    hi: 'औसत जुगाली',
  },
  riskDistributionTitle: {
    en: 'Herd Risk Distribution',
    ta: 'மந்தை ஆபத்து பரவல்',
    hi: 'झुंड जोखिम वितरण',
  },
  telemetryTrendsTitle: {
    en: 'Multivariate Telemetry & Risk Trends (Last 14 Days)',
    ta: 'தொலைஅளவியல் மற்றும் ஆபத்து போக்குகள் (கடந்த 14 நாட்கள்)',
    hi: 'टेलीमेट्री और जोखिम रुझान (पिछले 14 दिन)',
  },
  highRiskListTitle: {
    en: 'Current High-Risk Animals (Immediate Inspection Required)',
    ta: 'தற்போதைய அதிக ஆபத்துள்ள கால்நடைகள் (உடனடி ஆய்வு தேவை)',
    hi: 'वर्तमान उच्च जोखिम वाले पशु (तत्काल निरीक्षण आवश्यक)',
  },
  noHighRiskAnimalsMsg: {
    en: 'No cows currently flagged as High Risk in the herd database.',
    ta: 'மந்தை தரவுத்தளத்தில் தற்போது அதிக ஆபத்தில் எந்த மாடும் இல்லை.',
    hi: 'झुंड डेटाबेस में वर्तमान में कोई भी गाय उच्च जोखिम के रूप में चिह्नित नहीं है।',
  },

  // Animals Page
  animalsTitle: {
    en: 'Herd Animals Directory',
    ta: 'மந்தை கால்நடைகள் அடைவு',
    hi: 'झुंड पशु निर्देशिका',
  },
  animalsSubtitle: {
    en: 'Search, filter, and inspect individual animal health telemetry and AI risk forecasts',
    ta: 'தனிப்பட்ட கால்நடைகளின் நல அளவீடுகள் மற்றும் AI முன்னறிவிப்புகளைத் தேடவும், வடிகட்டவும், பார்வையிடவும்',
    hi: 'व्यक्तिगत पशु स्वास्थ्य टेलीमेट्री और एआई जोखिम पूर्वानुमान खोजें, फ़िल्टर करें और निरीक्षण करें',
  },
  reloadTable: {
    en: 'Reload Table',
    ta: 'அட்டவணையைப் புதுப்பி',
    hi: 'तालिका पुनः लोड करें',
  },
  searchAnimalsPlaceholder: {
    en: 'Search Animal ID, Farm, Breed...',
    ta: 'மாடு எண், பண்ணை, இனத்தைத் தேடுங்கள்...',
    hi: 'पशु आईडी, फार्म, नस्ल खोजें...',
  },
  farmFilter: {
    en: 'Farm',
    ta: 'பண்ணை',
    hi: 'फार्म',
  },
  allFarms: {
    en: 'All Farms',
    ta: 'அனைத்து பண்ணைகள்',
    hi: 'सभी फार्म',
  },
  breedFilter: {
    en: 'Breed',
    ta: 'இனம்',
    hi: 'नस्ल',
  },
  allBreeds: {
    en: 'All Breeds',
    ta: 'அனைத்து இனங்கள்',
    hi: 'सभी नस्लें',
  },
  riskCategoryFilter: {
    en: 'Risk Category',
    ta: 'ஆபத்து வகை',
    hi: 'जोखिम श्रेणी',
  },
  allRiskLevels: {
    en: 'All Risk Levels',
    ta: 'அனைத்து ஆபத்து நிலைகள்',
    hi: 'सभी जोखिम स्तर',
  },
  pastMastitisFilter: {
    en: 'Past Mastitis',
    ta: 'கடந்தகால மடிநோய்',
    hi: 'पिछला थनैला',
  },
  pastMastitisYes: {
    en: 'Yes (History)',
    ta: 'ஆம் (முந்தைய வரலாறு)',
    hi: 'हाँ (इतिहास)',
  },
  pastMastitisNo: {
    en: 'No (Clean)',
    ta: 'இல்லை (சுத்தமானது)',
    hi: 'नहीं (स्वच्छ)',
  },
  showingAnimals: {
    en: 'Showing',
    ta: 'காட்டப்படுகிறது',
    hi: 'दिखा रहा है',
  },
  ofAnimals: {
    en: 'of',
    ta: 'மொத்தம்',
    hi: 'का',
  },
  animalsLabel: {
    en: 'animals',
    ta: 'கால்நடைகள்',
    hi: 'पशु',
  },
  pageLabel: {
    en: 'Page',
    ta: 'பக்கம்',
    hi: 'पृष्ठ',
  },
  previousBtn: {
    en: 'Previous',
    ta: 'முந்தையது',
    hi: 'पिछला',
  },
  nextBtn: {
    en: 'Next',
    ta: 'அடுத்தது',
    hi: 'अगला',
  },
  thAnimalId: {
    en: 'Animal ID',
    ta: 'கால்நடை எண்',
    hi: 'पशु आईडी',
  },
  thFarm: {
    en: 'Farm',
    ta: 'பண்ணை',
    hi: 'फार्म',
  },
  thBreed: {
    en: 'Breed',
    ta: 'இனம்',
    hi: 'नस्ल',
  },
  thAge: {
    en: 'Age',
    ta: 'வயது',
    hi: 'आयु',
  },
  thLactation: {
    en: 'Lactation',
    ta: 'கறவை பருவம்',
    hi: 'दुग्धपान',
  },
  thYield: {
    en: 'Yield',
    ta: 'மகசூல்',
    hi: 'उत्पादन',
  },
  thScc: {
    en: 'SCC (cells/ml)',
    ta: 'உயிரணு எண்ணிக்கை (cells/ml)',
    hi: 'SCC (cells/ml)',
  },
  thActivity: {
    en: 'Activity',
    ta: 'செயல்பாடு',
    hi: 'गतिविधि',
  },
  thRumination: {
    en: 'Rumination',
    ta: 'அசைபோடுதல்',
    hi: 'जुगाली',
  },
  thRiskScore: {
    en: 'Risk Score',
    ta: 'ஆபத்து மதிப்பீடு',
    hi: 'जोखिम स्कोर',
  },
  thCategory: {
    en: 'Category',
    ta: 'வகை',
    hi: 'श्रेणी',
  },
  thAction: {
    en: 'Action',
    ta: 'செயல்பாடு',
    hi: 'कार्रवाई',
  },
  btnInspect: {
    en: 'Inspect',
    ta: 'ஆய்வு செய்',
    hi: 'निरीक्षण',
  },
  noAnimalsMatched: {
    en: 'No animals matched the selected filters.',
    ta: 'தேர்ந்தெடுக்கப்பட்ட வடிப்பான்களுக்கு கால்நடைகள் எதுவும் பொருந்தவில்லை.',
    hi: 'चयनित फ़िल्टर से कोई पशु मेल नहीं खाता।',
  },
  fetchingTelemetry: {
    en: 'Fetching animal telemetry...',
    ta: 'கால்நடை தொலைஅளவியல் தரவு பெறப்படுகிறது...',
    hi: 'पशु टेलीमेट्री प्राप्त की जा रही है...',
  },

  // Animal Details Page
  backToDirectory: {
    en: 'Back to Animal Directory',
    ta: 'கால்நடை அடைவுக்குத் திரும்பு',
    hi: 'पशु निर्देशिका पर वापस जाएं',
  },
  animalProfileTitle: {
    en: 'Animal Health Dossier',
    ta: 'கால்நடை நல ஆவணம்',
    hi: 'पशु स्वास्थ्य प्रोफ़ाइल',
  },
  generalInformation: {
    en: 'General Demographics',
    ta: 'பொது விவரங்கள்',
    hi: 'सामान्य विवरण',
  },
  milkingEnvironment: {
    en: 'Milking & Housing Environment',
    ta: 'பால் கறவை & கொட்டகை சூழல்',
    hi: 'दुग्धपान और आवास पर्यावरण',
  },
  simulatedVitalsSection: {
    en: 'Live Telemetry Sensors',
    ta: 'நேரடி தொலைஅளவியல் சென்சார்கள்',
    hi: 'लाइव टेलीमेट्री सेंसर',
  },
  aiRecommendationsSection: {
    en: 'AI Clinical Decision-Support Protocols',
    ta: 'AI மருத்துவ ஆதரவு பரிந்துரைகள்',
    hi: 'एआई नैदानिक निर्णय समर्थन प्रोटोकॉल',
  },
  openSimulatorModalBtn: {
    en: 'Simulate Telemetry Change',
    ta: 'தொலைஅளவியல் மாற்றத்தை உருவகப்படுத்து',
    hi: 'टेलीमेट्री परिवर्तन अनुकरण करें',
  },
  sendAlertSmsBtn: {
    en: 'Send SMS Alert',
    ta: 'எச்சரிக்கை SMS அனுப்பு',
    hi: 'अलर्ट एसएमएस भेजें',
  },
  refreshDataBtn: {
    en: 'Refresh Data',
    ta: 'தரவைப் புதுப்பி',
    hi: 'डेटा ताज़ा करें',
  },
  forecastDetailsTitle: {
    en: 'Forecast Details',
    ta: 'முன்னறிவிப்பு விவரங்கள்',
    hi: 'पूर्वानुमान विवरण',
  },
  predictionStatusLabel: {
    en: 'Prediction Status',
    ta: 'கணிப்பு நிலை',
    hi: 'पूर्वानुमान स्थिति',
  },
  smsAlertStatusTitle: {
    en: 'SMS Alert Status',
    ta: 'SMS எச்சரிக்கை நிலை',
    hi: 'एसएमएस अलर्ट स्थिति',
  },
  smsAlertDispatched: {
    en: 'SMS Alert Dispatched',
    ta: 'SMS எச்சரிக்கை அனுப்பப்பட்டது',
    hi: 'एसएमएस अलर्ट भेजा गया',
  },
  recipientLabel: {
    en: 'Recipient',
    ta: 'பெறுநர்',
    hi: 'प्राप्तकर्ता',
  },
  statusLabel: {
    en: 'Status',
    ta: 'நிலை',
    hi: 'स्थिति',
  },
  modeLabel: {
    en: 'Mode',
    ta: 'முறை',
    hi: 'मोड',
  },
  sentAtLabel: {
    en: 'Sent At',
    ta: 'அனுப்பப்பட்ட நேரம்',
    hi: 'भेजने का समय',
  },
  noSmsSentMsg: {
    en: 'No SMS alerts sent for this animal',
    ta: 'இந்த மாட்டிற்கு SMS எச்சரிக்கைகள் எதுவும் அனுப்பப்படவில்லை',
    hi: 'इस पशु के लिए कोई एसएमएस अलर्ट नहीं भेजा गया',
  },
  smsConfigHint: {
    en: 'SMS alerts are dispatched only for High Risk predictions.',
    ta: 'அதிக ஆபத்துள்ள கணிப்புகளுக்கு மட்டுமே SMS எச்சரிக்கைகள் அனுப்பப்படும்.',
    hi: 'एसएमएस अलर्ट केवल उच्च जोखिम वाले पूर्वानुमानों के लिए भेजे जाते हैं।',
  },
  animalProfileCardTitle: {
    en: 'Animal Profile',
    ta: 'கால்நடை விவரக் குறிப்பு',
    hi: 'पशु प्रोफ़ाइल',
  },
  dimLabel: {
    en: 'Days in Milk (DIM)',
    ta: 'கறவை நாட்கள் (DIM)',
    hi: 'दुग्धपान के दिन (DIM)',
  },
  vaccinationLabel: {
    en: 'Vaccination',
    ta: 'தடுப்பூசி நிலை',
    hi: 'टीकाकरण',
  },
  sensorStatusLabel: {
    en: 'Sensor Status',
    ta: 'சென்சார் நிலை',
    hi: 'सेंसर स्थिति',
  },
  treatmentHistoryLabel: {
    en: 'Treatment History',
    ta: 'சிகிச்சை வரலாறு',
    hi: 'उपचार इतिहास',
  },
  currentTelemetryHeader: {
    en: 'Current Milk & Physiological Telemetry',
    ta: 'தற்போதைய பால் & உடலியல் தொலைஅளவியல்',
    hi: 'वर्तमान दूध और शारीरिक टेलीमेट्री',
  },
  farmManagementHeader: {
    en: 'Farm Management & Environmental Conditions',
    ta: 'பண்ணை மேலாண்மை & சுற்றுச்சூழல் நிலைமைகள்',
    hi: 'फार्म प्रबंधन और पर्यावरणीय स्थितियां',
  },
  hygieneOverall: {
    en: 'Overall Hygiene',
    ta: 'ஒட்டுமொத்த சுகாதாரம்',
    hi: 'समग्र स्वच्छता',
  },
  milkingHygiene: {
    en: 'Milking Hygiene',
    ta: 'கறவை சுகாதாரம்',
    hi: 'दुग्ध स्वच्छता',
  },
  milkingSchedule: {
    en: 'Milking Schedule',
    ta: 'கறவை அட்டவணை',
    hi: 'दुग्धपान अनुसूची',
  },
  preventiveDecisionHeader: {
    en: 'Preventive Decision-Support Recommendations',
    ta: 'தடுப்பு முடிவெடுக்கும் பரிந்துரைகள்',
    hi: 'निवारक निर्णय-समर्थन सिफारिशें',
  },
  preventiveDecisionDesc: {
    en: 'These are AI-generated suggestions for the 7–14 day forecast window. They do not constitute veterinary prescriptions.',
    ta: 'இவை 7–14 நாள் முன்னறிவிப்பு காலத்திற்கான AI பரிந்துரைகள் ஆகும். இவை மருத்துவ மருந்துச்சீட்டு அல்ல.',
    hi: 'ये 7-14 दिनों की पूर्वानुमान अवधि के लिए एआई-जनित सुझाव हैं। ये पशु चिकित्सा नुस्खे नहीं हैं।',
  },
  importantDisclaimerTitle: {
    en: 'Important Disclaimer',
    ta: 'முக்கிய அறிவிப்பு',
    hi: 'महत्वपूर्ण अस्वीकरण',
  },
  animalNotFound: {
    en: 'Animal Not Found',
    ta: 'கால்நடை கிடைக்கவில்லை',
    hi: 'पशु नहीं मिला',
  },
  returnToList: {
    en: 'Return to Animal List',
    ta: 'கால்நடை பட்டியலுக்குத் திரும்பு',
    hi: 'पशु सूची पर वापस जाएं',
  },

  // Alerts Page
  alertsTitle: {
    en: 'Active Early Warning Alerts',
    ta: 'செயலில் உள்ள ஆரம்ப எச்சரிக்கைகள்',
    hi: 'सक्रिय प्रारंभिक चेतावनी अलर्ट',
  },
  alertsSubtitle: {
    en: "Real-time notifications generated when an animal's predicted mastitis risk exceeds threshold limits",
    ta: 'கால்நடையின் கணிக்கப்பட்ட மடிநோய் ஆபத்து வரம்புகளை மீறும் போது உருவாக்கப்படும் நிகழ்நேர அறிவிப்புகள்',
    hi: 'वास्तविक समय की सूचनाएं जब किसी पशु का अनुमानित थनैला जोखिम सीमा से अधिक हो जाता है',
  },
  refreshAlertsBtn: {
    en: 'Refresh Alerts',
    ta: 'எச்சரிக்கைகளைப் புதுப்பி',
    hi: 'अलर्ट ताज़ा करें',
  },
  filterStatusLabel: {
    en: 'Filter Status:',
    ta: 'வடிகட்டி நிலை:',
    hi: 'फ़िल्टर स्थिति:',
  },
  activeUnreviewed: {
    en: 'Active / Unreviewed',
    ta: 'செயலில் / ஆய்வு செய்யப்படாதவை',
    hi: 'सक्रिय / अनावलोकित',
  },
  reviewedTab: {
    en: 'Reviewed',
    ta: 'ஆய்வு செய்யப்பட்டவை',
    hi: 'समीक्षित',
  },
  allAlertsTab: {
    en: 'All Alerts',
    ta: 'அனைத்து எச்சரிக்கைகள்',
    hi: 'सभी अलर्ट',
  },
  severityLabel: {
    en: 'Severity:',
    ta: 'தீவிரம்:',
    hi: 'तीव्रता:',
  },
  allSeverities: {
    en: 'All Severities',
    ta: 'அனைத்து தீவிரங்கள்',
    hi: 'सभी तीव्रताएं',
  },
  highSeverity: {
    en: 'High Severity',
    ta: 'அதி தீவிரம்',
    hi: 'उच्च तीव्रता',
  },
  moderateSeverity: {
    en: 'Moderate Severity',
    ta: 'மிதமான தீவிரம்',
    hi: 'मध्यम तीव्रता',
  },
  lowSeverity: {
    en: 'Low Severity',
    ta: 'குறைந்த தீவிரம்',
    hi: 'कम तीव्रता',
  },
  smsAlertSentBadge: {
    en: 'SMS Alert Sent',
    ta: 'SMS அனுப்பப்பட்டது',
    hi: 'एसएमएस भेजा गया',
  },
  dispatchSmsBtn: {
    en: 'Dispatch SMS',
    ta: 'SMS அனுப்பு',
    hi: 'एसएमएस भेजें',
  },
  markReviewedBtn: {
    en: 'Mark Reviewed',
    ta: 'ஆய்வு செய்ததாகக் குறி',
    hi: 'समीक्षित चिह्नित करें',
  },
  reviewedBadge: {
    en: 'Reviewed',
    ta: 'ஆய்வு செய்யப்பட்டது',
    hi: 'समीक्षित',
  },
  noAlertsMatching: {
    en: 'No alerts found matching the current filter criteria.',
    ta: 'தற்போதைய வடிப்பான் அளவுகோல்களுடன் பொருந்தக்கூடிய எச்சரிக்கைகள் எதுவும் கிடைக்கவில்லை.',
    hi: 'वर्तमान फ़िल्टर मानदंडों से मेल खाने वाले कोई अलर्ट नहीं मिले।',
  },
  checkingAlertRecords: {
    en: 'Checking alert system records...',
    ta: 'எச்சரிக்கை அமைப்பு பதிவுகள் சரிபார்க்கப்படுகின்றன...',
    hi: 'अलर्ट सिस्टम रिकॉर्ड की जाँच हो रही है...',
  },

  // Herd Analytics Page
  analyticsHeader: {
    en: 'Herd-Wide Analytics & ML Metrics',
    ta: 'மந்தை அளவிலான பகுப்பாய்வு & ML அளவீடுகள்',
    hi: 'झुंड-व्यापी विश्लेषण और एमएल मेट्रिक्स',
  },
  analyticsSub: {
    en: 'Aggregate epidemiological patterns, risk clustering across farms, and ML model benchmarking',
    ta: 'தொற்றுநோயியல் முறைகள், பண்ணை வாரியான ஆபத்து மற்றும் மாதிரி மதிப்பீடு',
    hi: 'महामारी विज्ञान पैटर्न, फार्मों में जोखिम समूह और एमएल मॉडल बेंचमार्किंग',
  },
  refreshAnalyticsBtn: {
    en: 'Refresh Analytics',
    ta: 'பகுப்பாய்வைப் புதுப்பி',
    hi: 'विश्लेषण ताज़ा करें',
  },
  totalHerdSize: {
    en: 'Total Herd Size',
    ta: 'மொத்த மந்தை அளவு',
    hi: 'कुल झुंड का आकार',
  },
  avgSccCard: {
    en: 'Average SCC',
    ta: 'சராசரி SCC',
    hi: 'औसत SCC',
  },
  avgYieldCard: {
    en: 'Average Yield',
    ta: 'சராசரி மகசூல்',
    hi: 'औसत उत्पादन',
  },
  avgConductivityCard: {
    en: 'Avg Conductivity',
    ta: 'சராசரி கடத்துத்திறன்',
    hi: 'औसत चालकता',
  },
  highRiskRatioCard: {
    en: 'High Risk Ratio',
    ta: 'அதிக ஆபத்து விகிதம்',
    hi: 'उच्च जोखिम अनुपात',
  },
  avgRuminationCard: {
    en: 'Avg Rumination',
    ta: 'சராசரி அசைபோடுதல்',
    hi: 'औसत जुगाली',
  },
  riskByFarmTitle: {
    en: 'High-Risk Animal Distribution by Farm',
    ta: 'பண்ணை வாரியான அதிக ஆபத்து பரவல்',
    hi: 'फार्म अनुसार उच्च जोखिम वाले पशु वितरण',
  },
  riskByFarmDesc: {
    en: 'Concentration of high-risk cases across participating farms',
    ta: 'பண்ணைகளில் அதிக ஆபத்துள்ள நிகழ்வுகளின் செறிவு',
    hi: 'भाग लेने वाले फार्मों में उच्च जोखिम वाले मामलों की सांद्रता',
  },
  riskByBreedTitle: {
    en: 'Risk Breakdown by Cattle Breed',
    ta: 'கால்நடை இனம் வாரியான ஆபத்து விவரம்',
    hi: 'पशु नस्ल अनुसार जोखिम विभाजन',
  },
  riskByBreedDesc: {
    en: 'Vulnerability rates among Holstein, Jersey, Crossbreed, and indigenous breeds',
    ta: 'ஹோல்ஸ்டீன், ஜெர்சி, கலப்பின மற்றும் பிற இனங்களுக்கிடையேயான பாதிப்பு விகிதங்கள்',
    hi: 'होल्स्टीन, जर्सी, क्रॉसफ़ीड और स्वदेशी नस्लों के बीच भेद्यता दर',
  },
  sccVsRiskTitle: {
    en: 'Somatic Cell Count (SCC) vs. AI Risk Score Scatter',
    ta: 'உயிரணு எண்ணிக்கை (SCC) மற்றும் AI ஆபத்து தொடர்பு விளக்கப்படம்',
    hi: 'सोमैटिक सेल काउंट (SCC) बनाम एआई जोखिम स्कोर स्कैटर',
  },
  sccVsRiskDesc: {
    en: 'Correlation between SCC levels and 7–14 day mastitis probability',
    ta: 'SCC அளவுகள் மற்றும் 7–14 நாள் மடிநோய் நிகழ்தகவு இடையே உள்ள தொடர்பு',
    hi: 'SCC स्तरों और 7-14 दिन की थनैला संभावना के बीच सहसंबंध',
  },
  mlBenchmarkingTitle: {
    en: 'Machine Learning Model Benchmarking',
    ta: 'இயந்திர கற்றல் மாதிரி மதிப்பீடு',
    hi: 'मशीन लर्निंग मॉडल बेंचमार्किंग',
  },
  mlBenchmarkingDesc: {
    en: 'Evaluation metrics on 20% stratified test dataset split (random_state=42)',
    ta: '20% சோதனை தரவுத்தொகுப்பில் மாதிரி செயல்திறன் மதிப்பீட்டு அளவீடுகள்',
    hi: '20% स्तरीकृत परीक्षण डेटासेट विभाजन पर मूल्यांकन मेट्रिक्स',
  },
  primaryModelTitle: {
    en: 'Primary Model: Random Forest',
    ta: 'முதன்மை மாதிரி: ரேண்டம் ஃபாரஸ்ட்',
    hi: 'प्राथमिक मॉडल: रैंडम फॉरेस्ट',
  },
  selectedModelBadge: {
    en: 'SELECTED MODEL',
    ta: 'தேர்ந்தெடுக்கப்பட்ட மாதிரி',
    hi: 'चयनित मॉडल',
  },
  baselineModelTitle: {
    en: 'Baseline Model: Logistic Regression',
    ta: 'அடிப்படை மாதிரி: லாஜிஸ்டிக் பின்னடைவு',
    hi: 'बेसलाइन मॉडल: लॉजिस्टिक रिग्रेशन',
  },
  baselineBadge: {
    en: 'BASELINE',
    ta: 'அடிப்படை',
    hi: 'बेसलाइन',
  },
  accuracyLabel: {
    en: 'Accuracy',
    ta: 'துல்லியம்',
    hi: 'सटीकता',
  },
  rocAucLabel: {
    en: 'ROC-AUC',
    ta: 'ROC-AUC',
    hi: 'ROC-AUC',
  },
  f1ScoreLabel: {
    en: 'F1-Score',
    ta: 'F1-மதிப்பீடு',
    hi: 'F1-स्कोर',
  },
  precisionLabel: {
    en: 'Precision',
    ta: 'துல்லியத்தன்மை (Precision)',
    hi: 'परिशुद्धता (Precision)',
  },
  recallLabel: {
    en: 'Recall',
    ta: 'மீட்டெடுப்பு (Recall)',
    hi: 'रीकॉल (Recall)',
  },

  // Recommendations Page
  recommendationsGuideTitle: {
    en: 'Preventive Recommendation Guide',
    ta: 'தடுப்பு பரிந்துரை வழிகாட்டி',
    hi: 'निवारक सिफारिश गाइड',
  },
  recommendationsGuideSubtitle: {
    en: 'Standard operating procedures and preventive monitoring guidelines triggered by AI risk factors',
    ta: 'AI ஆபத்துக் காரணிகளால் தூண்டப்படும் நிலையான இயக்க நடைமுறைகள் மற்றும் வழிகாட்டுதல்கள்',
    hi: 'एआई जोखिम कारकों द्वारा ट्रिगर की गई मानक संचालन प्रक्रियाएं और निवारक निगरानी दिशानिर्देश',
  },
  categoryFilterLabel: {
    en: 'Category:',
    ta: 'வகை:',
    hi: 'श्रेणी:',
  },
  allCategoriesOption: {
    en: 'All Categories',
    ta: 'அனைத்து வகைகள்',
    hi: 'सभी श्रेणियां',
  },
  triggerThresholdLabel: {
    en: 'Trigger Threshold:',
    ta: 'தூண்டுதல் வரம்பு:',
    hi: 'ट्रिगर सीमा:',
  },

  // Settings Page
  systemSettingsTitle: {
    en: 'System Settings & Data Import',
    ta: 'அமைப்பு அமைப்புகள் & தரவு இறக்குமதி',
    hi: 'सिस्टम सेटिंग्स और डेटा आयात',
  },
  systemSettingsSubtitle: {
    en: 'Manage dataset imports, SMS alert notifications, ML model architecture, and system status',
    ta: 'தரவுத்தொகுப்பு இறக்குமதிகள், SMS விழிப்பூட்டல் அறிவிப்புகள் மற்றும் மாதிரி நிலையை நிர்வகிக்கவும்',
    hi: 'डेटासेट आयात, एसएमएस अलर्ट सूचनाएं, एमएल मॉडल आर्किटेक्चर और सिस्टम स्थिति प्रबंधित करें',
  },
  smsPanelTitle: {
    en: 'SMS Notifications & Early Warning Alerts',
    ta: 'SMS அறிவிப்புகள் & ஆரம்ப எச்சரிக்கைகள்',
    hi: 'एसएमएस सूचनाएं और प्रारंभिक चेतावनी अलर्ट',
  },
  smsPanelSubtitle: {
    en: 'Auto-dispatch simulated SMS when AI detects a High Risk animal',
    ta: 'AI அதிக ஆபத்தை கண்டறியும் போது தானியங்கி SMS அனுப்புதல்',
    hi: 'जब एआई उच्च जोखिम वाले पशु का पता लगाता है तो ऑटो-डिस्पैच नकली एसएमएस',
  },
  demoModeBadge: {
    en: 'Demo Mode — No real SMS sent',
    ta: 'மாதிரி முறை — உண்மையான SMS அனுப்பப்படவில்லை',
    hi: 'डेमो मोड — कोई वास्तविक एसएमएस नहीं भेजा गया',
  },
  demoModeDisclaimerTitle: {
    en: 'Demo Mode: SMS messages are simulated and no real SMS is sent.',
    ta: 'மாதிரி முறை: SMS செய்திகள் உருவகப்படுத்தப்பட்டவை, உண்மையான SMS அனுப்பப்படவில்லை.',
    hi: 'डेमो मोड: एसएमएस संदेश सिम्युलेटेड हैं और कोई वास्तविक एसएमएस नहीं भेजा जाता है।',
  },
  demoModeDisclaimerBody: {
    en: 'This system generates formatted early warning SMS alerts and saves them to the local database for audit purposes. No network call to a telecom provider is made. SMS recommendations do NOT prescribe antibiotics or medication. All messages direct recipients to inspect the animal and consult the responsible veterinary professional.',
    ta: 'இந்த அமைப்பு ஆரம்ப எச்சரிக்கை SMS-களை உருவாக்கி தணிக்கைக்காக உள்ளூர் தரவுத்தளத்தில் சேமிக்கிறது. தொலைத்தொடர்பு வழங்குநருக்கு பிணைய அழைப்பு எதுவும் செய்யப்படவில்லை. SMS பரிந்துரைகள் நுண்ணுயிர் எதிர்ப்பிகள் அல்லது மருந்துகளை பரிந்துரைக்காது.',
    hi: 'यह प्रणाली स्वरूपित प्रारंभिक चेतावनी एसएमएस अलर्ट उत्पन्न करती है और ऑडिट उद्देश्यों के लिए उन्हें स्थानीय डेटाबेस में सहेजती है। किसी दूरसंचार प्रदाता को कोई नेटवर्क कॉल नहीं की जाती है। एसएमएस सिफारिशें एंटीबायोटिक दवाओं या दवाओं का नुस्खा नहीं देती हैं।',
  },
  enableSmsTitle: {
    en: 'Enable SMS Notifications',
    ta: 'SMS அறிவிப்புகளை இயக்கு',
    hi: 'एसएमएस सूचनाएं सक्षम करें',
  },
  enableSmsDesc: {
    en: 'Auto-send for High Risk predictions (>60%)',
    ta: 'அதிக ஆபத்துள்ள கணிப்புகளுக்கு (>60%) தானாக அனுப்பு',
    hi: 'उच्च जोखिम वाले पूर्वानुमानों (>60%) के लिए ऑटो-भेजें',
  },
  smsModeTitle: {
    en: 'SMS Mode',
    ta: 'SMS முறை',
    hi: 'एसएमएस मोड',
  },
  simulatedSmsActive: {
    en: 'Simulated SMS ✓ Active',
    ta: 'உருவகப்படுத்தப்பட்ட SMS ✓ செயலில் உள்ளது',
    hi: 'सिम्युलेटेड एसएमएस ✓ सक्रिय',
  },
  realSmsComingSoon: {
    en: 'Real SMS (Coming Soon)',
    ta: 'உண்மையான SMS (விரைவில்)',
    hi: 'वास्तविक एसएमएस (जल्द आ रहा है)',
  },
  farmerPhoneTitle: {
    en: 'Farmer Phone Number',
    ta: 'விவசாயி தொலைபேசி எண்',
    hi: 'किसान फोन नंबर',
  },
  vetPhoneTitle: {
    en: 'Veterinarian Phone Number',
    ta: 'கால்நடை மருத்துவர் தொலைபேசி எண்',
    hi: 'पशु चिकित्सक फोन नंबर',
  },
  saveSmsSettingsBtn: {
    en: 'Save SMS Settings',
    ta: 'SMS அமைப்புகளைச் சேமி',
    hi: 'एसएमएस सेटिंग्स सहेजें',
  },
  settingsSavedBadge: {
    en: 'Settings saved!',
    ta: 'அமைப்புகள் சேமிக்கப்பட்டன!',
    hi: 'सेटिंग्स सहेजी गईं!',
  },
  sendTestSmsTitle: {
    en: 'Send Test SMS',
    ta: 'சோதனை SMS அனுப்பு',
    hi: 'परीक्षण एसएमएस भेजें',
  },
  sendTestSmsDesc: {
    en: 'Verifies the simulated SMS pipeline is working. No real message is transmitted.',
    ta: 'உருவகப்படுத்தப்பட்ட SMS குழாய் செயல்படுவதை சரிபார்க்கிறது. உண்மையான செய்தி அனுப்பப்படவில்லை.',
    hi: 'सत्यापित करता है कि नकली एसएमएस पाइपलाइन काम कर रही है। कोई वास्तविक संदेश प्रसारित नहीं होता है।',
  },
  testRecipientPlaceholder: {
    en: 'Override recipient (optional — uses farmer/vet phone if blank)',
    ta: 'பெறுநர் எண் (விருப்பத்தேர்வு)',
    hi: 'प्राप्तकर्ता बदलें (वैकल्पिक)',
  },
  sendTestSmsButtonText: {
    en: 'Send Test SMS',
    ta: 'சோதனை SMS அனுப்பு',
    hi: 'परीक्षण एसएमएस भेजें',
  },
  recentSmsHistoryTitle: {
    en: 'Recent SMS Notification History',
    ta: 'சமீபத்திய SMS அறிவிப்பு வரலாறு',
    hi: 'हालिया एसएमएस अधिसूचना इतिहास',
  },
  noSmsRecordedMsg: {
    en: 'No SMS notifications recorded yet. Send a test or trigger a High Risk prediction.',
    ta: 'இதுவரை SMS அறிவிப்புகள் எதுவும் பதிவு செய்யப்படவில்லை.',
    hi: 'अभी तक कोई एसएमएस सूचना दर्ज नहीं की गई है।',
  },
  primaryModelCardTitle: {
    en: 'Primary Model',
    ta: 'முதன்மை மாதிரி',
    hi: 'प्राथमिक मॉडल',
  },
  primaryModelCardDesc: {
    en: '150 Estimators with balanced class weighting and Joblib persistence (ml/model.pkl).',
    ta: '150 மரங்கள் கொண்ட சமப்படுத்தப்பட்ட ரேண்டம் ஃபாரஸ்ட் மாதிரி.',
    hi: 'संतुलित वर्ग भार और जॉबलिब दृढ़ता (ml/model.pkl) के साथ 150 अनुमानक।',
  },
  persistenceEngineTitle: {
    en: 'Persistence Engine',
    ta: 'தரவுத்தள சேமிப்பகம்',
    hi: 'स्थिरता इंजन',
  },
  persistenceEngineDesc: {
    en: 'Stores animals, sensor observation logs, prediction audit trails, alerts, and SMS notification records.',
    ta: 'கால்நடைகள், சென்சார் அவதானிப்புகள், கணிப்புகள், எச்சரிக்கைகள் மற்றும் SMS பதிவுகளைச் சேமிக்கிறது.',
    hi: 'पशुओं, सेंसर अवलोकन लॉग, पूर्वानुमान ऑडिट ट्रेल्स, अलर्ट और एसएमएस अधिसूचना रिकॉर्ड संग्रहीत करता है।',
  },
  baselineModelCardTitle: {
    en: 'Baseline Model',
    ta: 'அடிப்படை மாதிரி',
    hi: 'बेसलाइन मॉडल',
  },
  baselineModelCardDesc: {
    en: 'Linear baseline classifier used for performance benchmarking and comparative validation.',
    ta: 'செயல்திறன் மதிப்பீட்டிற்குப் பயன்படுத்தப்படும் நேரியல் அடிப்படை வகைப்படுத்தி.',
    hi: 'प्रदर्शन बेंचमार्किंग और तुलनात्मक सत्यापन के लिए उपयोग किया जाने वाला रैखिक बेसलाइन क्लासिफायर।',
  },

  // Common UI elements
  loadingData: {
    en: 'Loading data...',
    ta: 'தரவு ஏற்றப்படுகிறது...',
    hi: 'डेटा लोड हो रहा है...',
  },
  noDataFound: {
    en: 'No records found',
    ta: 'பதிவுகள் எதுவும் கிடைக்கவில்லை',
    hi: 'कोई रिकॉर्ड नहीं मिला',
  },
  errorLoading: {
    en: 'Error loading data. Please try again.',
    ta: 'தரவை ஏற்றுவதில் பிழை. மீண்டும் முயற்சிக்கவும்.',
    hi: 'डेटा लोड करने में त्रुटि। कृपया पुन: प्रयास करें।',
  },
  languageLabel: {
    en: 'Language',
    ta: 'மொழி',
    hi: 'भाषा',
  },
};
