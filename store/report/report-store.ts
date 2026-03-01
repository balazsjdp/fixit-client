import { createStore } from "zustand/vanilla";
import { Category } from "@/types/category";

export interface Address {
  postcode: string;
  city: string;
  street: string;
  houseNumber: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ReportForm {
  category: Category | null;
  files: File[];
  description: string;
  urgency: number;
  address: Address;
  coordinates: Coordinates | null;
}

export type ReportState = {
  form: ReportForm;
};

export type ReportActions = {
  setCategory: (category: Category | null) => void;
  setFiles: (files: File[]) => void;
  setDescription: (description: string) => void;
  setUrgency: (urgency: number) => void;
  setAddress: (address: Partial<Address>) => void;
  setCoordinates: (coordinates: Coordinates | null) => void;
  resetForm: () => void;
  initForm: (data: Partial<ReportForm>) => void;
};

export type ReportStore = ReportState & { actions: ReportActions };

export const defaultInitState: ReportState = {
  form: {
    category: null,
    files: [],
    description: "",
    urgency: 50,
    address: {
      postcode: "",
      city: "",
      street: "",
      houseNumber: "",
    },
    coordinates: null,
  },
};

export const reportStore = createStore<ReportStore>((set) => ({
  ...defaultInitState,
  actions: {
    setCategory: (category) =>
      set((state) => ({ form: { ...state.form, category } })),
    setFiles: (files) => set((state) => ({ form: { ...state.form, files } })),
    setDescription: (description) =>
      set((state) => ({ form: { ...state.form, description } })),
    setUrgency: (urgency) =>
      set((state) => ({ form: { ...state.form, urgency } })),
    setAddress: (address) =>
      set((state) => ({
        form: { ...state.form, address: { ...state.form.address, ...address } },
      })),
    setCoordinates: (coordinates) =>
      set((state) => ({ form: { ...state.form, coordinates } })),
    resetForm: () => set({ form: defaultInitState.form }),
    initForm: (data) =>
      set((state) => ({ form: { ...state.form, ...data } })),
  },
}));