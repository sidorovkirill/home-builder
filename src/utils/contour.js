import * as _ from 'lodash';
import {
  ColumnTypes,
  DirectionTypes,
  MoveTypes
} from 'constants/model-variables';

import {getColumnById, getColumnByPosition} from 'utils/construction';

const angleSet = [ColumnTypes.ANGLE, ColumnTypes.INNER_ANGLE];

export default class Сontour {
  constructor(columns) {
    if(this.allColumnIsTyped(columns)) {
      this.columns = columns.filter((column) => [ColumnTypes.OUTER, ColumnTypes.ANGLE, ColumnTypes.INNER_ANGLE].includes(column.type));
    } else {
      throw Error('All of columns should be typed');
    }
    this.direction = DirectionTypes.AGAINST;
    this.moveType = MoveTypes.PLUS;
    this.actualColumn = null;
    this.visited = [];
    this.output = [];

    this.setUp();
    this.calculateСontour();
  }

  forEach(callback) {
    this.output.forEach(({column, meta}, index) => callback(column, meta, index));
  }

  map(callback) {
    return this.output.map(({column, meta}, index) =>
      callback(column, meta, lastColumn && lastColumn.column, index)
    );
  }

  setUp() {
    this.actualColumn = this.getStartColumn();
    console.log('Start Column', this.actualColumn);
    this.direction = this.getDirectionOfColumn(this.actualColumn);
  }

  calculateСontour(){
    this.output.push({
      column: this.actualColumn,
      meta: {
        direction: this.direction,
        moveType: this.moveType,
      }
    });
    for(let i = 0; i < this.columns.length - 1; i++) {
      const newColumn = this.getNextColumn();
      this.visited.push(newColumn.id);
      this.output.push(this.assembleColumnInfo(newColumn));
      this.actualColumn = newColumn;
    }
    // Recalculation of first column for avoid wrong initial value
    this.getNextColumn();
    this.output[0] = this.assembleColumnInfo(this.output[0].column);
  }

  assembleColumnInfo(newColumn) {
    return {
      column: newColumn,
      meta: {
        direction: this.direction,
        moveType: this.moveType,
      }
    }
  }

  allColumnIsTyped(columns){
    for(let column of columns) {
      if(!column.type) {
        return false;
      }
    }
    return true;
  }

  getNextColumn() {
    if (angleSet.includes(this.actualColumn.type)) {
      this.direction = this.getAnotherDirection();
      const neighbours = this.getNeighboursByDirection(this.actualColumn.position, this.direction);
      const variants = this.getExistedNeighbours(neighbours);
      let nextColumn = variants[0];
      if(variants.length > 1) {
        nextColumn = variants
          .find((column) => this.getDirectionOfColumn(column) === this.direction || angleSet.includes(column.type));
      }

      console.log("-----------------------------------");
      console.log('actual', this.actualColumn);
      console.log(this.direction, this.moveType);
      console.log('next', variants);

      this.moveType = this.getMoveType(this.actualColumn.position, nextColumn.position, this.direction);
      return nextColumn;
    } else if (this.actualColumn.type === ColumnTypes.OUTER) {
      const nextPosition = this.getNextPositionBySameDirection(this.actualColumn.position, this.direction, this.moveType);
      return getColumnByPosition(nextPosition, this.columns);
    }
  }

  getAnotherDirection() {
    if(this.direction === DirectionTypes.TOWARD) {
      return DirectionTypes.AGAINST;
    } else if (this.direction === DirectionTypes.AGAINST) {
      return DirectionTypes.TOWARD;
    }
  }

  getNextPositionBySameDirection(position, direction, moveType) {
    const [x, y] = position;
    switch (direction) {
      case DirectionTypes.TOWARD:
        switch (moveType) {
          case MoveTypes.PLUS:
            return [x + 1, y];
          case MoveTypes.MINUS:
            return [x - 1, y];
        }
      case DirectionTypes.AGAINST:
        switch (moveType) {
          case MoveTypes.PLUS:
            return [x, y + 1];
          case MoveTypes.MINUS:
            return [x, y - 1];
        }
    }
  }

  getMoveType(previousPosition, nextPosition, direction) {
    const [prevPosX, prevPosY] = previousPosition;
    const [nextPosX, nextPosY] = nextPosition;
    switch (direction) {
      case DirectionTypes.TOWARD:
        if(prevPosX > nextPosX) {
          return MoveTypes.MINUS;
        }
        if(prevPosX < nextPosX){
          return MoveTypes.PLUS;
        }
      case DirectionTypes.AGAINST:
        if(prevPosY > nextPosY) {
          return MoveTypes.MINUS;
        }
        if(prevPosY < nextPosY){
          return MoveTypes.PLUS;
        }
    }
  }

  getNeighboursByDirection(position, direction) {
    const [x, y] = position;
    switch (direction) {
      case DirectionTypes.TOWARD:
        return [[x - 1, y], [x + 1, y]];
      case DirectionTypes.AGAINST:
        return [[x, y - 1], [x, y + 1]];
    }
  }

  getStartColumn() {
    const minY = Math.min(...this.columns.map(({position: [x, y]}) => y));
    const bottomColumns =  this.columns.filter(({position: [x, y]}) => y === minY);
    const minX = Math.min(...bottomColumns.map(({position: [x, y]}) => x));
    return this.columns.find(({position: [x, y]}) => x === minX && y === minY);
  }

  getDirectionOfColumn(column) {
    const towardNeighbours = this.getNeighboursByDirection(column.position, DirectionTypes.TOWARD);
    const againstNeighbours = this.getNeighboursByDirection(column.position, DirectionTypes.AGAINST);
    if (this.getExistedNeighbours(towardNeighbours).length > 0) {
      return DirectionTypes.TOWARD;
    } else if (this.getExistedNeighbours(againstNeighbours).length > 0) {
      return DirectionTypes.AGAINST
    }
  }

  getExistedNeighbours(neighbours) {
    return neighbours
      .map((item) => getColumnByPosition(item, this.columns))
      .filter((item) => !!item && !this.visited.includes(item.id));
  }
}