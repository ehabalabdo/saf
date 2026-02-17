
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ClinicService, PatientService } from '../services/services';
import { Patient, Clinic, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

/**
 * QueueDisplayView
 * Designed for TV screens / External Monitors
 * Minimal UI, High Contrast, Auto-Updating
 */
const QueueDisplayView: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth(); // We need auth to access the DB service
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentCalling, setCurrentCalling] = useState<{name: string, clinic: string, patientId?: string} | null>(null);
  
  // Track previous patients to detect changes for TTS
  const prevPatientsRef = useRef<Patient[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio & TTS Logic
  const speak = (text: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    
    // Play chime (simple oscillator)
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // Speak after chime
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }, 600);
  };

  // Fetch Logic
  useEffect(() => {
    if (!user) return;

    // 1. Get Clinic Names
    ClinicService.getActive().then(all => {
      const map: Record<string, string> = {};
      all.forEach(c => map[c.id] = c.name);
      setClinics(map);
    });

    // 2. Subscribe to Patients (PatientService already filters by visitId)
    const dummyUser = { ...user, role: UserRole.SECRETARY }; 
    const subscription = PatientService.subscribe(dummyUser, (data) => {
       console.log('[QueueDisplayView] Received patients from subscription:', {
         count: data.length,
         patients: data.map(p => ({ id: p.id, name: p.name, status: p.currentVisit.status }))
       });
       
       // PatientService.subscribe already filters out patients with empty visitId
       // So we only need to filter by status here
       const active = data.filter(p => p.currentVisit.status !== 'completed');
       
       console.log('[QueueDisplayView] Active patients after filter:', active.length);
       
       // Check for new "in-progress" status (patient called by doctor)
       active.forEach(p => {
           const prev = prevPatientsRef.current.find(old => old.id === p.id);
           if (p.currentVisit.status === 'in-progress' && prev?.currentVisit.status !== 'in-progress') {
               const clinicName = clinics[p.currentVisit.clinicId] || 'Clinic';
               
               // Show popup notification
               setCurrentCalling({ name: p.name, clinic: clinicName, patientId: p.id });
               
               // Clear any existing timeout
               if (callingTimeoutRef.current) clearTimeout(callingTimeoutRef.current);
               // Auto-hide after 5 seconds
               callingTimeoutRef.current = setTimeout(() => setCurrentCalling(null), 5000);
               
               // Announce patient name
               const text = language === 'ar' 
                 ? `المريض ${p.name}, يرجى التوجه إلى ${clinicName}`
                 : `Patient ${p.name}, please proceed to ${clinicName}`;
               speak(text);
           }
       });

       prevPatientsRef.current = active;
       setPatients(active);
    });
    
    unsubscribeRef.current = subscription;

    return () => {
        if(unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [user, clinics, soundEnabled, language]); // Added all dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md px-8 py-5 flex justify-between items-center border-b border-primary/20 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-4">
           <img src="/logo.png" alt="MED LOOP" className="w-14 h-14 object-contain" />
           <div>
             <h1 className="text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{t('system_name')}</h1>
             <p className="text-primary/70 text-sm font-medium">{t('queue_display_title')}</p>
           </div>
        </div>
        
        <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${soundEnabled ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-white'}`}
        >
            <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'} mr-2`}></i>
            {soundEnabled ? 'Audio ON' : 'Audio OFF'}
        </button>

        <div className="text-right">
           <div className="text-3xl font-mono font-bold text-primary">
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-slate-500 text-xs uppercase tracking-widest mt-1">
             {currentTime.toLocaleDateString()}
           </div>
        </div>
      </header>

      {/* Calling Popup */}
      {currentCalling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 shadow-2xl border-2 border-primary/40 max-w-3xl w-full mx-8 animate-bounce-subtle">
            <div className="text-center space-y-6">
              <div className="text-8xl mb-4">
                <i className="fa-solid fa-bell animate-ring text-white"></i>
              </div>
              <h2 className="text-5xl font-bold text-white">
                {language === 'ar' ? 'حان دورك!' : 'Your Turn!'}
              </h2>
              <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-3xl font-semibold text-white mb-2">
                  {language === 'ar' ? 'المريض:' : 'Patient:'} <span className="font-bold">{currentCalling.name}</span>
                </p>
                <p className="text-2xl text-white/80">
                  {language === 'ar' ? 'يرجى التوجه إلى:' : 'Please proceed to:'}
                </p>
                <p className="text-4xl font-bold text-white mt-2">
                  <i className="fa-solid fa-hospital mr-3"></i>
                  {currentCalling.clinic}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 text-white/70 text-xl">
                <i className="fa-solid fa-arrow-right animate-pulse"></i>
                <span>{language === 'ar' ? 'توجه الآن للعيادة' : 'Proceed to the clinic now'}</span>
                <i className="fa-solid fa-arrow-left animate-pulse"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex-1 bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl backdrop-blur-sm">
           
           {/* Table Header */}
           <div className="grid grid-cols-4 bg-gradient-to-r from-primary/20 to-secondary/10 text-primary p-5 text-lg font-bold uppercase tracking-wider border-b border-primary/10">
              <div>{t('patient_col')}</div>
              <div>{t('clinic_col')}</div>
              <div className="text-center">{t('status_col')}</div>
              <div className="text-end">{t('time_col')}</div>
           </div>

           {/* Table Body */}
           <div className="divide-y divide-slate-700/30 overflow-y-auto h-full">
              {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
                    <i className="fa-regular fa-clock text-6xl opacity-40"></i>
                    <p className="text-2xl">{t('no_active_patients')}</p>
                </div>
              ) : patients.map((p, idx) => (
                <div key={p.id} className={`grid grid-cols-4 p-6 items-center text-xl transition-all animate-fade-in ${idx % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent'} hover:bg-primary/5`}>
                   
                   <div className="font-bold text-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-mono text-primary">
                        {idx + 1}
                      </div>
                      {p.name}
                   </div>

                   <div className="text-slate-300">
                      <i className="fa-solid fa-hospital-user mr-2 text-primary/50"></i>
                      {clinics[p.currentVisit.clinicId] || '...'}
                   </div>

                   <div className="text-center">
                      <span className={`inline-block px-6 py-2 rounded-full font-bold shadow-lg ${
                         p.currentVisit.status === 'in-progress' 
                         ? 'bg-primary text-white animate-pulse shadow-primary/30' 
                         : 'bg-amber-500/90 text-white shadow-amber-500/20'
                      }`}>
                         {p.currentVisit.status === 'in-progress' ? t('queue_status_in') : t('queue_status_wait')}
                      </span>
                   </div>

                   <div className="text-end font-mono text-slate-400">
                      {new Date(p.currentVisit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
              ))}
           </div>

        </div>
      </main>

      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-subtle {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes ring {
            0%, 100% { transform: rotate(-15deg); }
            25% { transform: rotate(15deg); }
            50% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
        }
        .animate-ring {
            animation: ring 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QueueDisplayView;
