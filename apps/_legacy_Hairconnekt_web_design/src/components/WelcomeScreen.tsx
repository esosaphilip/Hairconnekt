import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { LogIn, UserPlus } from "lucide-react";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#8B4513] flex flex-col items-center justify-between p-6">
      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center text-center"
      >
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8"
        >
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
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white text-4xl mb-3"
        >
          HairConnekt
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/90 text-xl mb-2"
        >
          Ihr Friseur, Ihre Zeit
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-white/70 text-center max-w-sm px-4"
        >
          Verbinde dich mit den besten Friseuren, Salons und Barbieren in deiner Stadt
        </motion.p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full max-w-md space-y-4"
      >
        {/* Login Button */}
        <Button
          onClick={() => navigate("/login")}
          className="w-full h-14 bg-white text-[#8B4513] hover:bg-gray-100 text-lg"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Anmelden
        </Button>

        {/* Register Button */}
        <Button
          onClick={() => navigate("/register")}
          className="w-full h-14 bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Konto erstellen
        </Button>

        {/* Provider Link */}
        <button
          onClick={() => navigate("/account-type")}
          className="w-full py-4 text-white/80 hover:text-white text-center transition-colors"
        >
          Sind Sie Friseur/Salon?{" "}
          <span className="underline">Als Anbieter registrieren</span>
        </button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-white/50 text-sm text-center mt-6"
      >
        © 2025 HairConnekt. Alle Rechte vorbehalten.
      </motion.div>
    </div>
  );
}
