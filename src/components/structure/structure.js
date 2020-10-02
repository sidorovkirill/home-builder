import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useSelector, useDispatch, shallowEqual, batch } from 'react-redux';
import * as _ from 'lodash';
import {
  CrossbarTypes,
  ConstructionSides,
  ColumnTypes,
  DirectionTypes,
  MoveTypes,
} from 'constants/model-variables.js';
import { selectFace, dropSelection } from 'actions/structure';
import { changeFacesSelection } from 'reducers/structure';
import { unitSide, crossbarSide, unitHeight } from 'constants/construction-parameters.js';
import OuterManipulatorFace from 'components/outer-manipulator-face';
import Сontour from 'utils/contour';
import {
  transformRotation,
  getUnitByColumn
} from 'utils/construction';
import {
  calculateManipulatorRotation,
  calculateManipulatorPosition
} from 'utils/manipulator-position';
import {
  getColumnById,
  getColumnByPosition,
  getColumnByIdContour
} from 'utils/construction';
import FacesManipulator from 'components/faces-manipulator';
import {
  changeMovingStatus,
  updateContour,
  duplicateStructure,
  applyStructureChanges,
  rejectStructureChanges,
  updateStructure,
  updateCrossbars
} from 'reducers/structure';
import MultiselectParent from 'components/multiselect-parent';

const Structure = function(props) {
  const group = useRef();
  const [elements, setElements] = useState(null);
  const [selectionTexture, setTexture] = useState(null);
  const [manipulatorOffset, setManipulatorOffset] = useState(0);
  const [newColumnsRaw, setNewColumnsRaw] = useState(null);
  const [localSelectedFaces, setLocalSelectedFaces] = useState([]);
  const [moveCharacter, setМoveCharacter] = useState(0);
  const [unitsMatix, setUnitsMatix] = useState([]);
  const [manipulatorPosition, setManipulatorPosition] = useState([0, 0, 0]);
  const [manipulatorRotation, setManipulatorRotation] = useState([0, 0, 0]);

  const dispatch = useDispatch();
  const {
    selectedFaces,
    structure: allFloors,
    copy: structureCopy,
    contour,
    floor,
    isEnriched,
    actualSide,
    manipulatorIsMoving,
  } = useSelector(state => state.structure, shallowEqual);
  const { distance, sceneIsMoving } = useSelector(state => state.camera, shallowEqual);
  const structure = allFloors[floor - 1];

  useEffect(() => {
    const path = 'assets/models/elements.glb';
    const loader = new GLTFLoader();
    loader.load(path,
      (model) => {
        setElements(assembleElements(model));
      },
      (event) => {
        console.log(event);
      },
      (error) => {
        console.error(error);
      },
    );
  }, []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      // resource URL
      'assets/textures/selection-texture.png',
      function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        setTexture(texture);
      },
      undefined,
      function(err) {
        console.error('An error happened.');
      },
    );
  }, []);

  useEffect(() => {
    if(!manipulatorIsMoving && actualSide) {
      setManipulatorPosition(calculateManipulatorPosition(structure.columns, selectedFaces, actualSide, floor));
      setManipulatorRotation(calculateManipulatorRotation(actualSide));
    }
  }, [selectedFaces, actualSide, manipulatorIsMoving]);

  useEffect(() => {
    console.log('recalculate columns');
    const contour = new Сontour(structure.columns, structure.units);
    if(selectedFaces.length > 0) {
      let newSelection = null;
      if(moveCharacter > 0) {
        const newColumnIDs = newColumnsRaw.map((col) => col.id);
        const newColumns = contour.output.filter((contourCol) => newColumnIDs.includes(contourCol.column.id));
        newSelection = newColumns
          .filter(({ meta }) => _.isEqual(meta, actualSide))
          .map(({ column }) => ({ name: `outer_manipulator_face_${column.id}`, columnid: column.id }));
        setNewColumnsRaw(null);
      }
      if(moveCharacter < 0) {
        const columnsInCut = _.uniq(unitsMatix.reduce((acc, unitsSequence) => {
          const [nextUnit] = unitsSequence;
          acc.push(...nextUnit.columns);
          return acc;
        }, []));
        newSelection = contour.output.filter((contourCol) => {
          const {column, meta} = contourCol;
          return columnsInCut.includes(column.id) && _.isEqual(meta, actualSide);
        }).map(({ column }) => ({ name: `outer_manipulator_face_${column.id}`, columnid: column.id }));
        setUnitsMatix(null);
      }
      setLocalSelectedFaces(newSelection);
    }
    dispatch(updateContour(contour.output));
  }, [structure.columns]);

  useEffect(() => {
    if(manipulatorIsMoving) {
      setLocalSelectedFaces(selectedFaces);
    } else {
      dispatch(changeFacesSelection(localSelectedFaces));
    }
  }, [manipulatorIsMoving]);

  useEffect(() => {
    console.log('actualSide', actualSide);
    console.log('manipulatorOffset', manipulatorOffset);
    if(manipulatorOffset !== 0) {
      console.log(selectedFaces);
      console.log(actualSide);
      console.log(manipulatorOffset);

      const clone = _.cloneDeep(structureCopy);
      const clonedStructure = clone[floor - 1];
      const moveCharacter = getMoveCharacter(actualSide, manipulatorOffset);
      if(moveCharacter < 0) {
        const unitsForRemove = [];
        const unitsMatrix = [];
        selectedFaces.forEach((face) => {
          const unitsSequence = getUnitsSequence(face, clonedStructure);
          const units = getUnitsForRemove(unitsSequence);
          unitsMatrix.push(_.differenceBy(unitsSequence, units));
          unitsForRemove.push(...units);
        });
        const columnsForRemove = getColumnsForRemove(unitsForRemove);
        const units = _.differenceBy(clonedStructure.units, unitsForRemove, 'id');
        let columns = clonedStructure.columns;
        if(columnsForRemove.length > 0) {
          columns = columns.filter((column) => !columnsForRemove.includes(column.id));
        }
        setUnitsMatix(unitsMatrix);
        clonedStructure.columns = splitByColumnType(columns, units);
        clonedStructure.units = units;
      } else {
        const newUnitsCoordinates = selectedFaces.reduce((acc, face) => {
          const units = makeNewUnits(face, clonedStructure);
          return [...acc, ...units];
        }, []);

        const [columns, units, newColumns] = buildColumnsByUnits(
          newUnitsCoordinates,
          clonedStructure.units,
          clonedStructure.columns
        );
        setNewColumnsRaw(newColumns);
        clonedStructure.columns = splitByColumnType(columns, units);
        clonedStructure.units = units;
      }
      setМoveCharacter(moveCharacter);
      dispatch(updateStructure(clone));
    }
  }, [manipulatorOffset]);

  useEffect(() => {
    if(contour) {
      const outerCrossbars = createOuterCrossbars();
      const columnsIDs = _.uniq(outerCrossbars
        .filter((item) => {
          const {direction, moveType} = item;
          return direction === DirectionTypes.TOWARD && moveType === MoveTypes.MINUS ||
            direction === DirectionTypes.AGAINST && moveType === MoveTypes.PLUS;
        })
        .map((item) => item.columns)
        .flat());
      const innerCrossbars = createInnerCrossbars([]);
      console.log(structure.units);
      console.log(innerCrossbars);
      const crossbars = [...outerCrossbars, ...innerCrossbars].map((cb, index) => ({id: index, ...cb}));
      console.log(crossbars);
      dispatch(updateCrossbars(crossbars));
    }
  }, [contour]);

  const createOuterCrossbars = () => {
    return contour.map((item, index) => {
      const {column, meta} = item;
      const prevItem = contour[index - 1 < 0 ? contour.length - 1 : index - 1];
      const {column: prevColumn} = prevItem;
      return {
        columns: meta.moveType === MoveTypes.MINUS ? [column.id, prevColumn.id] : [prevColumn.id, column.id],
        columnType: ColumnTypes.OUTER,
        direction: meta.direction,
        moveType: meta.moveType,
        element: getCrossbarElement(item, prevItem)
      }
    });
  };

  const createInnerCrossbars = (exceptColumns) => {
    return structure.units.reduce((acc, unit) => {
      const [col0, col1, col2, col3] = unit.columns;
      console.log("-------------");
      console.log("unit", unit);
      let crossbars = [];
      if(!exceptColumns.includes(col1)) {
        crossbars.push({
          columns: [col1, col2],
          columnType: ColumnTypes.INNER,
          direction: DirectionTypes.AGAINST,
          moveType: MoveTypes.PLUS,
          element: 'R8'
        })
      }
      if(!exceptColumns.includes(col3)) {
        crossbars.push({
          columns: [col3, col2],
          columnType: ColumnTypes.INNER,
          direction: DirectionTypes.TOWARD,
          moveType: MoveTypes.PLUS,
          element: 'R9'
        })
      }
      return [...acc, ...crossbars];
    }, []);
  };

  const getCrossbarElement = (item, prevItem) => {
    const {column: prevColumn, meta: prevMeta} = prevItem;
    const {column: actColumn, meta: actMeta} = item;
    if(actColumn.type === ColumnTypes.INNER_ANGLE && prevMeta.direction === DirectionTypes.AGAINST ||
       actMeta.direction === DirectionTypes.TOWARD && prevColumn.type === ColumnTypes.INNER_ANGLE) {
      return 'R7'
    } else {
      return getElementInTrivialSituation(actMeta.direction);
    }
  };

  const getElementInTrivialSituation = (direction) => {
    if (direction === DirectionTypes.AGAINST) {
      return 'R6'
    } else {
      return 'R5';
    }
  };

  const getMoveCharacter = (actualSide, offset) => {
    const {direction, moveType} = actualSide;
    const sign = offset / Math.abs(offset);
    if(direction === DirectionTypes.TOWARD) {
      if(moveType === MoveTypes.PLUS) {
        return sign * -1;
      } else {
        return sign;
      }
    } else {
      if(moveType === MoveTypes.PLUS) {
        return sign;
      } else {
        return sign * -1;
      }
    }
  };

  const buildColumnsByUnits = (newUnitsCoordinates, oldUnits, oldColumns) => {
    const columns = oldColumns;
    const newColumns = [];
    const units = oldUnits;
    const lastId = Math.max(...columns.map((column) => column.id));
    newUnitsCoordinates.forEach((newUnitColumns, unitIndex) => {
      const columnsIDs = newUnitColumns.map((position, columnIndex) => {
        const column = getColumnByPosition(position, columns);
        if(!column) {
          const newColumn = createColumn(lastId + newColumns.length + 1, position);
          columns.push(newColumn);
          newColumns.push(newColumn);
          return newColumn.id;
        } else {
          return column.id;
        }
      });
      units.push(createUnit(units.length, columnsIDs));
    });

    return [columns, units, newColumns];
  };

  const createUnit = (id, columnsIDs) => ({
    id,
    columns: columnsIDs
  });

  const createColumn = (id, position) => ({
    id: id,
    position,
    element: 'K',
    type: null
  });

  const getUnitsForRemove = (unitsSequence) => {
    let unitsForRemove = [];
    const absOffset = Math.abs(manipulatorOffset);
    if (absOffset >= unitsSequence.length) {
      unitsForRemove = unitsSequence.slice(0, unitsSequence.length - 1);
    } else {
      unitsForRemove = unitsSequence.slice(0, absOffset);
    }
    return unitsForRemove;
  };

  const getUnitsSequence = (face, structure) => {
    const initialUnit = getUnitByColumn(face.columnid, actualSide, structure.units);
    const [initialColumnId] = initialUnit.columns;
    const column = getColumnById(initialColumnId, structure.columns);

    const unitsSequence = getUnitsBehindFace(column, structure);

    return unitsSequence;
  };

  const getUnitsBehindFace = (column, structure) => {
    let count = 0;
    const units = [];

    while(units.length === count) {
      const unitCoordinates = calculateUnit(column, count);
      const initColumn = getColumnByPosition(unitCoordinates[0], structure.columns);
      if (initColumn) {
        const unit = structure.units.find((unit) => unit.columns[0] === initColumn.id);
        if (unit) {
          units.push(unit);
        }
      }
      count++;
    }

    return units;
  };

  const getColumnsForRemove = (removedUnits) => {
    const structure = structureCopy[floor - 1];
    const columnsForRemove = [];

    const otherUnits = _.differenceBy(structure.units, removedUnits, 'id');
    console.log('otherUnits', otherUnits);
    const columnsInUnits = otherUnits.reduce((acc, unit) => {
      return [...acc, ...unit.columns];
    }, []);
    console.log('columnsInUnits', columnsInUnits);

    const columnsInRemovedUnits = _.uniq(removedUnits.reduce((acc, unit) => {
      return [...acc, ...unit.columns];
    }, []));

    columnsInRemovedUnits.forEach((colForRemId) => {
      if (columnsInUnits.filter(colId => colId === colForRemId).length === 0) {
        columnsForRemove.push(colForRemId);
      }
    });

    return columnsForRemove;
  };

  const makeNewUnits = (face, structure) => {
    console.log(face.columnid, actualSide, structure.units);
    const unit = getUnitByColumn(face.columnid, actualSide, structure.units);
    console.log('unit', unit);
    if (unit) {
      const [initialColumnId] = unit.columns;
      const column = getColumnById(initialColumnId, structure.columns);
      let newUnits = [];

      for(let i = 1; i < Math.abs(manipulatorOffset) + 1; i++) {
        newUnits.push(calculateUnit(column, i));
      }

      return newUnits;
    }
  };

  const calculateUnit = (column, offset) => {
    const sign = manipulatorOffset / Math.abs(manipulatorOffset);
    let baseColumn = null;
    const [x, y] = column.position;
    if(actualSide.direction === DirectionTypes.TOWARD) {
      baseColumn = [x, y - offset * sign];
    } else {
      baseColumn = [x - offset * sign, y];
    }
    return createUnitColumnsPositions(baseColumn);
  };

  const createUnitColumnsPositions = (baseColumnPosition) => {
    const [x, y] = baseColumnPosition;
    return [baseColumnPosition, [x, y + 1], [x + 1, y + 1], [x + 1, y]];
  };

  function buildOuterFaces() {
    if (isEnriched) {
      const height = unitHeight + crossbarSide;
      let zAngle = 180;
      return contour.map(({ column, meta }, index) => {
        const lastColumn = contour[index].column;
        const nextColumn = contour[index === contour.length - 1 ? 0 : index + 1].column;
        if (lastColumn.type === ColumnTypes.ANGLE) {
          zAngle += 90;
        } else if (lastColumn.type === ColumnTypes.INNER_ANGLE) {
          zAngle -= 90;
        }
        const pos = [
          unitSide * column.position[0],
          (unitHeight + crossbarSide) * (floor - 1),
          unitSide * column.position[1]
        ];
        const rotation = [0, zAngle, 0];
        const name = `outer_manipulator_face_${nextColumn.id}`;
        return (
          <OuterManipulatorFace
            key={name}
            name={name}
            selectionDisabled={manipulatorIsMoving}
            columnid={nextColumn.id}
            selected={(manipulatorIsMoving ? localSelectedFaces : selectedFaces).find((face) => face.name === name)}
            position={pos}
            rotation={transformRotation(rotation)}
            height={height}
            selectionTexture={selectionTexture}
          />
        );
      });
    } else {
      return <></>;
    }
  }

  function changeMoveStatusHandler(isMoving) {
    dispatch(changeMovingStatus(isMoving));
  }

  const onFaceManipulation = (offset) => {
    let newOffset = Math.ceil(Math.abs(offset)) * (offset < 0 ? -1 : 1);
    if (manipulatorOffset !== newOffset) {
      setManipulatorOffset(newOffset);
    }
  };

  const onManipulationStart = () => {
    dispatch(duplicateStructure());
  };

  const onManipulationEnd = () => {
    dispatch(applyStructureChanges());
    setManipulatorOffset(0);
  };

  return (
    <group ref={group}>
      {elements &&
      allFloors.slice(0, floor).map((structure, index) =>
        [...buildColumns(elements, structure, index), ...buildCrossbars(elements, structure, index)])}
      {elements && <MultiselectParent
        onClick={(faceNames) => {
          dispatch(selectFace(faceNames[0]));
        }}
        onDropped={() => dispatch(dropSelection())}
      >
        {buildOuterFaces(selectedFaces, dispatch, selectionTexture)}
      </MultiselectParent>}
      {selectedFaces.length > 0 && <FacesManipulator
        scale={distance / 16}
        onChangeMoveStatus={changeMoveStatusHandler}
        position={manipulatorPosition}
        rotation={actualSide && manipulatorRotation}
        direction={actualSide && actualSide.direction}
        onDragStart={onManipulationStart}
        onDrag={onFaceManipulation}
        onDragEnd={onManipulationEnd}
      />}
    </group>
  );
};

function buildColumns(elements, structure, index) {
  return structure.columns.map((column) => {
    const pos = [
      unitSide * column.position[0],
      index * (unitHeight + crossbarSide),
      unitSide * column.position[1]
    ];
    const mesh = elements[column.element];
    return <mesh
      key={`column_${column.id}`}
      position={pos}
      geometry={mesh.geometry}
      material={mesh.material}
    />;
  });
}

const buildCrossbars = (elements, structure, index) => {
  return structure.crossbars1.map((cb) => {
    const { columns, columnType, direction, moveType, element } = cb;

    const baseColumn = getColumnById(columns[0], structure.columns);
    if(baseColumn) {
      const config = structure.transforms1[`${direction}_${moveType}_${columnType}`];
      const [x, z, y] = config.position;
      const pos = [
        unitSide * baseColumn.position[0] + x,
        unitHeight + (unitHeight + crossbarSide) * index + z,
        unitSide * baseColumn.position[1] + y,
      ];
      const mesh = elements[element];
      return <mesh
        key={`crossbar_${cb.id}`}
        position={pos}
        rotation={transformRotation(config.rotation)}
        geometry={mesh.geometry}
        material={mesh.material}
      />;
    } else {
      return <></>;
    }
  });
};

const assembleElements = (model) => {
  return model.scenes.reduce((acc, scene) => {
    const meshes = scene.children.reduce((acc, mesh) => {
      acc[mesh.name] = mesh;
      return acc;
    }, {});
    return { ...acc, ...meshes };
  }, {});
};

function splitByColumnType(columns, units) {
  return columns.map((column) => {
    const neighborsUnits = getIntersectionOfUnits(units, column.id);
    //const intersect = intersectionWith(structure.columns, neighbors, (columnPosition, neighborPosition) => isEqual(columnPosition.position, neighborPosition));
    return {
      ...column,
      type: getColumnTypeByUnits(neighborsUnits),
      units: neighborsUnits,
    };
  });
}

function getColumnTypeByUnits(neighborsUnits) {
  switch (neighborsUnits.length) {
    case 1:
      return ColumnTypes.ANGLE;
    case 2:
      return ColumnTypes.OUTER;
    case 3:
      return ColumnTypes.INNER_ANGLE;
    case 4:
      return ColumnTypes.INNER;
    default:
      return ColumnTypes.OUTSTANDING;
  }
}

function getIntersectionOfUnits(units, columnId) {
  const neigbours = [];
  units.forEach((unit) => {
    if (unit.columns.includes(columnId)) {
      neigbours.push(unit.id);
    }
  });
  return neigbours;
}

function calculateContour() {

}

export default Structure;