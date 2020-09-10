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
  const {
    contour,
    actualSide,
    selectedFaces: alreadySelected,
    manipulatorIsMoving,
  } = structure;
  let selectedFaces = [...alreadySelected];
  let side = getActualSide(contour, newFace.columnid);
  let resetWasExecute = false;

  if(!isMoving && !manipulatorIsMoving) {
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
      resetWasExecute = true;
    }

    if(alreadySelected.length === 0 || resetWasExecute) {
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
  const {camera, structure} = getState();
  const {isMoving} = camera;
  const {manipulatorIsMoving} = structure;
  if(!isMoving && !manipulatorIsMoving) {
    batch(() => {
      dispatch(changeFacesSelection([]));
      dispatch(updateActualSide(null));
    })
  }
};

const getActualSide = (contour, id) => {
  return contour.find((face) => face.column.id === id).meta;
};