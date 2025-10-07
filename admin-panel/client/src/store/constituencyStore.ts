import { create } from "zustand";
import type { TConstituencyModel } from "../types/ConstituencyType";
import { constituencyListSampleData } from "../testingData/constituencyDataSample";

type TToastMessage = {
  type: string;
  toastMessage: string;
};

type TFilter = {
  divisionName: string;
  districtName: string;
  pageNumber: number;
};

type TConstituencyStore = {
  divisionList: TConstituencyModel[];
  filter: TFilter;

  setDivisionList: () => TToastMessage;
  setFilter: (filter: Partial<TFilter>) => void;
  addDivision: (divisionName: string) => Promise<TToastMessage>;
  updateConstituency: (constituencyObject: TConstituencyModel) => TToastMessage;

  //   Computed parts
  getFilteredDivisionObject: () => TConstituencyModel | undefined;
};

export const useConstituencyStore = create<TConstituencyStore>((set, get) => ({
  divisionList: [],
  filter: {
    divisionName: "",
    districtName: "",
    pageNumber: 1,
  },

  setDivisionList: () => {
    const toastMessage: TToastMessage = {
      type: "",
      toastMessage: "",
    };

    // TODO: Add the route of get API
    set({
      divisionList: constituencyListSampleData,
    });

    toastMessage.type = "success";
    toastMessage.toastMessage = "Division added successfully";

    return toastMessage;
  },

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  addDivision: async (divisionName) => {
    const toastMessage: TToastMessage = {
      type: "",
      toastMessage: "",
    };

    set((state) => {
      if (state.divisionList.some((d) => d.divisionName === divisionName)) {
        toastMessage.type = "ERROR 409";
        toastMessage.toastMessage = "This division is already exists";
        return state; // no duplicate
      }

      // TODO: Add the route of POST API

      toastMessage.type = "success";
      toastMessage.toastMessage = "Division added successfully";
      return {
        divisionList: [...state.divisionList, { divisionName, districts: [] }],
      };
    });

    return toastMessage;
  },

  updateConstituency: (constituencyObject) => {
    const toastMessage: TToastMessage = {
      type: "",
      toastMessage: "",
    };

    console.log(constituencyObject);

    // Add the route of update API

    set((state) => ({
      divisionList: state.divisionList.map((division) =>
        division.divisionName === constituencyObject.divisionName
          ? constituencyObject // create a new object
          : division
      ),
    }));

    toastMessage.type = "success";
    toastMessage.toastMessage = "Updated";
    return toastMessage;
  },

  getFilteredDivisionObject: () => {
    const { divisionList, filter } = get();
    return divisionList.find(
      (division) =>
        division.divisionName.toLowerCase() ===
        filter.divisionName.toLowerCase()
    );
  },
}));
