import { createSlice } from '@reduxjs/toolkit'
import {SelectionActions} from 'constants/actions-variables';


const initialState = {
  selectedFaces: []
};

const editorSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    changeFacesSelection(state, {payload}) {
      switch (payload.action) {
        case SelectionActions.ADD:
          state.selectedFaces.push(payload.faceID);
          break;
        case SelectionActions.DEC:
          const position = state.selectedFaces.indexOf(payload.faceID);
          if(position > -1) {
            state.selectedFaces.splice(position, 1);
          }
          break;
      }
      return state;
    }
  }
});

export const {changeFacesSelection} = editorSlice.actions;

export default editorSlice.reducer;