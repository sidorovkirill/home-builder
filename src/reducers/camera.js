import { createSlice } from '@reduxjs/toolkit'
import {SelectionActions} from 'constants/actions-variables';

const initialState = {
  distance: 0,
  isMoving: false,
  dragPool: []
};

const cameraSlice = createSlice({
  name: "camera",
  initialState,
  reducers: {
    changeDistance(state, {payload}) {
      state.distance = payload;
      return state;
    },
    changeMovingStatus(state, {payload}) {
      state.isMoving = payload;
      return state;
    }
  }
});

export const {
  changeDistance,
  changeMovingStatus,
  addToDragPool,
  clearDragPool
} = cameraSlice.actions;

export default cameraSlice.reducer;