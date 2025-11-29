import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');

    // Show splash for 2.5 seconds
    const timer = setTimeout(() => {
      // Navigate based on user state
      setTimeout(() => {
        if (isLoggedIn === 'true') {
          if (userType === 'provider') {
            navigate('/provider/dashboard');
          } else {
            navigate('/home');
          }
        } else if (hasCompletedOnboarding === 'true') {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#8B4513] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Hair braiding icon */}
                <path
                  d="M40 10C35 10 30 15 30 20C30 22 31 24 32 25C28 26 25 30 25 35C25 37 26 39 27 40C23 41 20 45 20 50C20 55 24 59 29 59C29 64 33 68 38 68H42C47 68 51 64 51 59C56 59 60 55 60 50C60 45 57 41 53 40C54 39 55 37 55 35C55 30 52 26 48 25C49 24 50 22 50 20C50 15 45 10 40 10Z"
                  fill="#8B4513"
                />
                <path
                  d="M34 25C32 27 30 30 30 35C30 38 32 40 34 42C36 40 38 38 40 38C42 38 44 40 46 42C48 40 50 38 50 35C50 30 48 27 46 25C44 27 42 28 40 28C38 28 36 27 34 25Z"
                  fill="#FF6B6B"
                  opacity="0.8"
                />
              </svg>
            </div>
            <h1 className="text-white text-4xl mb-2">HairConnekt</h1>
            <p className="text-white/80 text-lg">Ihr Friseur, Ihre Zeit</p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex gap-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0
                }}
                className="w-3 h-3 rounded-full bg-white"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.2
                }}
                className="w-3 h-3 rounded-full bg-white"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.4
                }}
                className="w-3 h-3 rounded-full bg-white"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-12 left-0 right-0 text-center px-6"
        >
          <p className="text-white/60 text-sm">
            Verbinde dich mit den besten Friseuren in deiner Stadt
          </p>
        </motion.div>
      </div>
    </div>
  );
}
