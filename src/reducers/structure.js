import { createSlice } from '@reduxjs/toolkit'
import { SelectionActions } from 'constants/actions-variables';
import structure from 'constants/data-format';

const initialState = {
  structure: [
    structure,
  ],
  copy: null,
  selectedFaces: [],
  actualSide: null,
  manipulatorIsMoving: false,
  floor: 1,
  isEnriched: false,
  contour: null
};

const editorSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    changeFacesSelection(state, {payload}) {
      state.selectedFaces = payload;
      return state;
    },
    changeMovingStatus(state, {payload}) {
      state.manipulatorIsMoving = payload;
      return state;
    },
    updateContour(state, {payload: contour}) {
      state.contour = contour;
      state.isEnriched = true;
      return state;
    },
    updateActualSide(state, {payload}) {
      state.actualSide = payload;
      return state;
    },
    duplicateStructure(state) {
      state.copy = state.structure;
      return state;
    },
    applyStructureChanges(state) {
      state.copy = null;
      return state;
    },
    rejectStructureChanges(state) {
      state.structure = state.copy;
      state.copy = null;
      return state;
    },
    updateStructure(state, {payload}) {
      state.structure = payload;
      return state;
    },
    updateCrossbars(state, {payload}) {
      state.structure[state.floor - 1].crossbars1 = payload;
      return state;
    },
    addFloor(state) {
      state = JSON.parse(JSON.stringify(state));
      const newFloor = state.floor + 1;
      console.log('newFloor', newFloor);
      console.log('newFloor', state, state.structure, state.structure[state.floor - 1]);
      state.structure[newFloor - 1] = state.structure[state.floor - 1];
      state.selectedFaces = [];
      state.floor = newFloor;
      return state
    },
    choseFloor(state, {payload}) {
      console.log(payload);
      state.floor = payload;
    }
  }
});

export const {
  changeFacesSelection,
  changeMovingStatus,
  updateContour,
  updateActualSide,
  duplicateStructure,
  applyStructureChanges,
  rejectStructureChanges,
  updateStructure,
  updateCrossbars,
  addFloor,
  choseFloor
} = editorSlice.actions;

export default editorSlice.reducer;