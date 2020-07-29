import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import CameraControls from './camera-controls';
import EditorUI from 'components/editor-ui';
import Structure from 'components/structure';
import structure from 'constants/data-format.js';
import {CrossbarTypes, CrossbarSides} from 'constants/model-variables.js';
import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';
import centerOfMass from '@turf/center-of-mass';
import {polygon} from '@turf/helpers';

const rotationCenter = calculateCenterOfMass();

export default function Editor() {

    return (
        <div>
            <Canvas
                gl={{ antialias: false, alpha: false }}
                camera={{
                    position: [0, 0, 15],
                    near: 0.1, far: 200000,
                    aspect: window.innerWidth / window.innerHeight,
                    fov: 75
                }}
                onCreated={setUpCanvas}
            >
                <CameraControls center={rotationCenter}/>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={<Loading />}>
                    <Structure />
                </Suspense>
            </Canvas>
            <EditorUI/>
        </div>
    )
}

const setUpCanvas  = ({gl, camera}) => {
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
  let outerColumns = findOuterColumns();
  let queue = createColumnsQueue(outerColumns);

  let outerCoordinates = queue.map((colId) => structure.columns.find((column) => column.id === colId).position);

  const [x, y] = get2DCenterOfMass(outerCoordinates);

  return [x * unitSide, unitHeight, y * unitSide];
}

function findOuterColumns() {
  return structure.crossbars
    .filter((crossbar) => crossbar.type === CrossbarTypes.AGAINST_OUTER || crossbar.type === CrossbarTypes.TOWARDS_OUTER)
    .map((crossbar) => crossbar.columns);
}

function createColumnsQueue(outerColumns) {
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
  return [...queue, queue[0]];
}

function get2DCenterOfMass(outerCoordinates) {
  const pol = polygon([outerCoordinates]);
  return centerOfMass(pol).geometry.coordinates;
}
