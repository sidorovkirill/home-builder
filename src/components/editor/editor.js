import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import CameraControls from './camera-controls';
import EditorUI from 'components/editor-ui';
import Structure from 'components/structure';
import structure from 'constants/data-format.js';
import {CrossbarTypes, ConstructionSides} from 'constants/model-variables.js';
import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';
import centerOfMass from '@turf/center-of-mass';
import {polygon} from '@turf/helpers';
import Сontour from 'utils/contour';


const rotationCenter = calculateCenterOfMass();

export default function Editor() {

    return (
        <div>
            <Canvas
                gl={{ antialias: false, alpha: false }}
                camera={{
                    position: [15, 10, 15],
                    near: 0.1, far: 200000,
                    aspect: window.innerWidth / window.innerHeight,
                    fov: 75
                }}
                raycaster={{ linePrecision: 5 }}
                onCreated={setUpCanvas}
            >
                <CameraControls center={rotationCenter}/>
                <ambientLight />
                <pointLight position={[0, 10, 0]} />
                <Suspense fallback={<Loading />}>
                    <Structure />
                </Suspense>
            </Canvas>
            <EditorUI/>
        </div>
    )
}

const setUpCanvas  = (params) => {
    const {gl, camera, raycaster} = params;
    gl.setSize(window.innerWidth, window.innerHeight);
    camera.lookAt(rotationCenter);
};

function Loading() {
    return (
        <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <sphereGeometry attach="geometry" args={[1, 16, 16]} />
            <meshStandardMaterial
                attach="material"
                color="white"
                transparent
                opacity={0.6}
                roughness={1}
                metalness={0}
            />
        </mesh>
    );
}

function calculateCenterOfMass() {
  const contour = new Сontour(structure.columns);
  console.log(contour);
  let outerCoordinates = contour.output.map(({column, meta}, index) => column.position);

  outerCoordinates = [...outerCoordinates, outerCoordinates[0]];

  const [x, y] = get2DCenterOfMass(outerCoordinates);

  return [x * unitSide, unitHeight, y * unitSide];
}

function get2DCenterOfMass(outerCoordinates) {
  const pol = polygon([outerCoordinates]);
  return centerOfMass(pol).geometry.coordinates;
}
