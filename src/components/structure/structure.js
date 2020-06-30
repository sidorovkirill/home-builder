import React, {useState, useRef, useEffect} from 'react';
import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {useLoader} from 'react-three-fiber'

const unitSide = 3.775;
const crossbarSide = 0.28;
const unitHeight= 3.09;

const CrossbarTypes = {
    TOWARDS_OUTER: 'TOWARDS_OUTER',
    TOWARDS_INNER: 'TOWARDS_INNER',
    AGAINST_OUTER: 'AGAINST_OUTER',
    AGAINST_INNER: 'AGAINST_INNER',
};

const CrossbarSides = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};

export default function Structure() {
    const group = useRef();
    const [elements, setElements] = useState(null);
    const structure = {
        columns: [
            {id: 0, position: [0,0], element: "K"},
            {id: 1, position: [1,0], element: "K"},
            {id: 2, position: [2,0], element: "K"},
            {id: 3, position: [0,1], element: "K"},
            {id: 4, position: [1,1], element: "K"},
            {id: 5, position: [2,1], element: "K"},
            {id: 6, position: [3,1], element: "K"},
            {id: 7, position: [0,2], element: "K"},
            {id: 8, position: [1,2], element: "K"},
            {id: 9, position: [2,2], element: "K"},
            {id: 10, position: [3,2], element: "K"},
            {id: 11, position: [0,3], element: "K"},
            {id: 12, position: [1,3], element: "K"},
            {id: 13, position: [2,3], element: "K"},
            {id: 14, position: [3,3], element: "K"},
        ],
        crossbars: [
            {
                id: 0,
                columns: [0, 3],
                type: CrossbarTypes.TOWARDS_OUTER,
                side: CrossbarSides.LEFT,
                element: 'R6'
            },
            {
                id: 1,
                columns: [3, 7],
                type: CrossbarTypes.TOWARDS_OUTER,
                side: CrossbarSides.LEFT,
                element: 'R6'
            },
            {
                id: 2,
                columns: [7, 11],
                type: CrossbarTypes.TOWARDS_OUTER,
                side: CrossbarSides.LEFT,
                element: 'R6'
            },
            {
                id: 3,
                columns: [0, 1],
                type: CrossbarTypes.AGAINST_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R5'
            },
            {
                id: 4,
                columns: [1, 2],
                type: CrossbarTypes.AGAINST_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R5'
            },
            {
                id: 5,
                columns: [3, 4],
                type: CrossbarTypes.AGAINST_INNER,
                side: CrossbarSides.RIGHT,
                element: 'R9'
            },
            {
                id: 6,
                columns: [4, 5],
                type: CrossbarTypes.AGAINST_INNER,
                side: CrossbarSides.RIGHT,
                element: 'R9'
            },
            {
                id: 7,
                columns: [5, 6],
                type: CrossbarTypes.AGAINST_INNER,
                side: CrossbarSides.RIGHT,
                element: 'R7'
            },
            {
                id: 8,
                columns: [7, 8],
                type: CrossbarTypes.AGAINST_INNER,
                side: CrossbarSides.RIGHT,
                element: 'R9'
            },
            {
                id: 9,
                columns: [8, 9],
                type: CrossbarTypes.AGAINST_INNER,
                side: CrossbarSides.RIGHT,
                element: 'R9'
            },
            {
                id: 10,
                columns: [9, 10],
                type: CrossbarTypes.AGAINST_INNER,
                side: CrossbarSides.RIGHT,
                element: 'R9'
            },
            {
                id: 11,
                columns: [4, 8],
                type: CrossbarTypes.TOWARDS_INNER,
                side: CrossbarSides.LEFT,
                element: 'R8'
            },
            {
                id: 12,
                columns: [8, 12],
                type: CrossbarTypes.TOWARDS_INNER,
                side: CrossbarSides.LEFT,
                element: 'R8'
            },
            {
                id: 13,
                columns: [1, 4],
                type: CrossbarTypes.TOWARDS_INNER,
                side: CrossbarSides.LEFT,
                element: 'R8'
            },
            {
                id: 14,
                columns: [5, 9],
                type: CrossbarTypes.TOWARDS_INNER,
                side: CrossbarSides.LEFT,
                element: 'R8'
            },
            {
                id: 15,
                columns: [9, 13],
                type: CrossbarTypes.TOWARDS_INNER,
                side: CrossbarSides.LEFT,
                element: 'R8'
            },
            {
                id: 16,
                columns: [2, 5],
                type: CrossbarTypes.TOWARDS_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R6'
            },
            {
                id: 17,
                columns: [6, 10],
                type: CrossbarTypes.TOWARDS_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R6'
            },
            {
                id: 18,
                columns: [10, 14],
                type: CrossbarTypes.TOWARDS_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R6'
            },
            {
                id: 19,
                columns: [11, 12],
                type: CrossbarTypes.AGAINST_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R5'
            },
            {
                id: 20,
                columns: [12, 13],
                type: CrossbarTypes.AGAINST_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R5'
            },
            {
                id: 21,
                columns: [13, 14],
                type: CrossbarTypes.AGAINST_OUTER,
                side: CrossbarSides.RIGHT,
                element: 'R5'
            },
        ],
        transforms: {
            [`${CrossbarTypes.TOWARDS_OUTER}_${CrossbarSides.LEFT}`]: {
                position: [0, crossbarSide/2, unitSide/2],
                rotation: [0, 0, 0]
            },
            [`${CrossbarTypes.TOWARDS_OUTER}_${CrossbarSides.RIGHT}`]: {
                position: [0, crossbarSide/2, unitSide/2],
                rotation: [0, 0, 180]
            },
            [`${CrossbarTypes.TOWARDS_INNER}_${CrossbarSides.LEFT}`]: {
                position: [0, crossbarSide/2, unitSide/2],
                rotation: [0, 0, 0]
            },
            [`${CrossbarTypes.AGAINST_OUTER}_${CrossbarSides.RIGHT}`]: {
                position: [unitSide/2, crossbarSide/2, 0],
                rotation: [0, 90, 0]
            },
            [`${CrossbarTypes.AGAINST_INNER}_${CrossbarSides.RIGHT}`]: {
                position: [unitSide/2, crossbarSide/2, 0],
                rotation: [0, 90, 0]
            },
        }
    };

    structure.crossbars.forEach((crossbar, index) => {

    });

    if (!elements) {
        const model = useLoader(GLTFLoader, "assets/models/elements.glb");
        setElements(assembleElements(model));
    }

    return (
        <group ref={group}>
            {elements && structure.columns.map((column) => {
                const pos = [unitSide * column.position[0], 0, unitSide * column.position[1]];
                const mesh = elements[column.element];
                return <mesh position={pos} geometry={mesh.geometry} material={mesh.material}/>
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
        console.log('meshes', meshes);
        return {...acc, ...meshes};
    }, {});
};

const isToward = (type) => {
    return type.search('TOWARDS') !== -1;
};