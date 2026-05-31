import { create } from "zustand";
import type { TaskStatus } from "@csac/shared";

export type StatusFilter = "all" | TaskStatus;
export type StreamStatus = "idle" | "connecting" | "live" | "reconnecting";
export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface UiState {
  selectedStudentId: string | null;
  statusFilter: StatusFilter;
  streamStatus: StreamStatus;
  toasts: ToastMessage[];
  selectStudent: (studentId: string) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setStreamStatus: (status: StreamStatus) => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
}

let toastSequence = 0;

export const useUiStore = create<UiState>((set) => ({
  selectedStudentId: null,
  statusFilter: "all",
  streamStatus: "idle",
  toasts: [],
  selectStudent: (selectedStudentId) => set({ selectedStudentId, statusFilter: "all" }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setStreamStatus: (streamStatus) => set({ streamStatus }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast_${(toastSequence += 1)}` }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
