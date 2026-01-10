import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Calendar, Users, Euro, BarChart3, ChevronLeft } from 'lucide-react';

const tutorialSteps = [
  {
    id: 1,
    icon: Calendar,
    title: 'Verwalten Sie Ihren Kalender',
    description: 'Legen Sie Ihre Verfügbarkeit fest, akzeptieren Sie Buchungen und blockieren Sie Zeiten für Pausen oder persönliche Termine.',
    image: '📅',
    color: '#8B4513'
  },
  {
    id: 2,
    icon: Users,
    title: 'Verbinden Sie sich mit Kunden',
    description: 'Chatten Sie direkt mit Ihren Kunden, bestätigen Sie Termine und bauen Sie langfristige Beziehungen auf.',
    image: '👥',
    color: '#FF6B6B'
  },
  {
    id: 3,
    icon: Euro,
    title: 'Verfolgen Sie Ihre Einnahmen',
    description: 'Sehen Sie Ihre täglichen, wöchentlichen und monatlichen Einnahmen. Fordern Sie Auszahlungen direkt in der App an.',
    image: '💰',
    color: '#8B4513'
  },
  {
    id: 4,
    icon: BarChart3,
    title: 'Wachsen Sie Ihr Geschäft',
    description: 'Nutzen Sie detaillierte Analysen, um Ihr Geschäft zu verstehen und neue Kunden zu gewinnen.',
    image: '📊',
    color: '#FF6B6B'
  }
];

export function ProviderOnboardingTutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete provider tutorial
      localStorage.setItem('hasCompletedProviderTutorial', 'true');
      navigate('/provider/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasCompletedProviderTutorial', 'true');
    navigate('/provider/dashboard');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = tutorialSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Skip */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleBack}
          className="p-2 -ml-2"
          style={{ opacity: currentStep === 0 ? 0 : 1 }}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <button
          onClick={handleSkip}
          className="text-gray-500 px-4 py-2 hover:text-gray-700"
        >
          Überspringen
        </button>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-2 px-6 mb-8">
        {tutorialSteps.map((step, index) => (
          <div
            key={step.id}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: index <= currentStep ? '#8B4513' : '#E5E5E5'
            }}
          />
        ))}
      </div>

      {/* Welcome Badge (only on first step) */}
      {currentStep === 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mx-6 mb-8 p-4 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <p className="text-white">Willkommen bei HairConnekt!</p>
              <p className="text-white/80 text-sm">Ihr Geschäft wurde genehmigt</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md text-center"
          >
            {/* Icon/Illustration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-12"
            >
              <div 
                className="w-48 h-48 mx-auto rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${currentStepData.color}15` }}
              >
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentStepData.color}25` }}
                >
                  <Icon 
                    className="w-16 h-16" 
                    style={{ color: currentStepData.color }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-gray-900 mb-4"
            >
              {currentStepData.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-gray-600 text-lg leading-relaxed"
            >
              {currentStepData.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="p-6 space-y-3">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg"
          style={{ backgroundColor: '#8B4513' }}
        >
          {currentStep === tutorialSteps.length - 1 ? 'Zum Dashboard' : 'Weiter'}
        </Button>
        
        {/* Step indicator text */}
        <p className="text-center text-gray-400 text-sm">
          {currentStep + 1} von {tutorialSteps.length}
        </p>
      </div>
    </div>
  );
}
