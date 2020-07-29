import React, {useState, useRef, useEffect} from 'react';
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import structure from 'constants/data-format.js';
import {CrossbarTypes, CrossbarSides} from 'constants/model-variables.js';
import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';

export default function Structure() {
    const group = useRef();
    const [elements, setElements] = useState(null);

    structure.crossbars.forEach((crossbar, index) => {

    });

  useEffect(() => {
      const path = 'assets/models/elements.glb';
      var loader = new GLTFLoader();
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

    return (
        <group ref={group}>
            {elements && structure.columns.map((column) => {
                const pos = [unitSide * column.position[0], 0, unitSide * column.position[1]];
                const mesh = elements[column.element];
                return <mesh
                  key={`column_${column.id}`}
                  position={pos}
                  geometry={mesh.geometry}
                  material={mesh.material}
                />
            })}
            {elements && structure.crossbars.map((cb) => {
                const {columns, type, side, element} = cb;

                const baseColumn = structure.columns[columns[0]];
                const config = structure.transforms[`${type}_${side}`];
                const [x, z, y] = config.position;
                const pos = [
                    unitSide * baseColumn.position[0] + x,
                    unitHeight + z,
                    unitSide * baseColumn.position[1] + y
                ];
                const mesh = elements[element];
                return <mesh
                    key={`crossbar_${cb.id}`}
                    position={pos}
                    rotation={config.rotation.map(( deg ) => THREE.Math.degToRad(deg))}
                    geometry={mesh.geometry}
                    material={mesh.material}
                />
            })}
        </group>
    );
}

const assembleElements = (model) => {
    return model.scenes.reduce((acc, scene) => {
        const meshes = scene.children.reduce((acc, mesh) => {
            acc[mesh.name] = mesh;
            return acc;
        }, {});
        return {...acc, ...meshes};
    }, {});
};

const isToward = (type) => {
    return type.search('TOWARDS') !== -1;
};