import { createStore } from "zustand/vanilla";
import { Coordinates } from "@/store/report/report-store";

export interface ProRegisterForm {
  name: string;
  phone: string;
  categoryIds: number[];
  radiusKm: number;
  coordinates: Coordinates | null;
}

export type ProRegisterState = {
  form: ProRegisterForm;
};

export type ProRegisterActions = {
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  toggleCategory: (categoryId: number) => void;
  setRadiusKm: (radiusKm: number) => void;
  setCoordinates: (coordinates: Coordinates | null) => void;
  resetForm: () => void;
};

export type ProRegisterStore = ProRegisterState & {
  actions: ProRegisterActions;
};

export const defaultInitState: ProRegisterState = {
  form: {
    name: "",
    phone: "",
    categoryIds: [],
    radiusKm: 20,
    coordinates: null,
  },
};

export const proRegisterStore = createStore<ProRegisterStore>((set) => ({
  ...defaultInitState,
  actions: {
    setName: (name) => set((state) => ({ form: { ...state.form, name } })),
    setPhone: (phone) => set((state) => ({ form: { ...state.form, phone } })),
    toggleCategory: (categoryId) =>
      set((state) => {
        const ids = state.form.categoryIds;
        const next = ids.includes(categoryId)
          ? ids.filter((id) => id !== categoryId)
          : [...ids, categoryId];
        return { form: { ...state.form, categoryIds: next } };
      }),
    setRadiusKm: (radiusKm) =>
      set((state) => ({ form: { ...state.form, radiusKm } })),
    setCoordinates: (coordinates) =>
      set((state) => ({ form: { ...state.form, coordinates } })),
    resetForm: () => set({ form: defaultInitState.form }),
  },
}));
