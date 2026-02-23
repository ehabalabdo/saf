import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ───────────────────────────── types ───────────────────────────── */
interface Feature {
  icon: string;
  title: string;
  titleEn: string;
  desc: string;
  color: string;
  details: string[];
}

interface FeatureCategory {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  gradient: string;
  features: Feature[];
}

/* ───────────────────────── counter hook ─────────────────────────── */
const useCountUp = (end: number, duration = 2000, start = 0) => {
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(start + (end - start) * ease));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { value, ref };
};

/* ────────────────────────── data ────────────────────────────────── */
const featureCategories: FeatureCategory[] = [
  {
    id: 'clinic',
    label: 'إدارة العيادة',
    labelEn: 'Clinic Management',
    icon: 'fa-hospital',
    gradient: 'from-cyan-500 to-blue-600',
    features: [
      {
        icon: 'fa-hospital-user',
        title: 'إدارة العيادات المتعددة',
        titleEn: 'Multi-Clinic Management',
        desc: 'إدارة عدة عيادات وأقسام من لوحة تحكم واحدة.',
        color: 'cyan',
        details: [
          'إنشاء عيادات وأقسام غير محدودة داخل المركز الطبي',
          'تعيين أطباء وكوادر لكل عيادة بصلاحيات منفصلة',
          'لوحة تحكم مركزية لمتابعة أداء جميع العيادات',
          'تقارير مقارنة بين العيادات والفروع',
          'إعدادات مستقلة لكل عيادة (مواعيد، خدمات، أسعار)',
        ],
      },
      {
        icon: 'fa-user-nurse',
        title: 'نظام الاستقبال الذكي',
        titleEn: 'Smart Reception',
        desc: 'تسجيل وإدارة المرضى بكفاءة عالية.',
        color: 'cyan',
        details: [
          'تسجيل دخول المريض بنقرة واحدة مع التعرف التلقائي',
          'إدارة قائمة الانتظار وترتيب الأولويات',
          'تحويل المريض للعيادة أو الطبيب المطلوب فوراً',
          'عرض حالة المريض الحالية (منتظر، عند الطبيب، مكتمل)',
          'إشعارات فورية للطبيب عند وصول مريض جديد',
          'بحث سريع عن المريض بالاسم أو رقم الهاتف أو الرقم الوطني',
        ],
      },
      {
        icon: 'fa-calendar-check',
        title: 'نظام المواعيد المتقدم',
        titleEn: 'Advanced Appointments',
        desc: 'حجز وإدارة المواعيد مع تأكيد وتذكير.',
        color: 'cyan',
        details: [
          'حجز مواعيد بتحديد الطبيب، العيادة، والوقت',
          'عرض جدولي (يومي / أسبوعي / شهري) للمواعيد',
          'حالات متعددة: مؤكد، معلق، ملغي، مكتمل',
          'ملاحظات على كل موعد مع سبب الزيارة',
          'ربط مع شاشة الانتظار لعرض المواعيد القادمة',
          'منع التضارب التلقائي بين المواعيد',
        ],
      },
      {
        icon: 'fa-tv',
        title: 'شاشة الانتظار الذكية',
        titleEn: 'Smart Queue Display',
        desc: 'عرض حي للمرضى المنتظرين مع نداء صوتي.',
        color: 'cyan',
        details: [
          'شاشة عرض بتصميم احترافي للمرضى المنتظرين',
          'نداء صوتي تلقائي باسم المريض عند حلول دوره',
          'عرض رقم الدور واسم الطبيب والعيادة',
          'تحديث مباشر بدون تحديث الصفحة (Real-time)',
          'إمكانية عرضها على شاشة TV في قاعة الانتظار',
          'دعم العربية والإنجليزية في العرض',
        ],
      },
    ],
  },
  {
    id: 'medical',
    label: 'الملف الطبي',
    labelEn: 'Medical Records',
    icon: 'fa-stethoscope',
    gradient: 'from-emerald-500 to-teal-600',
    features: [
      {
        icon: 'fa-user-doctor',
        title: 'لوحة الطبيب الشاملة',
        titleEn: 'Doctor Dashboard',
        desc: 'أدوات متكاملة للتشخيص والمتابعة.',
        color: 'emerald',
        details: [
          'ملف طبي شامل لكل مريض يحتوي على كامل تاريخه',
          'كتابة التشخيصات والملاحظات الطبية التفصيلية',
          'إنشاء وصفات طبية قابلة للطباعة',
          'رفع صور وملفات (أشعة، تحاليل، صور سريرية)',
          'خطط علاجية متعددة الجلسات مع متابعة التقدم',
          'عرض تاريخ الزيارات والعلاجات السابقة',
          'قوالب جاهزة للتشخيصات الشائعة لتسريع العمل',
        ],
      },
      {
        icon: 'fa-clipboard-list',
        title: 'السجل الطبي والتاريخ السريري',
        titleEn: 'Clinical History',
        desc: 'تتبع كامل لتاريخ المريض الطبي.',
        color: 'emerald',
        details: [
          'عرض زمني لجميع الزيارات والعلاجات',
          'تصفية السجلات حسب التاريخ أو نوع العلاج',
          'ملاحظات الطبيب على كل زيارة',
          'ملفات ومرفقات مرتبطة بكل زيارة',
          'طباعة ملخص السجل الطبي الكامل',
          'مشاركة السجل مع طبيب آخر داخل النظام',
        ],
      },
      {
        icon: 'fa-address-book',
        title: 'سجل المرضى المتقدم',
        titleEn: 'Patient Registry',
        desc: 'قاعدة بيانات شاملة لجميع المرضى.',
        color: 'emerald',
        details: [
          'بيانات ديموغرافية كاملة (اسم، عمر، جنس، عنوان)',
          'أرقام التواصل والرقم الوطني',
          'تاريخ أول زيارة وآخر زيارة',
          'بحث متقدم وفلترة حسب معايير متعددة',
          'تصدير بيانات المرضى إلى Excel',
          'إحصائيات عن عدد المرضى الجدد والعائدين',
        ],
      },
      {
        icon: 'fa-mobile-screen',
        title: 'بوابة المريض الإلكترونية',
        titleEn: 'Patient Portal',
        desc: 'دخول المريض لحسابه ومتابعة ملفه.',
        color: 'emerald',
        details: [
          'تسجيل دخول المريض بالجوال أو الرقم الوطني',
          'عرض السجل الطبي الكامل والزيارات السابقة',
          'حجز وإلغاء المواعيد بسهولة',
          'عرض الوصفات الطبية وتعليمات الطبيب',
          'متابعة حالة الطلبات والحجوزات',
          'واجهة بسيطة مصممة للمريض غير التقني',
        ],
      },
    ],
  },
  {
    id: 'financial',
    label: 'المالية والمحاسبة',
    labelEn: 'Finance & Billing',
    icon: 'fa-coins',
    gradient: 'from-amber-500 to-orange-600',
    features: [
      {
        icon: 'fa-file-invoice-dollar',
        title: 'الفواتير والمحاسبة',
        titleEn: 'Billing & Invoicing',
        desc: 'إنشاء فواتير وتتبع المدفوعات.',
        color: 'amber',
        details: [
          'إنشاء فواتير تفصيلية مع بنود الخدمات والأسعار',
          'دعم الدفعات الجزئية ومتابعة المتبقي',
          'تقارير مالية يومية وشهرية وسنوية',
          'طباعة الفاتورة بتصميم احترافي',
          'ربط الفاتورة مع ملف المريض والزيارة',
          'خصومات مرنة (نسبة أو مبلغ ثابت)',
        ],
      },
      {
        icon: 'fa-tags',
        title: 'كتالوج الخدمات والأسعار',
        titleEn: 'Service Catalog',
        desc: 'إدارة الخدمات والأسعار بمرونة.',
        color: 'amber',
        details: [
          'إنشاء قائمة خدمات شاملة مع الأسعار',
          'تصنيف الخدمات حسب القسم أو التخصص',
          'تعديل الأسعار بسهولة مع حفظ التاريخ',
          'ربط الخدمات مع الفواتير لإنشاء فاتورة سريعة',
          'تصدير قائمة الأسعار إلى Excel',
          'دعم العملات المختلفة',
        ],
      },
      {
        icon: 'fa-chart-pie',
        title: 'التقارير والإحصائيات',
        titleEn: 'Reports & Analytics',
        desc: 'تقارير مفصلة وإحصائيات شاملة.',
        color: 'amber',
        details: [
          'تقارير الإيرادات والمصروفات',
          'إحصائيات المرضى (جدد، عائدين، حسب العيادة)',
          'تقارير أداء الأطباء وعدد الحالات',
          'رسوم بيانية تفاعلية وقابلة للتصدير',
          'تقارير مقارنة بين الفترات الزمنية',
          'لوحة مؤشرات أداء (KPI) للإدارة',
        ],
      },
    ],
  },
  {
    id: 'hr',
    label: 'الموارد البشرية',
    labelEn: 'Human Resources',
    icon: 'fa-people-group',
    gradient: 'from-violet-500 to-purple-600',
    features: [
      {
        icon: 'fa-id-card',
        title: 'إدارة الموظفين',
        titleEn: 'Employee Management',
        desc: 'ملفات كاملة للموظفين والكوادر.',
        color: 'violet',
        details: [
          'ملف شامل لكل موظف (بيانات شخصية، وظيفية، مالية)',
          'تحديد القسم والدور الوظيفي والراتب الأساسي',
          'إدارة البدلات والخصومات لكل موظف',
          'عرض شجري للهيكل التنظيمي',
          'تتبع تاريخ التوظيف والترقيات',
          'تعيين صلاحيات النظام حسب الدور',
        ],
      },
      {
        icon: 'fa-fingerprint',
        title: 'الحضور والبصمة',
        titleEn: 'Attendance & Biometric',
        desc: 'تسجيل الحضور بالبصمة أو يدوياً.',
        color: 'violet',
        details: [
          'ربط مع أجهزة البصمة لتسجيل الحضور والانصراف تلقائياً',
          'تسجيل يدوي في حال عدم توفر جهاز بصمة',
          'حساب ساعات العمل الفعلية والتأخير والإضافي',
          'تقارير حضور يومية وشهرية مفصلة',
          'إشعارات للتأخير والغياب',
          'دعم الورديات المختلفة والدوامات المرنة',
        ],
      },
      {
        icon: 'fa-money-check-dollar',
        title: 'الرواتب وكشف الراتب',
        titleEn: 'Payroll & Payslips',
        desc: 'معالجة الرواتب وإصدار كشوف.',
        color: 'violet',
        details: [
          'حساب الراتب الشهري آلياً بناءً على الحضور',
          'إضافة بدلات (مواصلات، سكن، إضافي) وخصومات',
          'إنشاء كشف راتب PDF احترافي لكل موظف',
          'الموظف يمكنه تحميل كشف راتبه من حسابه',
          'تقارير إجمالي الرواتب الشهرية للإدارة',
          'دعم العملات المحلية وضريبة الدخل',
        ],
      },
      {
        icon: 'fa-chart-bar',
        title: 'تقارير الموارد البشرية',
        titleEn: 'HR Reports',
        desc: 'تقارير وإحصائيات شاملة للموارد البشرية.',
        color: 'violet',
        details: [
          'تقارير الحضور والغياب لكل موظف أو قسم',
          'تقارير التكلفة الشهرية للرواتب والبدلات',
          'إحصائيات الأداء والإنتاجية',
          'تقارير الإجازات والرصيد المتبقي',
          'تصدير جميع التقارير إلى Excel أو PDF',
          'مقارنة الأداء بين الأقسام والفترات',
        ],
      },
    ],
  },
  {
    id: 'specialty',
    label: 'وحدات متخصصة',
    labelEn: 'Specialty Modules',
    icon: 'fa-puzzle-piece',
    gradient: 'from-rose-500 to-pink-600',
    features: [
      {
        icon: 'fa-tooth',
        title: 'مختبر الأسنان',
        titleEn: 'Dental Lab',
        desc: 'إدارة حالات وطلبات مختبر الأسنان.',
        color: 'rose',
        details: [
          'إرسال حالة من الطبيب لفني المختبر مباشرة',
          'تتبع حالة العمل (جديد، قيد التنفيذ، جاهز، مسلّم)',
          'ملاحظات ومواصفات تفصيلية لكل حالة',
          'ربط الحالة مع ملف المريض والطبيب المعالج',
          'تقارير إنتاجية المختبر وعدد الحالات',
          'إشعارات فورية عند تغيير حالة العمل',
        ],
      },
      {
        icon: 'fa-screwdriver-wrench',
        title: 'شركة الزراعات',
        titleEn: 'Implant Company',
        desc: 'إدارة مخزون الزراعات والطلبات.',
        color: 'rose',
        details: [
          'إدارة كتالوج منتجات الزراعة بالتفصيل',
          'تتبع المخزون والكميات المتوفرة',
          'طلبات الأطباء وتوصيل الزراعات',
          'ربط مع بيانات المريض والطبيب',
          'تقارير المبيعات والمخزون',
          'إشعارات عند انخفاض المخزون',
        ],
      },
      {
        icon: 'fa-graduation-cap',
        title: 'الأكاديمية والدورات',
        titleEn: 'Academy & Courses',
        desc: 'إنشاء دورات تدريبية وإدارة الطلاب.',
        color: 'rose',
        details: [
          'إنشاء دورات تدريبية مع تفاصيل كاملة',
          'تسجيل الطلاب وإدارة المجموعات',
          'جدولة الجلسات والمحاضرات',
          'متابعة الحضور لكل جلسة',
          'إصدار شهادات إتمام للمتدربين',
          'تقارير عن معدل الحضور وتقييم المدربين',
        ],
      },
      {
        icon: 'fa-microchip',
        title: 'ربط الأجهزة الطبية',
        titleEn: 'Device Integration',
        desc: 'استقبال نتائج الأجهزة الطبية تلقائياً.',
        color: 'rose',
        details: [
          'ربط أجهزة الفحص (مختبر، أشعة) عبر بروتوكول HL7',
          'استقبال النتائج مباشرة في ملف المريض',
          'دعم أجهزة Serial Port و MLLP',
          'عرض النتائج بشكل مرئي مع تنبيهات القيم غير الطبيعية',
          'أرشفة النتائج وربطها مع الزيارة',
          'Bridge Agent للربط بين الجهاز والنظام السحابي',
        ],
      },
    ],
  },
  {
    id: 'platform',
    label: 'المنصة والأمان',
    labelEn: 'Platform & Security',
    icon: 'fa-shield-halved',
    gradient: 'from-sky-500 to-indigo-600',
    features: [
      {
        icon: 'fa-shield-halved',
        title: 'أمان وخصوصية متقدمة',
        titleEn: 'Security & Privacy',
        desc: 'حماية كاملة للبيانات الطبية.',
        color: 'sky',
        details: [
          'تشفير البيانات أثناء النقل والتخزين (SSL/TLS)',
          'صلاحيات متعددة المستويات (مدير، طبيب، سكرتيرة، مريض)',
          'حماية ضد الهجمات (Rate Limiting, Helmet, CORS)',
          'JWT Token للمصادقة مع انتهاء صلاحية تلقائي',
          'تسجيل الأنشطة المهمة للمراجعة',
          'فصل بيانات كل عميل بشكل كامل (Multi-Tenant)',
        ],
      },
      {
        icon: 'fa-language',
        title: 'دعم اللغات',
        titleEn: 'Multi-Language',
        desc: 'عربي وإنجليزي مع تبديل فوري.',
        color: 'sky',
        details: [
          'واجهة كاملة باللغة العربية مع دعم RTL',
          'تبديل فوري إلى الإنجليزية بنقرة واحدة',
          'جميع التقارير والفواتير بكلتا اللغتين',
          'أسماء الخدمات والتشخيصات بكلتا اللغتين',
          'تذكر اللغة المفضلة للمستخدم',
          'إمكانية إضافة لغات جديدة مستقبلاً',
        ],
      },
      {
        icon: 'fa-moon',
        title: 'الوضع الليلي والمظهر',
        titleEn: 'Dark Mode & Theming',
        desc: 'وضع ليلي ونهاري مع ألوان قابلة للتخصيص.',
        color: 'sky',
        details: [
          'وضع ليلي مريح للعين أثناء العمل لساعات طويلة',
          'وضع نهاري كلاسيكي واضح',
          'تبديل فوري بين الوضعين',
          'حفظ تفضيل المستخدم تلقائياً',
          'ألوان متناسقة ومصممة باحتراف لكلا الوضعين',
          'تصميم متجاوب يعمل على جميع أحجام الشاشات',
        ],
      },
      {
        icon: 'fa-building',
        title: 'منصة SaaS متعددة العملاء',
        titleEn: 'Multi-Tenant SaaS',
        desc: 'كل مركز طبي بنسخته ورابطه الخاص.',
        color: 'sky',
        details: [
          'كل عميل له رابط مخصص (subdomain) خاص به',
          'بيانات منفصلة تماماً بين العملاء',
          'لوحة Super Admin لإدارة جميع العملاء',
          'إنشاء عميل جديد بدقائق مع إعداد كامل',
          'خطط اشتراك مرنة حسب الاحتياج',
          'نسخ احتياطي تلقائي لبيانات كل عميل',
        ],
      },
      {
        icon: 'fa-brands fa-whatsapp',
        title: 'تكامل واتساب',
        titleEn: 'WhatsApp Integration',
        desc: 'تواصل مباشر مع المرضى عبر واتساب.',
        color: 'green',
        details: [
          'إرسال تأكيد الموعد عبر واتساب',
          'تذكير المريض قبل الموعد',
          'إرسال رابط حجز الموعد للمريض',
          'الرد السريع على استفسارات المرضى',
          'زر واتساب مباشر داخل ملف المريض',
          'إشعارات مخصصة حسب نوع الحدث',
        ],
      },
    ],
  },
];

const allFeatures = featureCategories.flatMap((c) => c.features);

/* ────────────────────────── component ──────────────────────────── */
const LandingView: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState('clinic');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  /* scroll → navbar shadow */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* intersection observer for reveal animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('revealed');
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory]);

  const closeModal = useCallback(() => setSelectedFeature(null), []);

  /* animated counters */
  const featuresCount = useCountUp(allFeatures.length, 1800);
  const modulesCount = useCountUp(featureCategories.length, 1800);

  const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20',    glow: 'shadow-cyan-500/20'    },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   glow: 'shadow-amber-500/20'   },
    violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20',  glow: 'shadow-violet-500/20'  },
    rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20',    glow: 'shadow-rose-500/20'    },
    sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20',     glow: 'shadow-sky-500/20'     },
    green:   { bg: 'bg-green-500/10',   text: 'text-green-400',   border: 'border-green-500/20',   glow: 'shadow-green-500/20'   },
  };

  const currentCategory = featureCategories.find((c) => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: "'Cairo', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-primary/5 border-b border-primary/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MED LOOP" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MED LOOP</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-primary transition-colors text-sm font-medium">المميزات</a>
            <a href="#why" className="text-slate-400 hover:text-primary transition-colors text-sm font-medium">لماذا MED LOOP</a>
            <a href="#contact" className="text-slate-400 hover:text-primary transition-colors text-sm font-medium">تواصل معنا</a>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-slate-400 hover:text-white text-xl">
            <i className={`fa-solid ${mobileMenu ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-slate-300 hover:text-primary py-2">المميزات</a>
            <a href="#why" onClick={() => setMobileMenu(false)} className="block text-slate-300 hover:text-primary py-2">لماذا MED LOOP</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-slate-300 hover:text-primary py-2">تواصل معنا</a>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-30">
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950 z-[1]" />
        {/* decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[120px] animate-pulse z-0" />
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-[140px] animate-pulse z-0" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="logo-float mb-8">
            <img src="/logo.png" alt="MED LOOP" className="w-24 h-24 mx-auto object-contain drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-300 to-secondary">MED LOOP</span>
            <br />
            <span className="text-white text-2xl md:text-4xl mt-2 block">نظام إدارة العيادات والمراكز الطبية المتكامل</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            حل سحابي شامل يجمع الاستقبال، الملف الطبي، المواعيد، الفواتير، الموارد البشرية، مختبر الأسنان، ربط الأجهزة، وأكثر — كل شيء في منصة واحدة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-lg group">
              <i className="fa-solid fa-rocket ml-2 group-hover:animate-bounce"></i>
              ابدأ الآن
            </a>
            <a href="#features" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-lg">
              <i className="fa-solid fa-eye ml-2"></i>
              اكتشف المميزات
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div ref={featuresCount.ref} className="text-2xl md:text-3xl font-bold text-primary">{featuresCount.value}+</div>
              <div className="text-xs text-slate-500 mt-1">ميزة</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div ref={modulesCount.ref} className="text-2xl md:text-3xl font-bold text-primary">{modulesCount.value}</div>
              <div className="text-xs text-slate-500 mt-1">وحدة</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
              <div className="text-xs text-slate-500 mt-1">متاح دائماً</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-primary">100%</div>
              <div className="text-xs text-slate-500 mt-1">سحابي</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <i className="fa-solid fa-chevron-down text-primary/50 text-2xl"></i>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 px-6 relative">
        {/* decorative bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold mb-4">
              <i className="fa-solid fa-sparkles ml-1"></i> كل المميزات
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              كل ما تحتاجه في <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">نظام واحد</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">اضغط على أي ميزة لاكتشاف تفاصيلها الكاملة</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 reveal-on-scroll">
            {featureCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2
                  ${activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
              >
                <i className={`fa-solid ${cat.icon} text-xs`}></i>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Category Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">{currentCategory.labelEn}</span>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            {currentCategory.features.map((f, idx) => {
              const c = colorMap[f.color] || colorMap.cyan;
              return (
                <button
                  key={`${activeCategory}-${idx}`}
                  onClick={() => setSelectedFeature(f)}
                  className={`reveal-on-scroll group relative text-right bg-slate-900/60 border border-slate-800 rounded-2xl p-6 
                    hover:${c.border} hover:shadow-xl hover:${c.glow} transition-all duration-500 
                    hover:-translate-y-2 hover:bg-slate-900/90 cursor-pointer`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* glow effect */}
                  <div className={`absolute inset-0 rounded-2xl ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center ${c.text} text-2xl mb-4 
                      group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${f.icon.startsWith('fa-brands') ? f.icon : `fa-solid ${f.icon}`}`}></i>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white/95">{f.title}</h3>
                    <p className={`text-xs ${c.text} opacity-60 font-medium mb-3`}>{f.titleEn}</p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{f.desc}</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${c.text} opacity-70 group-hover:opacity-100 transition-opacity`}>
                      <span>اكتشف المزيد</span>
                      <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Total feature count */}
          <div className="text-center mt-12 reveal-on-scroll">
            <p className="text-slate-600 text-sm">
              <span className="text-primary font-bold">{allFeatures.length}</span> ميزة عبر{' '}
              <span className="text-primary font-bold">{featureCategories.length}</span> وحدات
            </p>
          </div>
        </div>
      </section>

      {/* ─── Feature Detail Modal ─── */}
      {selectedFeature && (() => {
        const f = selectedFeature;
        const c = colorMap[f.color] || colorMap.cyan;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeModal}>
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm modal-backdrop-enter" />

            {/* modal card */}
            <div
              className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-0 overflow-hidden shadow-2xl modal-card-enter"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header gradient bar */}
              <div className={`h-1.5 bg-gradient-to-r ${featureCategories.find(cat => cat.features.includes(f))?.gradient || 'from-primary to-secondary'}`} />

              <div className="p-8">
                {/* close */}
                <button onClick={closeModal} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>

                {/* icon & titles */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center ${c.text} text-3xl shrink-0`}>
                    <i className={`${f.icon.startsWith('fa-brands') ? f.icon : `fa-solid ${f.icon}`}`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{f.title}</h3>
                    <p className={`text-sm ${c.text} opacity-70 font-medium`}>{f.titleEn}</p>
                  </div>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">{f.desc}</p>

                {/* detail list */}
                <div className="space-y-3">
                  {f.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-3 detail-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className={`w-6 h-6 rounded-lg ${c.bg} flex items-center justify-center ${c.text} shrink-0 mt-0.5`}>
                        <i className="fa-solid fa-check text-[10px]"></i>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 flex gap-3">
                  <a href="#contact" onClick={closeModal}
                     className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all text-sm">
                    <i className="fa-solid fa-phone ml-1"></i>
                    اطلب عرض توضيحي
                  </a>
                  <button onClick={closeModal}
                    className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all text-sm">
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Why MED LOOP ─── */}
      <section id="why" className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold mb-4">
              لماذا نحن
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" dir="rtl">لماذا <span className="text-primary">MED LOOP</span>&rlm;؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'fa-cloud', title: 'سحابي بالكامل', desc: 'لا حاجة لتثبيت أي برنامج. افتح المتصفح وابدأ العمل من أي مكان وأي جهاز.', color: 'from-cyan-500 to-blue-500' },
              { icon: 'fa-bolt', title: 'سريع وسهل الاستخدام', desc: 'واجهة بسيطة وسلسة مصممة للاستخدام اليومي في بيئة العيادة.', color: 'from-amber-500 to-orange-500' },
              { icon: 'fa-language', title: 'عربي وإنجليزي', desc: 'دعم كامل للغة العربية والإنجليزية مع إمكانية التبديل الفوري.', color: 'from-emerald-500 to-teal-500' },
              { icon: 'fa-people-group', title: 'متعدد المستخدمين', desc: 'صلاحيات مختلفة للمدير، السكرتيرة، الطبيب، فني المختبر، والمريض.', color: 'from-violet-500 to-purple-500' },
              { icon: 'fa-building', title: 'SaaS - كل عميل مستقل', desc: 'كل مركز طبي له بياناته المنفصلة تماماً مع رابط خاص به.', color: 'from-rose-500 to-pink-500' },
              { icon: 'fa-headset', title: 'دعم فني مستمر', desc: 'فريق دعم جاهز لمساعدتك في أي وقت وتخصيص النظام حسب احتياجاتك.', color: 'from-sky-500 to-indigo-500' },
            ].map((item, idx) => (
              <div key={idx} className="reveal-on-scroll group bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300"
                   style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg mb-4 
                  group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-primary/20 rounded-3xl p-12 relative overflow-hidden reveal-on-scroll">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6 shadow-lg shadow-primary/25">
              <i className="fa-solid fa-stethoscope"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">جاهز لتطوير عيادتك؟</h2>
            <p className="text-slate-400 mb-8 text-lg">ابدأ تجربتك المجانية الآن واكتشف كيف يمكن لـ MED LOOP تحسين إدارة عيادتك</p>
            <a href="#contact" className="inline-block px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-lg hover:scale-105">
              <i className="fa-solid fa-phone ml-2"></i>
              تواصل معنا
            </a>
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold mb-4">
              تواصل معنا
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">نحن هنا <span className="text-primary">لمساعدتك</span></h2>
            <p className="text-slate-500">تواصل معنا للاستفسار أو لبدء تجربتك المجانية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="tel:0792020388" className="reveal-on-scroll bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-primary/30 transition-all group hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <i className="fa-solid fa-phone"></i>
              </div>
              <h3 className="font-bold text-white mb-2">الهاتف</h3>
              <p className="text-primary font-mono text-lg" dir="ltr">079 202 0388</p>
            </a>

            <a href="mailto:info@loopjo.com" className="reveal-on-scroll bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-primary/30 transition-all group hover:-translate-y-1 duration-300" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <h3 className="font-bold text-white mb-2">البريد الإلكتروني</h3>
              <p className="text-primary text-lg">info@loopjo.com</p>
            </a>

            <a href="https://wa.me/962792020388" target="_blank" rel="noopener noreferrer" className="reveal-on-scroll bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-green-500/30 transition-all group hover:-translate-y-1 duration-300" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 text-2xl mx-auto mb-4 group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <h3 className="font-bold text-white mb-2">واتساب</h3>
              <p className="text-green-400 text-lg">راسلنا مباشرة</p>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MED LOOP" className="w-8 h-8 object-contain" />
            <span className="text-slate-500 text-sm">© 2025 MED LOOP. جميع الحقوق محفوظة.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600 text-sm">
            <span>من تطوير <a href="https://loopjo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Loop</a></span>
          </div>
        </div>
      </footer>

      {/* ─── Floating WhatsApp ─── */}
      <a href="https://wa.me/962792020388" target="_blank" rel="noopener noreferrer"
         className="fixed bottom-6 left-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-green-500/30 hover:scale-110 transition-transform z-40 whatsapp-pulse">
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </div>
  );
};

export default LandingView;
