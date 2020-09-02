import { createSlice } from '@reduxjs/toolkit'
import {SelectionActions} from 'constants/actions-variables';


const initialState = {
  selectedFaces: [],
  manipulatorIsMoving: false,
  shiftOnLastStep: false
};

const editorSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    changeFacesSelection(state, {payload}) {
      const index = state.selectedFaces.indexOf(payload);
      if(index > -1) {
        state.selectedFaces.splice(index, 1);
      } else {
        state.selectedFaces.push(payload);
      }
      return state;
    },
    changeMovingStatus(state, {payload}) {
      state.manipulatorIsMoving = payload;
      return state;
    }
  },
  // extraReducers: {
  //   globalPointerUp: (state, {payload: store}) => {
  //     const shiftPinched = store.keyboard.shiftPinched;
  //     console.log(shiftPinched);
  //     state.manipulatorIsMoving = false;
  //     const selectedCount = state.selectedFaces.length;
  //     if(!shiftPinched){
  //       state.selectedFaces = [];
  //     }
  //     if(!shiftPinched && selectedCount > 1) {
  //       state.selectedFaces = [state.selectedFaces[selectedCount - 1]];
  //     }
  //     state.shiftOnLastStep = shiftPinched;
  //     return state
  //   }
  // }
});

export const {changeFacesSelection, changeMovingStatus} = editorSlice.actions;

export default editorSlice.reducer;