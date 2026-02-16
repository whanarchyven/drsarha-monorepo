import { create } from 'zustand';

interface ExampleStoreState {
  someState: string | null;
}

interface ExampleStoreActions {
  setSomeState: (someState: string | null) => void;
}

export const useExampleStore = create<ExampleStoreState & ExampleStoreActions>(
  (set) => ({
    someState: null,
    setSomeState: (someState) => {
      set(() => {
        return {
          someState,
        };
      });
    },
  })
);
