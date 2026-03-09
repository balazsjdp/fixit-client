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
  shortDescription: string;
  description: string;
  urgency: number;
  phone: string;
  address: Address;
  coordinates: Coordinates | null;
}

export type ReportState = {
  form: ReportForm;
};

export type ReportActions = {
  setCategory: (category: Category | null) => void;
  setFiles: (files: File[]) => void;
  setShortDescription: (shortDescription: string) => void;
  setDescription: (description: string) => void;
  setUrgency: (urgency: number) => void;
  setPhone: (phone: string) => void;
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
    shortDescription: "",
    description: "",
    urgency: 50,
    phone: "",
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
    setShortDescription: (shortDescription) =>
      set((state) => ({ form: { ...state.form, shortDescription } })),
    setDescription: (description) =>
      set((state) => ({ form: { ...state.form, description } })),
    setUrgency: (urgency) =>
      set((state) => ({ form: { ...state.form, urgency } })),
    setPhone: (phone) =>
      set((state) => ({ form: { ...state.form, phone } })),
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