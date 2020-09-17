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
  getColumnByPosition
} from 'utils/construction';
import FacesManipulator from 'components/faces-manipulator';
import {
  changeMovingStatus,
  updateContour,
  duplicateStructure,
  applyStructureChanges,
  rejectStructureChanges,
  updateStructure
} from 'reducers/structure';
import MultiselectParent from 'components/multiselect-parent';

const Structure = function(props) {
  const group = useRef();
  const [elements, setElements] = useState(null);
  const [selectionTexture, setTexture] = useState(null);
  const [manipulatorOffset, setManipulatorOffset] = useState(0);
  const [newColumnsRaw, setNewColumnsRaw] = useState(null);
  const [localSelectedFaces, setLocalSelectedFaces] = useState([]);

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
    console.log('recalculate columns');
    const contour = new Сontour(structure.columns);
    let newSelection = null;
    if(selectedFaces.length > 0 && newColumnsRaw) {
      const newColumnIDs = newColumnsRaw.map((col) => col.id);
      const newColumns = contour.output.filter((contourCol) => newColumnIDs.includes(contourCol.column.id));
      newSelection = newColumns
        .filter(({meta}) => _.isEqual(meta, actualSide))
        .map(({column}) => ({name: `outer_manipulator_face_${column.id}`, columnid: column.id}));
      console.log(newSelection);
      setNewColumnsRaw(null);
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
    if(manipulatorOffset !== 0) {
      console.log(selectedFaces);
      console.log(actualSide);
      console.log(manipulatorOffset);
      const newUnitsCoordinates = selectedFaces.reduce((acc, face) => {
        const units = makeNewUnits(face);
        return [...acc, ...units];
      }, []);
      console.log(newUnitsCoordinates);

      const clone = _.cloneDeep(structureCopy);
      const clonedStructure = clone[floor - 1];

      const [columns, units, newColumns] = buildColumnsByUnits(
        newUnitsCoordinates,
        clonedStructure.units,
        clonedStructure.columns
      );
      setNewColumnsRaw(newColumns);
      console.log('newColumnsRaw', newColumnsRaw);
      clonedStructure.columns = splitByColumnType(columns, units);
      clonedStructure.units = units;

      console.log(clonedStructure);
      dispatch(updateStructure(clone));
    }
  }, [manipulatorOffset]);

  const buildColumnsByUnits = (newUnitsCoordinates, oldUnits, oldColumns) => {
    const columns = oldColumns;
    const newColumns = [];
    const units = oldUnits;
    newUnitsCoordinates.forEach((newUnitColumns) => {
      const columnsIDs = newUnitColumns.map((position) => {
        const column = getColumnByPosition(position, columns);
        if(!column) {
          const newColumn = createColumn(columns.length, position);
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

  const recalculateSelection = (newColumns) => {
    if(selectedFaces.length > 0) {
      newColumns.forEach((unit) => {

      });
    };
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

  const makeNewUnits = (face) => {
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
        const pos = [unitSide * column.position[0], 0, unitSide * column.position[1]];
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

  // splitByColumnType(structure);
  return (
    <group ref={group}>
      {elements && buildColumns(elements, structure)}
      {elements && buildCrossbars(elements, structure)}
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
        position={calculateManipulatorPosition(structure.columns, selectedFaces, actualSide)}
        rotation={actualSide && calculateManipulatorRotation(actualSide)}
        direction={actualSide && actualSide.direction}
        onDragStart={onManipulationStart}
        onDrag={onFaceManipulation}
        onDragEnd={onManipulationEnd}
      />}
    </group>
  );
};

function buildColumns(elements, structure) {
  return structure.columns.map((column) => {
    const pos = [unitSide * column.position[0], 0, unitSide * column.position[1]];
    const mesh = elements[column.element];
    return <mesh
      key={`column_${column.id}`}
      position={pos}
      geometry={mesh.geometry}
      material={mesh.material}
    />;
  });
}

function buildCrossbars(elements, structure) {
  return structure.crossbars.map((cb) => {
    const { columns, type, side, element } = cb;

    const baseColumn = structure.columns[columns[0]];
    const config = structure.transforms[`${type}_${side}`];
    const [x, z, y] = config.position;
    const pos = [
      unitSide * baseColumn.position[0] + x,
      unitHeight + z,
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
  });
}

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

export default Structure;