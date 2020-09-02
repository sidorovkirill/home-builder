import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  controlPinched: false,
  altPinched: false,
  shiftPinched: false,
};

const editorSlice = createSlice({
  name: 'keyboard',
  initialState,
  reducers: {
    changeKeyboardButtonState(state, { payload }) {
      const buttonState = `${payload.button}Pinched`;
      if (state.hasOwnProperty(buttonState)) {
        state[buttonState] = payload.state;
      }
      return state;
    },
  },
});

export const { changeKeyboardButtonState } = editorSlice.actions;

export default editorSlice.reducer;