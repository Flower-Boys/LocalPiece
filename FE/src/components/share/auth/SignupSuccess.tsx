import { useModalStore } from "@/store/modalStore";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupSuccess = () => {
  const setOpenModal = useModalStore((s) => s.setOpenModal);
  const [showConfetti, setShowConfetti] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
      setOpenModal(null);
      navigate("/"); // ✅ 5초 후 자동으로 홈으로 이동
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, setOpenModal]);

  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col items-center text-center gap-4"
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ✅ 위에서 떨어지는 폭죽 */}
        {showConfetti && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={300}
              gravity={0.2}
              initialVelocityY={10}
              recycle={false}
              confettiSource={{
                x: 0,
                y: 0,
                w: window.innerWidth,
                h: 0,
              }}
            />
          </div>
        )}

        <h2 className="text-3xl font-extrabold text-gray-800">🎉 환영합니다!</h2>
        <p className="text-gray-600">이제 여행지를 자유롭게 둘러볼 수 있어요 ✈️</p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setOpenModal(null);
            navigate("/");
          }}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
        >
          메인으로 가기
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupSuccess;
