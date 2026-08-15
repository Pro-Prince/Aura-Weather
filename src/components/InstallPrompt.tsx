import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTapScale } from '../utils/motion';
import { X } from 'lucide-react';

export function InstallPrompt() {
  const tapScale = useTapScale();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt only if they haven't dismissed it recently
      if (localStorage.getItem('aura-install-dismissed') !== 'true') {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('aura-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0 shadow-md">
              <img src="/weather_logo.png" alt="Aura Weather" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-100 type-body-medium">Install Aura Weather</h3>
              <p className="text-slate-400 type-caption text-sm">Add to home screen</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileTap={{ scale: tapScale }}
                onClick={handleInstall}
                className="bg-white/10 hover:bg-white/20 text-slate-100 px-3 py-1.5 rounded-lg type-body-medium text-sm transition-colors"
              >
                Install
              </motion.button>
              <motion.button whileTap={{ scale: tapScale }}
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
