import React, { useState, useEffect } from 'react';
import { Globe, Info, X, Moon, Sun } from 'lucide-react';
import { IndividualMode } from './components/IndividualMode';
import { SocialMode } from './components/SocialMode';
import { BottomNav } from './components/BottomNav';
import { BadgePopup } from './components/BadgePopup';
import { NotificationToast } from './components/NotificationToast';
import { ExerciseModal } from './components/ExerciseModal';
import { AICoach } from './components/AICoach';
import { VASModal } from './components/VASModal';
import { Confetti } from './components/Confetti';

export type Tab = 'individual' | 'social';
export type Lang = 'en' | 'ar';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: string;
  videoUrl: string;
  thumbnailUrl: string;
  steps: string[];
  category: string;
}

// --- UTILS ---
export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- TRANSLATION DICTIONARY ---
const TRANSLATIONS = {
  en: {
    // Home / Profile
    welcome: "Good Morning,",
    name: "Mahmoud Behairy",
    dailyGoal: "Daily Goal",
    streakTitle: "5 Day Streak!",
    streakSub: "Keep up the momentum!",
    achievements: "Your Achievements",
    badge1: "First Step",
    badge2: "Warrior",
    badge3: "Week 1 Done",
    startExercise: "Start Daily Exercise",
    completed: "Completed!",
    doAgain: "Log Another Session",
    tabProgress: "My Progress",
    tabLeaderboard: "Leaderboard",
    historyHeader: "Today's Activity",
    painChartTitle: "Pain vs. Activity",
    libraryTitle: "Exercise Library",
    librarySub: "Recommended for CBP",
    all: "All",
    share: "Share",
    
    // Leaderboard
    compHeader: "Weekly Competition",
    compSub: "Ends in 2 days",
    bannerTitle: "Catch up to Dr. Shimaa!",
    bannerText: "Only 50 points needed to take 1st place. Do your exercises now!",
    you: "YOU",
    keepPushing: "Keep pushing!",
    consistent: "Consistent!",
    expert: "Expert",
    points: "pts",
    drShimaa: "Dr. Shimaa",
    mahmoud: "Mahmoud Behairy",
    sarah: "Sarah",
    ali: "Ali",
    omar: "Omar",
    highFiveSent: "High Five Sent! 👋",
    highFiveMsg: "You encouraged",
    communityFeed: "Community Activity",
    justNow: "Just now",
    minsAgo: "m ago",
    feed1: "completed her daily goal",
    feed2: "earned the 'Warrior' badge",
    feed3: "logged a low pain score!",

    // Toasts
    toastCompTitle: "Competition Alert",
    toastCompMsg: "Dr. Shimaa just earned 100 points! Don't fall behind.",
    toastStreakTitle: "🔥 Streak Updated",
    toastStreakMsg: "Way to go! You kept your 5-day streak alive.",
    toastShareTitle: "Shared!",
    toastShareMsg: "Your achievements have been shared to your feed.",

    // Exercise Modal (Generic)
    todayExercise: "Selected Exercise",
    instructionsTitle: "Instructions",
    listen: "Listen",
    stop: "Stop",
    completeButton: "Complete & Log Exercise",
    timeLabel: "Time",
    intensityLabel: "Intensity",
    timerStart: "Start Timer",
    timerPause: "Pause",
    timerReset: "Reset",
    timerFinished: "Time's Up!",

    // Badge Popup
    badgeUnlocked: "Badge Unlocked!",
    congratsBadge: "Congratulations! You've earned the",
    consistencyKing: "\"Consistency King\"",
    awesome: "Awesome!",
    remixAI: "Remix Badge with AI",
    remixDesc: "Describe how you want to change your badge (e.g., \"Add a retro filter\", \"Make it neon\").",
    remixPlaceholder: "Add a retro filter...",
    cancel: "Cancel",

    // AI Coach
    coachHeader: "G-Back Coach",
    poweredBy: "Powered by Gemini",
    askPlaceholder: "Ask me anything...",
    voiceMode: "Live Voice Mode",
    listening: "Listening...",
    connecting: "Connecting...",
    endSession: "End Session",
    micError: "Microphone access denied.",
    connectionLost: "Connection lost.",
    greeting: "Ready to strengthen your back today?",
    highPainAlert: "I noticed your pain is high today. Would you like to try a gentle stretching modification?",

    // VAS & Report
    vasTitle: "Where does it hurt?",
    vasScaleTitle: "How bad is the pain?",
    tapBody: "Tap on the body map to locate your pain.",
    vasLow: "No Pain",
    vasHigh: "Worst Pain",
    next: "Next",
    submit: "Submit",
    sendReport: "📄 Send Report to Dr. Shimaa",
    reportSent: "Report Sent",
    reportSentMsg: "Successfully sent to Dr. Shimaa's Clinic!",

    // About App
    aboutTitle: "About G-Back",
    developedBy: "Developed by",
    supervisor: "Under Supervision of",
    faculty: "Faculty of Physical Therapy, MTI University - 2025"
  },
  ar: {
    // Home / Profile
    welcome: "صباح الخير،",
    name: "محمود بحيري",
    dailyGoal: "الهدف اليومي",
    streakTitle: "حماس ٥ أيام!",
    streakSub: "حافظ على هذا الزخم!",
    achievements: "إنجازاتك",
    badge1: "الخطوة الأولى",
    badge2: "المحارب",
    badge3: "تم أسبوع ١",
    startExercise: "ابدأ التمرين اليومي",
    completed: "تم الإنجاز!",
    doAgain: "تسجيل جلسة أخرى",
    tabProgress: "تقدمي",
    tabLeaderboard: "لوحة الصدارة",
    historyHeader: "نشاط اليوم",
    painChartTitle: "مؤشر الألم والنشاط",
    libraryTitle: "مكتبة التمارين",
    librarySub: "موصى به لآلام الظهر",
    all: "الكل",
    share: "مشاركة",

    // Leaderboard
    compHeader: "المنافسة الأسبوعية",
    compSub: "تنتهي خلال يومين",
    bannerTitle: "اللحاق بالدكتورة شيماء!",
    bannerText: "فقط ٥٠ نقطة للوصول للمركز الأول. تمرن الآن!",
    you: "أنت",
    keepPushing: "استمر بالمحاولة!",
    consistent: "مثابر!",
    expert: "خبير",
    points: "نقطة",
    drShimaa: "د. شيماء",
    mahmoud: "محمود بحيري",
    sarah: "سارة",
    ali: "علي",
    omar: "عمر",
    highFiveSent: "تم إرسال التحية! 👋",
    highFiveMsg: "لقد قمت بتشجيع",
    communityFeed: "نشاط المجتمع",
    justNow: "الآن",
    minsAgo: "دقيقة",
    feed1: "أكملت هدفها اليومي",
    feed2: "حصلت على شارة 'المحارب'",
    feed3: "سجلت درجة ألم منخفضة!",

    // Toasts
    toastCompTitle: "تنبيه المنافسة",
    toastCompMsg: "د. شيماء كسبت ١٠٠ نقطة! لا تتراجع.",
    toastStreakTitle: "🔥 تحديث الحماس",
    toastStreakMsg: "أحسنت! حافظت على سلسلة ٥ أيام متواصلة.",
    toastShareTitle: "تمت المشاركة!",
    toastShareMsg: "تم مشاركة تقدمك مع الأصدقاء.",

    // Exercise Modal
    todayExercise: "التمرين المختار",
    instructionsTitle: "التعليمات",
    listen: "استمع",
    stop: "توقف",
    completeButton: "إتمام وتسجيل التمرين",
    timeLabel: "الوقت",
    intensityLabel: "الشدة",
    timerStart: "بدء المؤقت",
    timerPause: "إيقاف",
    timerReset: "إعادة",
    timerFinished: "انتهى الوقت!",

    // Badge Popup
    badgeUnlocked: "تم فتح شارة!",
    congratsBadge: "تهانينا! لقد حصلت على شارة",
    consistencyKing: "\"ملك الاستمرارية\"",
    awesome: "رائع!",
    remixAI: "تعديل الشارة بالذكاء الاصطناعي",
    remixDesc: "صف كيف تريد تغيير شارتك (مثال: \"أضف طابع ريترو\"، \"اجعلها نيون\").",
    remixPlaceholder: "أضف تأثير نيون...",
    cancel: "إلغاء",

    // AI Coach
    coachHeader: "مدرب G-Back",
    poweredBy: "مدعوم بواسطة Gemini",
    askPlaceholder: "اسألني أي شيء...",
    voiceMode: "وضع التحدث المباشر",
    listening: "جاري الاستماع...",
    connecting: "جاري الاتصال...",
    endSession: "إنهاء الجلسة",
    micError: "تم رفض الوصول للميكروفون.",
    connectionLost: "فقد الاتصال.",
    greeting: "هل أنت مستعد لتقوية ظهرك اليوم؟",
    highPainAlert: "لاحظت أن الألم مرتفع اليوم. هل ترغب في تجربة تعديل بسيط للتمارين؟",

    // VAS & Report
    vasTitle: "أين تشعر بالألم؟",
    vasScaleTitle: "ما مدى شدة الألم؟",
    tapBody: "اضغط على خريطة الجسم لتحديد موقع الألم.",
    vasLow: "لا يوجد ألم",
    vasHigh: "ألم لا يطاق",
    next: "التالي",
    submit: "إرسال",
    sendReport: "📄 إرسال التقرير للدكتورة شيماء",
    reportSent: "تم الإرسال",
    reportSentMsg: "تم إرسال تقرير تقدمك إلى عيادة د. شيماء بنجاح.",

    // About App
    aboutTitle: "عن تطبيق G-Back",
    developedBy: "تطوير",
    supervisor: "تحت إشراف",
    faculty: "كلية العلاج الطبيعي، جامعة MTI - ٢٠٢٥"
  }
};

// --- DATA: EXERCISE LIBRARY ---
const getExercises = (lang: Lang): Exercise[] => {
    const isEn = lang === 'en';
    return [
        {
            id: 'standing_ext',
            title: isEn ? "Standing Back Extension" : "تمرين تمدد الظهر واقفاً",
            description: isEn 
                ? "Strengthens your lower back muscles and improves spinal stability to reduce pain." 
                : "يقوي عضلات أسفل الظهر ويحسن ثبات العمود الفقري لتقليل الألم.",
            duration: isEn ? "5 Mins" : "٥ دقائق",
            intensity: isEn ? "Low" : "منخفضة",
            category: isEn ? "Stability" : "ثبات",
            videoUrl: "https://videos.pexels.com/video-files/5319759/5319759-sd_640_360_25fps.mp4",
            thumbnailUrl: "https://images.pexels.com/photos/4506166/pexels-photo-4506166.jpeg?auto=compress&cs=tinysrgb&w=600",
            steps: isEn ? [
                "Stand upright with your feet shoulder-width apart.",
                "Place your hands on your lower back for support.",
                "Gently lean backward, arching your spine comfortably.",
                "Hold for 3 seconds, then return to start. Repeat 10 times."
            ] : [
                "قف بشكل مستقيم مع مباعدة القدمين بعرض الكتفين.",
                "ضع يديك على أسفل ظهرك للدعم.",
                "قم بالميل للخلف بلطف، مع تقويس العمود الفقري بشكل مريح.",
                "ثبت لمدة ٣ ثوانٍ، ثم عد لوضعية البداية. كرر ١٠ مرات."
            ]
        },
        {
            id: 'pelvic_tilt',
            title: isEn ? "Pelvic Tilt" : "إمالة الحوض",
            description: isEn
                ? "A fundamental exercise to strengthen abdominal muscles and stretch the lower back."
                : "تمرين أساسي لتقوية عضلات البطن وتمديد أسفل الظهر.",
            duration: isEn ? "5 Mins" : "٥ دقائق",
            intensity: isEn ? "Low" : "منخفضة",
            category: isEn ? "Core" : "عضلات البطن",
            videoUrl: "https://videos.pexels.com/video-files/4496229/4496229-sd_640_360_25fps.mp4", // Placeholder
            thumbnailUrl: "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=600",
            steps: isEn ? [
                "Lie on your back with knees bent and feet flat on floor.",
                "Flatten your back against the floor by tightening abdominal muscles.",
                "Hold for 5 to 10 seconds while breathing normally.",
                "Relax and repeat 10 times."
            ] : [
                "استلقِ على ظهرك مع ثني الركبتين ووضع القدمين على الأرض.",
                "اضغط بظهرك على الأرض عن طريق شد عضلات البطن.",
                "استمر لمدة ٥ إلى ١٠ ثوانٍ مع التنفس بشكل طبيعي.",
                "استرخ وكرر ١٠ مرات."
            ]
        },
        {
            id: 'cat_cow',
            title: isEn ? "Cat-Cow Stretch" : "تمرين القطة والجمل",
            description: isEn 
                ? "Increases flexibility of the neck, shoulders, and spine. Great for stiffness."
                : "يزيد من مرونة الرقبة والكتفين والعمود الفقري. ممتاز لتيبس الظهر.",
            duration: isEn ? "3 Mins" : "٣ دقائق",
            intensity: isEn ? "Low" : "منخفضة",
            category: isEn ? "Mobility" : "مرونة",
            videoUrl: "https://videos.pexels.com/video-files/4434242/4434242-sd_640_360_24fps.mp4",
            thumbnailUrl: "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=600",
            steps: isEn ? [
                "Start on your hands and knees, back neutral.",
                "Inhale and arch your back (Cow), looking up.",
                "Exhale and round your spine (Cat), tucking your chin.",
                "Move slowly between positions for 1-2 minutes."
            ] : [
                "ابدأ على يديك وركبتيك بظهر مستقيم.",
                "استنشق وقوس ظهرك لأسفل (البقرة) مع النظر للأعلى.",
                "ازفر ودور عمودك الفقري للأعلى (القطة) مع خفض ذقنك.",
                "تحرك ببطء بين الوضعيتين لمدة دقيقة أو دقيقتين."
            ]
        },
        {
            id: 'bird_dog',
            title: isEn ? "Bird-Dog" : "تمرين الطائر والكلب",
            description: isEn 
                ? "Improves balance and stability by engaging core and back muscles."
                : "يحسن التوازن والثبات من خلال تشغيل عضلات البطن والظهر.",
            duration: isEn ? "8 Mins" : "٨ دقائق",
            intensity: isEn ? "Medium" : "متوسطة",
            category: isEn ? "Stability" : "ثبات",
            videoUrl: "https://videos.pexels.com/video-files/4057867/4057867-sd_640_360_25fps.mp4",
            thumbnailUrl: "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600",
            steps: isEn ? [
                "Start on all fours. Keep your spine neutral.",
                "Extend your right arm forward and left leg back.",
                "Hold for a few seconds, keeping hips level.",
                "Switch sides. Repeat 8-10 reps per side."
            ] : [
                "ابدأ على الأطراف الأربعة. حافظ على استقامة عمودك الفقري.",
                "مد ذراعك اليمنى للأمام وساقك اليسرى للخلف.",
                "ثبت لثوانٍ مع الحفاظ على استواء الوركين.",
                "بدل الجوانب. كرر ٨-١٠ مرات لكل جانب."
            ]
        },
        {
            id: 'knee_chest',
            title: isEn ? "Knee-to-Chest Stretch" : "ضم الركبة للصدر",
            description: isEn 
                ? "Relieves tension in the lower back and glutes."
                : "يخفف التوتر في أسفل الظهر وعضلات الأرداف.",
            duration: isEn ? "4 Mins" : "٤ دقائق",
            intensity: isEn ? "Low" : "منخفضة",
            category: isEn ? "Relief" : "راحة",
            videoUrl: "https://videos.pexels.com/video-files/6755883/6755883-sd_640_360_25fps.mp4",
            thumbnailUrl: "https://images.pexels.com/photos/3759658/pexels-photo-3759658.jpeg?auto=compress&cs=tinysrgb&w=600",
            steps: isEn ? [
                "Lie on your back with legs extended.",
                "Pull one knee up to your chest, holding with hands.",
                "Keep the other leg flat or knee bent.",
                "Hold for 20-30 seconds, then switch legs."
            ] : [
                "استلقِ على ظهرك مع مد الساقين.",
                "اسحب ركبة واحدة نحو صدرك وأمسكها بيديك.",
                "حافظ على الساق الأخرى مسطحة أو مثنية الركبة.",
                "ثبت لمدة ٢٠-٣٠ ثانية، ثم بدل الساقين."
            ]
        },
        {
            id: 'child_pose',
            title: isEn ? "Child's Pose" : "وضعية الطفل",
            description: isEn 
                ? "A restful pose that gently stretches the spine, hips, and thighs."
                : "وضعية مريحة تمدد العمود الفقري والوركين والفخذين بلطف.",
            duration: isEn ? "2 Mins" : "٢ دقيقة",
            intensity: isEn ? "Low" : "منخفضة",
            category: isEn ? "Relief" : "راحة",
            videoUrl: "https://videos.pexels.com/video-files/6698662/6698662-sd_640_360_25fps.mp4",
            thumbnailUrl: "https://images.pexels.com/photos/3756525/pexels-photo-3756525.jpeg?auto=compress&cs=tinysrgb&w=600",
            steps: isEn ? [
                "Kneel on the floor and sit back on your heels.",
                "Lean forward, extending your arms on the floor in front of you.",
                "Rest your forehead on the floor and breathe deeply.",
                "Hold for 1-2 minutes."
            ] : [
                "اركع على الأرض واجلس على كعبيك.",
                "مل للأمام، مع مد ذراعيك على الأرض أمامك.",
                "أرح جبهتك على الأرض وتنفس بعمق.",
                "استمر لمدة دقيقة أو دقيقتين."
            ]
        }
    ];
};

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = TRANSLATIONS[lang];
  const exercises = getExercises(lang);
  
  // -- Persistent State --
  const [activeTab, setActiveTab] = useState<Tab>('individual');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('gback_dark');
        return saved === 'true';
    }
    return false;
  });
  
  // Initialize from LocalStorage or Default
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('gback_progress');
    return saved ? parseInt(saved) : 75;
  });

  const [hasLoggedToday, setHasLoggedToday] = useState(() => {
    return localStorage.getItem('gback_hasLogged') === 'true';
  });

  const [exerciseLogs, setExerciseLogs] = useState<{ id: number, name: string, time: string }[]>(() => {
    const saved = localStorage.getItem('gback_exerciseLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [painLogs, setPainLogs] = useState<{ date: string, score: number }[]>(() => {
    const saved = localStorage.getItem('gback_painLogs');
    return saved ? JSON.parse(saved) : [
        { date: 'Mon', score: 8 },
        { date: 'Tue', score: 7 },
        { date: 'Wed', score: 5 },
        { date: 'Thu', score: 6 },
        { date: 'Fri', score: 4 },
    ];
  });

  // -- UI State --
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [isExerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise>(exercises[0]);
  const [showVASModal, setShowVASModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // AI Coach Trigger
  const [aiCoachTrigger, setAiCoachTrigger] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('gback_progress', progress.toString()); }, [progress]);
  useEffect(() => { localStorage.setItem('gback_hasLogged', hasLoggedToday.toString()); }, [hasLoggedToday]);
  useEffect(() => { localStorage.setItem('gback_exerciseLogs', JSON.stringify(exerciseLogs)); }, [exerciseLogs]);
  useEffect(() => { localStorage.setItem('gback_painLogs', JSON.stringify(painLogs)); }, [painLogs]);
  useEffect(() => { localStorage.setItem('gback_dark', isDarkMode.toString()); }, [isDarkMode]);
  
  // Update current exercise object when language changes
  useEffect(() => {
      const newExercises = getExercises(lang);
      const found = newExercises.find(e => e.id === currentExercise.id);
      if (found) setCurrentExercise(found);
      else setCurrentExercise(newExercises[0]);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
    vibrate(50);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    vibrate(50);
  };

  const triggerNotification = (title: string, message: string) => {
    setNotification(null);
    vibrate([50, 50, 50]);
    setTimeout(() => {
      setNotification({ title, message });
    }, 50);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    vibrate(30);
    if (tab === 'social') {
      setTimeout(() => {
        triggerNotification(t.toastCompTitle, t.toastCompMsg);
      }, 1000);
    }
  };

  const handleOpenLog = (exercise?: Exercise) => {
    if (exercise) {
        setCurrentExercise(exercise);
    } else {
        // Default to first one if none selected (e.g. via main CTA)
        setCurrentExercise(exercises[0]);
    }
    setExerciseModalOpen(true);
    vibrate(50);
  };

  const handleConfirmLog = () => {
    setExerciseModalOpen(false);
    vibrate(50);
    // Show VAS Modal instead of immediate success
    setTimeout(() => setShowVASModal(true), 300);
  };

  const handleVASSubmit = (painScore: number, painLocation: {x: number, y: number} | null) => {
    setShowVASModal(false);
    vibrate([100, 50, 100]); // Success pattern logic
    
    // Add to exercise history
    const newLog = {
        id: Date.now(),
        name: currentExercise.title,
        time: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setExerciseLogs(prev => [newLog, ...prev]);

    // Add to pain history
    const todayLabel = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { weekday: 'short' });
    setPainLogs(prev => [...prev.slice(-6), { date: todayLabel, score: painScore }]);

    // Smart AI Insight: High Pain Alert
    if (painScore >= 7) {
        setTimeout(() => {
            setAiCoachTrigger(t.highPainAlert);
        }, 2000);
    }

    // Start Success Animation
    let start = progress; 
    const end = Math.min(progress + 25, 100); 
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
      const currentVal = start + (end - start) * easedProgress;
      setProgress(currentVal);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation Completed
        setHasLoggedToday(true);
        if (end >= 100) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5s
        }
        if (!hasLoggedToday) {
            setTimeout(() => setShowBadgePopup(true), 300);
        }
        setTimeout(() => {
          triggerNotification(t.toastStreakTitle, t.toastStreakMsg);
        }, 1500);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleSendReport = () => {
    triggerNotification(t.reportSent, t.reportSentMsg);
  };
  
  const handleShare = () => {
    triggerNotification(t.toastShareTitle, t.toastShareMsg);
  };

  const handleHighFive = (name: string) => {
    triggerNotification(t.highFiveSent, `${t.highFiveMsg} ${name}!`);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const fontClass = lang === 'ar' ? 'font-arabic' : 'font-sans';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-200 ${fontClass}`}>
      {/* Celebration Confetti */}
      {showConfetti && <Confetti />}

      {/* Phone Frame - Add 'dark' class here if isDarkMode */}
      <div 
        className={`relative w-full max-w-[375px] h-[812px] rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}
        dir={dir}
      >
        
        {/* Notch simulation */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-50"></div>

        {/* Status Bar */}
        <div className="h-16 w-full bg-white dark:bg-gray-900 shrink-0 flex items-end justify-between px-6 pb-2 border-b border-gray-50 dark:border-gray-800 z-40 transition-colors duration-300">
            <div className="text-xs font-bold text-gray-900 dark:text-white">9:41</div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button 
                  onClick={toggleDarkMode}
                  className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-gray-600" />}
              </button>
              <button 
                  onClick={() => setShowAboutModal(true)}
                  className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                  <Info className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                  onClick={toggleLang} 
                  className="flex items-center space-x-1 rtl:space-x-reverse bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                  <Globe className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{lang === 'en' ? 'EN' : 'عربي'}</span>
              </button>
            </div>
        </div>

        {/* Notifications */}
        {notification && (
          <NotificationToast 
            title={notification.title} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-gray-950 relative transition-colors duration-300">
          
          {activeTab === 'individual' ? (
            <IndividualMode 
              progress={progress} 
              onLogExercise={handleOpenLog}
              hasLogged={hasLoggedToday}
              onSendReport={handleSendReport}
              onShare={handleShare}
              exerciseLogs={exerciseLogs}
              painLogs={painLogs}
              exercises={exercises}
              t={t}
            />
          ) : (
            <SocialMode t={t} onHighFive={handleHighFive} />
          )}

        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} t={t} />

        {/* Badge Popup Overlay */}
        {showBadgePopup && (
          <BadgePopup onClose={() => setShowBadgePopup(false)} t={t} />
        )}

        {/* Exercise Modal */}
        <ExerciseModal 
          isOpen={isExerciseModalOpen} 
          onClose={() => setExerciseModalOpen(false)} 
          onComplete={handleConfirmLog}
          exercise={currentExercise}
          t={t}
          lang={lang}
        />

        {/* VAS Modal (Pain Log) */}
        <VASModal 
            isOpen={showVASModal}
            onSubmit={handleVASSubmit}
            t={t}
        />
        
        {/* Gemini Powered AI Coach */}
        <AICoach 
            t={t} 
            lang={lang}
            exercises={exercises}
            onOpenExercise={handleOpenLog}
            externalTrigger={aiCoachTrigger} 
            onClearTrigger={() => setAiCoachTrigger(null)} 
        />
        
        {/* About App Modal */}
        {showAboutModal && (
            <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 w-full rounded-3xl p-6 shadow-2xl text-center relative animate-slide-up transition-colors duration-300">
                    <button 
                        onClick={() => setShowAboutModal(false)}
                        className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-sm border border-blue-100 dark:border-blue-800">
                        <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t.aboutTitle}</h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t.developedBy}</p>
                            <p className="text-base font-bold text-blue-700 dark:text-blue-400 font-sans mb-3">Mahmoud Behairy</p>
                            
                            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                                <a 
                                    href="https://www.facebook.com/Mahmoud.W.Behairy" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </a>
                                <a 
                                    href="https://www.instagram.com/mahmoud.w.behairy/?hl=en" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-pink-100 dark:bg-pink-900/40 rounded-full text-pink-600 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                                </a>
                                <a 
                                    href="https://api.whatsapp.com/send?phone=201118242954&text=" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </a>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t.supervisor}</p>
                            <p className="text-base font-bold text-gray-800 dark:text-gray-200 font-sans">Dr. Shimaa Mohamed</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 font-sans">
                            {t.faculty}
                        </p>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}