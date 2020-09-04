import {
  changeFacesSelection,
  updateActualSide
} from 'reducers/structure';
import {batch} from 'react-redux'
import * as _ from 'lodash';

export const selectFace = (newFace) => (dispatch, getState) => {
  const {keyboard, structure, camera} = getState();
  const {shiftPinched, controlPinched} = keyboard;
  const {isMoving} = camera;
  const {contour, actualSide} = structure;
  let selectedFaces = [...structure.selectedFaces];
  let side = getActualSide(contour, newFace.columnid);
  console.log(actualSide, side);
  if(!isMoving) {
    if ((shiftPinched || controlPinched) && _.isEqual(actualSide, side)) {
      const existedFace = selectedFaces.find((face) => face.name === newFace.name);
      if (existedFace) {
        selectedFaces = selectedFaces.filter((face) => face.name !== newFace.name);
      } else {
        selectedFaces = [...selectedFaces, newFace];
      }
    }
    if (!(shiftPinched || controlPinched)) {
      selectedFaces = [newFace];
    }

    if(selectedFaces.length === 1) {
      batch(() => {
        dispatch(changeFacesSelection(selectedFaces));
        dispatch(updateActualSide(side));
      })
    } else {
      dispatch(changeFacesSelection(selectedFaces));
    }
  }
};

export const dropSelection = () => (dispatch, getState) => {
  const {camera} = getState();
  const {isMoving} = camera;
  if(!isMoving) {
    dispatch(changeFacesSelection([]));
  }
};

const getActualSide = (contour, id) => {
  return contour.find((face) => face.column.id === id).meta;
};