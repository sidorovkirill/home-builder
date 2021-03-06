import * as THREE from 'three';
import * as _ from 'lodash';
import {
  DirectionTypes,
  MoveTypes,
} from 'constants/model-variables.js';

export function findOuterColumns(crossbars) {
  return crossbars
    .filter((crossbar) => crossbar.type === CrossbarTypes.AGAINST_OUTER || crossbar.type === CrossbarTypes.TOWARDS_OUTER)
    .map((crossbar) => crossbar.columns);
}

export function createColumnsQueue(outerColumns) {
  const original = outerColumns[0][0];
  let actual = outerColumns[0][1];
  outerColumns.splice(0, 1);
  let queue = [original];
  for(let i = 0; i < 11; i++) {
    for (const [index, col] of outerColumns.entries()) {
      const [firstCol, secondCol] = col;
      if(secondCol === actual) {
        queue.push(actual);
        actual = firstCol;
        outerColumns = outerColumns.filter((column, colIndex) => colIndex !== index);
        break;
      }
      if(firstCol === actual) {
        queue.push(actual);
        actual = secondCol;
        outerColumns = outerColumns.filter((column, colIndex) => colIndex !== index);
        break;
      }
    }
  }
  return queue;
}

export const transformRotation = (rotation) => rotation.map((deg) => THREE.Math.degToRad(deg));

const getIndexOfActiveColumn = (direction, moveType) => {
  if(direction === DirectionTypes.TOWARD) {
    if(moveType === MoveTypes.MINUS){
      return 0;
    } else {
      return 2;
    }
  } else {
    if(moveType === MoveTypes.MINUS){
      return 3;
    } else {
      return 1;
    }
  }
};

export const getUnitByColumn = (columnId, side, units) => {
  const {direction, moveType} = side;
  let index = getIndexOfActiveColumn(direction, moveType);
  return units.find(unit => unit.columns[index] === columnId);
};

export const getUnitsByColumn = (columnId, units) => {
  return units.filter((unit) => unit.columns.includes(columnId));
};

export const getColumnById = (id, columns) => {
  return columns.find((column) => column.id == id);
};

export const getColumnByPosition = (position, columns) => {
  return columns.find((column) => _.isEqual(column.position, position));
};