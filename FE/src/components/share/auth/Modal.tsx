import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              ✕
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
