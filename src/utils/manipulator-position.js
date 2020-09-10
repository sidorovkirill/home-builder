import {
  DirectionTypes,
  MoveTypes,
} from 'constants/model-variables.js';

import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';

const offsetFromManipulationFaces = 0.01;

export const calculateManipulatorPosition = (columns, selectedFaces, actualSide) => {
  if (actualSide) {
    const activeColumns = columns.filter((item) => selectedFaces.find((sel) => item.id === sel.columnid));
    const { direction, moveType } = actualSide;

    const xValues = [];
    const yValues = [];

    activeColumns.forEach(({ position }) => {
      const [x, y] = position;
      xValues.push(x);
      yValues.push(y);
    });

    const [ox, oy, oz] = calculateOffset(actualSide);

    let minX = Math.min(...xValues);
    let maxX = Math.max(...xValues);
    let minY = Math.min(...yValues);
    let maxY = Math.max(...yValues);

    if (direction === DirectionTypes.TOWARD) {
      return [
        minX * unitSide + ((maxX - minX) + 1) * unitSide / 2 + ox,   // x
        (moveType === MoveTypes.MINUS ? minY : maxY) * unitSide + oy,// y
        oz,                                                          // z
      ];
    } else if (direction === DirectionTypes.AGAINST) {
      return [
        (moveType === MoveTypes.MINUS ? maxX : minX) * unitSide + ox,// x
        minY * unitSide + ((maxY - minY) + 1) * unitSide / 2 + oy,   // y
        oz,                                                          // z
      ];
    }
  } else {
    return [0, 0, 0];
  }
};

export const calculateOffset = (actualSide) => {
  const z = unitHeight / 2;
  if(actualSide) {
    const { direction, moveType } = actualSide;

    if (direction === DirectionTypes.TOWARD && moveType === MoveTypes.MINUS) {
      return [
        0,
        -(crossbarSide / 2 + offsetFromManipulationFaces),
        z
      ];
    } else if (direction === DirectionTypes.AGAINST && moveType === MoveTypes.PLUS) {
      return [
        - (crossbarSide / 2 + offsetFromManipulationFaces),
        - unitSide,
        z
      ];
    } else if (direction === DirectionTypes.TOWARD && moveType === MoveTypes.PLUS) {
      return [
        - unitSide,
        crossbarSide / 2 + offsetFromManipulationFaces,
        z
      ];
    } else if (direction === DirectionTypes.AGAINST && moveType === MoveTypes.MINUS) {
      return [
        crossbarSide / 2 + offsetFromManipulationFaces,
        0,
        z
      ];
    }
  }
  else {
    return [0, 0, z];
  }

};

export const calculateManipulatorRotation = (actualSide) => {
  const { direction, moveType } = actualSide;

  if (direction === DirectionTypes.TOWARD && moveType === MoveTypes.MINUS) {
    return 0;
  } else
  if (direction === DirectionTypes.AGAINST && moveType === MoveTypes.PLUS) {
    return 90;
  } else
  if (direction === DirectionTypes.TOWARD && moveType === MoveTypes.PLUS) {
    return 180;
  } else
  if (direction === DirectionTypes.AGAINST && moveType === MoveTypes.MINUS) {
    return 270;
  } else {
    return 0;
  }
};
