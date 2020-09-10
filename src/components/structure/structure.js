import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useSelector, useDispatch, shallowEqual, batch } from 'react-redux';
import {
  CrossbarTypes,
  ConstructionSides,
  ColumnTypes,
  DirectionTypes,
  MoveTypes,
} from 'constants/model-variables.js';
import {selectFace, dropSelection} from 'actions/structure';
import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';
import OuterManipulatorFace from 'components/outer-manipulator-face';
import Сontour from 'utils/contour';
import {transformRotation} from 'utils/construction';
import {calculateManipulatorRotation, calculateManipulatorPosition} from 'utils/manipulator-position';
import FacesManipulator from 'components/faces-manipulator';
import {
  changeMovingStatus,
  updateContour
} from 'reducers/structure';
import {
  addToDragPool,
  clearDragPool,
} from 'reducers/camera';
import MultiselectParent from 'components/multiselect-parent'

const Structure = function(props) {
  const group = useRef();
  const [elements, setElements] = useState(null);
  const [selectionTexture, setTexture] = useState(null);

  const dispatch = useDispatch();
  const {
    selectedFaces,
    structure: allFloors,
    contour,
    floor,
    isEnriched,
    actualSide
  } = useSelector(state => state.structure, shallowEqual);
  const {distance, sceneIsMoving} = useSelector(state => state.camera, shallowEqual);
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
    const contour = new Сontour(structure.columns);
    dispatch(updateContour(contour.output));
  }, structure.columns);

  function buildOuterFaces() {
    if(isEnriched) {
      const height = unitHeight + crossbarSide;
      let zAngle = 0;
      return contour.map(({ column, meta }, index) => {
        let lastIndex = index - 1;
        if (index === 0) {
          lastIndex = contour.length - 1;
        }
        const lastColumn = contour[lastIndex].column;
        if (lastColumn.type === ColumnTypes.ANGLE) {
          zAngle += 90;
        } else if (lastColumn.type === ColumnTypes.INNER_ANGLE) {
          zAngle -= 90;
        }
        const pos = [unitSide * column.position[0], 0, unitSide * column.position[1]];
        const rotation = [0, zAngle, 0];
        const name = `outer_manipulator_face_${index}`;
        return (
          <OuterManipulatorFace
            key={name}
            name={name}
            columnid={column.id}
            selected={selectedFaces.find((face) => face.name === name)}
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
    batch(() => {
      dispatch(changeMovingStatus(isMoving));
      if (isMoving) {
        addToDragPool('faceManipulator');
      } else {
        clearDragPool();
      }
    });
  }


  splitByColumnType(structure);
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
        onDragStart={() => console.log()}
        onDrag={(distance) => console.log(distance)}
        onDragEnd={() => console.log()}
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

function splitByColumnType(structure) {
  return structure.columns.map((column) => {
    const neighborsUnits = getIntersectionOfUnits(structure.units, column.id);
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