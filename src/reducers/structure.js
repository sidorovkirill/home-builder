import { createSlice } from '@reduxjs/toolkit'
import {SelectionActions} from 'constants/actions-variables';
import structure from 'constants/data-format';

const initialState = {
  structure: [
    structure,
  ],
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
  }
});

export const {
  changeFacesSelection,
  changeMovingStatus,
  updateContour,
  updateActualSide
} = editorSlice.actions;

export default editorSlice.reducer;