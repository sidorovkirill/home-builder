import {CrossbarTypes, ConstructionSides, ColumnTypes, DirectionTypes} from 'constants/model-variables.js';
import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';

export default {
  columns: [
    { id: 0, position: [0, 0], element: 'K', type: ColumnTypes.ANGLE},
    { id: 1, position: [1, 0], element: 'K', type: ColumnTypes.OUTER},
    { id: 2, position: [2, 0], element: 'K', type: ColumnTypes.ANGLE},
    { id: 3, position: [0, 1], element: 'K', type: ColumnTypes.OUTER},
    { id: 4, position: [1, 1], element: 'K', type: ColumnTypes.INNER},
    { id: 5, position: [2, 1], element: 'K', type: ColumnTypes.INNER_ANGLE},
    { id: 6, position: [3, 1], element: 'K', type: ColumnTypes.ANGLE},
    { id: 7, position: [0, 2], element: 'K', type: ColumnTypes.OUTER},
    { id: 8, position: [1, 2], element: 'K', type: ColumnTypes.INNER},
    { id: 9, position: [2, 2], element: 'K', type: ColumnTypes.INNER},
    { id: 10, position: [3, 2], element: 'K', type: ColumnTypes.OUTER},
    { id: 11, position: [0, 3], element: 'K', type: ColumnTypes.ANGLE},
    { id: 12, position: [1, 3], element: 'K', type: ColumnTypes.OUTER},
    { id: 13, position: [2, 3], element: 'K', type: ColumnTypes.OUTER},
    { id: 14, position: [3, 3], element: 'K', type: ColumnTypes.ANGLE},
  ],
  units: [
    {id: 0, columns: [0, 3, 4, 1]},
    {id: 1, columns: [1, 4, 5, 2]},
    {id: 2, columns: [3, 7, 8, 4]},
    {id: 3, columns: [4, 9, 8, 5]},
    {id: 4, columns: [5, 9, 10, 6]},
    {id: 5, columns: [7, 11, 12, 8]},
    {id: 6, columns: [8, 12, 13, 9]},
    {id: 7, columns: [9, 13, 14, 10]},
  ],
  crossbars: [
    {
      id: 0,
      columns: [0, 3],
      type: CrossbarTypes.TOWARDS_OUTER,
      side: ConstructionSides.LEFT,
      element: 'R6',
    },
    {
      id: 1,
      columns: [3, 7],
      type: CrossbarTypes.TOWARDS_OUTER,
      side: ConstructionSides.LEFT,
      element: 'R6',
    },
    {
      id: 2,
      columns: [7, 11],
      type: CrossbarTypes.TOWARDS_OUTER,
      side: ConstructionSides.LEFT,
      element: 'R6',
    },
    {
      id: 3,
      columns: [0, 1],
      type: CrossbarTypes.AGAINST_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R5',
    },
    {
      id: 4,
      columns: [1, 2],
      type: CrossbarTypes.AGAINST_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R5',
    },
    {
      id: 5,
      columns: [3, 4],
      type: CrossbarTypes.AGAINST_INNER,
      side: ConstructionSides.RIGHT,
      element: 'R9',
    },
    {
      id: 6,
      columns: [4, 5],
      type: CrossbarTypes.AGAINST_INNER,
      side: ConstructionSides.RIGHT,
      element: 'R9',
    },
    {
      id: 7,
      columns: [5, 6],
      type: CrossbarTypes.AGAINST_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R7',
    },
    {
      id: 8,
      columns: [7, 8],
      type: CrossbarTypes.AGAINST_INNER,
      side: ConstructionSides.RIGHT,
      element: 'R9',
    },
    {
      id: 9,
      columns: [8, 9],
      type: CrossbarTypes.AGAINST_INNER,
      side: ConstructionSides.RIGHT,
      element: 'R9',
    },
    {
      id: 10,
      columns: [9, 10],
      type: CrossbarTypes.AGAINST_INNER,
      side: ConstructionSides.RIGHT,
      element: 'R9',
    },
    {
      id: 11,
      columns: [4, 8],
      type: CrossbarTypes.TOWARDS_INNER,
      side: ConstructionSides.LEFT,
      element: 'R8',
    },
    {
      id: 12,
      columns: [8, 12],
      type: CrossbarTypes.TOWARDS_INNER,
      side: ConstructionSides.LEFT,
      element: 'R8',
    },
    {
      id: 13,
      columns: [1, 4],
      type: CrossbarTypes.TOWARDS_INNER,
      side: ConstructionSides.LEFT,
      element: 'R8',
    },
    {
      id: 14,
      columns: [5, 9],
      type: CrossbarTypes.TOWARDS_INNER,
      side: ConstructionSides.LEFT,
      element: 'R8',
    },
    {
      id: 15,
      columns: [9, 13],
      type: CrossbarTypes.TOWARDS_INNER,
      side: ConstructionSides.LEFT,
      element: 'R8',
    },
    {
      id: 16,
      columns: [2, 5],
      type: CrossbarTypes.TOWARDS_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R6',
    },
    {
      id: 17,
      columns: [6, 10],
      type: CrossbarTypes.TOWARDS_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R6',
    },
    {
      id: 18,
      columns: [10, 14],
      type: CrossbarTypes.TOWARDS_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R6',
    },
    {
      id: 19,
      columns: [11, 12],
      type: CrossbarTypes.AGAINST_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R5',
    },
    {
      id: 20,
      columns: [12, 13],
      type: CrossbarTypes.AGAINST_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R5',
    },
    {
      id: 21,
      columns: [13, 14],
      type: CrossbarTypes.AGAINST_OUTER,
      side: ConstructionSides.RIGHT,
      element: 'R5',
    },
  ],
  faces: [
    {
      id: 0,
      crossbar: 0,
      columns: [0, 3],
    }
  ],
  transforms: {
    [`${CrossbarTypes.TOWARDS_OUTER}_${ConstructionSides.LEFT}`]: {
      position: [0, crossbarSide / 2, unitSide / 2],
      rotation: [0, 0, 0],
    },
    [`${CrossbarTypes.TOWARDS_OUTER}_${ConstructionSides.RIGHT}`]: {
      position: [0, crossbarSide / 2, unitSide / 2],
      rotation: [0, 0, 180],
    },
    [`${CrossbarTypes.TOWARDS_INNER}_${ConstructionSides.LEFT}`]: {
      position: [0, crossbarSide / 2, unitSide / 2],
      rotation: [0, 0, 0],
    },
    [`${CrossbarTypes.AGAINST_OUTER}_${ConstructionSides.RIGHT}`]: {
      position: [unitSide / 2, crossbarSide / 2, 0],
      rotation: [0, 90, 0],
    },
    [`${CrossbarTypes.AGAINST_INNER}_${ConstructionSides.RIGHT}`]: {
      position: [unitSide / 2, crossbarSide / 2, 0],
      rotation: [0, 90, 0],
    },
  },
  facesTransforms: {
    [ColumnTypes.OUTER]: {
      rotation: [0, 0, 0],
    },
    [ColumnTypes.ANGLE]: {
      rotation: [0, 30, 0],
    },
    [ColumnTypes.INNER_ANGLE]: {
      rotation: [0, 0, 0],
    }
  }
};