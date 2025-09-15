import { create } from "zustand";

type ModalType = "login" | "signup" | "signupSuccess" | "logoutConfirm" | "cancelAccount" | null;

interface ModalState {
  openModal: ModalType;
  setOpenModal: (modal: ModalType) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  openModal: null,
  setOpenModal: (modal) => set({ openModal: modal }),
}));
