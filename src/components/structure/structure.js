import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import structure from 'constants/data-format';
import {
  CrossbarTypes,
  ConstructionSides,
  ColumnTypes,
  DirectionTypes,
  MoveTypes
} from 'constants/model-variables.js';
import { unitSide, crossbarSide, unitHeight } from 'constants/construction-parameters.js';
import OuterManipulatorFace from 'components/outer-manipulator-face';
import Сontour from 'utils/contour';

const Structure = function() {
  const group = useRef();
  const [elements, setElements] = useState(null);

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

  splitByColumnType(structure.columns);

  return (
    <group ref={group}>
      {elements && buildColumns(elements)}
      {elements && buildCrossbars(elements)}
      {elements && buildOuterFaces()}
    </group>
  );
};

function buildOuterFaces() {
  const height = unitHeight + crossbarSide;
  const contour = new Сontour(structure.columns);
  let zAngle = 0;
  return contour.output.map(({column, meta}, index) => {
      let lastIndex = index - 1;
      if(index === 0) {
        lastIndex = contour.output.length - 1;
      }
      const lastColumn = contour.output[lastIndex].column;
        if (lastColumn.type === ColumnTypes.ANGLE) {
          zAngle += 90
        } else if (lastColumn.type === ColumnTypes.INNER_ANGLE) {
          zAngle -= 90
        }
      const pos = [unitSide * column.position[0], 0, unitSide * column.position[1]];
      const rotation = [0, zAngle, 0];
      return (
        <OuterManipulatorFace
          key={`outer_manipulator_face_${index}`}
          position={pos}
          rotation={rotation.map((deg) => THREE.Math.degToRad(deg))}
          height={height}
        />
        );
  });
}

function buildColumns(elements) {
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

function buildCrossbars(elements) {
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
      rotation={config.rotation.map((deg) => THREE.Math.degToRad(deg))}
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

function splitByColumnType(columns) {
  return columns.map((column) => {
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