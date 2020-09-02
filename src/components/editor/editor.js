import React, { useState, useRef, Suspense, useEffect } from 'react';
import {
  ReactReduxContext,
  Provider,
  useSelector,
  shallowEqual,
  useDispatch,
  useStore,
} from 'react-redux';
import * as THREE from 'three';
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import CameraControls from './camera-controls';
import EditorUI from 'components/editor-ui';
import Structure from 'components/structure';
import structure from 'constants/data-format.js';
import { CrossbarTypes, ConstructionSides } from 'constants/model-variables.js';
import { unitSide, crossbarSide, unitHeight } from 'constants/construction-parameters.js';
import centerOfMass from '@turf/center-of-mass';
import { polygon } from '@turf/helpers';
import Сontour from 'utils/contour';


const rotationCenter = calculateCenterOfMass();

export default function Editor() {

  const dispatch = useDispatch();
  const store = useStore();
  const manipulatorIsMoving = useSelector(state => state.structure.manipulatorIsMoving, shallowEqual);

  const setUpCanvas = (params) => {
    console.log(params);
    const { gl, camera, raycaster, events, scene } = params;
    gl.setSize(window.innerWidth, window.innerHeight);
    // gl.domElement.addEventListener('mouseup', (event) => {
    //   setTimeout(() => {
    //     console.log('mouseup', event);
    //     console.log(store);
    //     dispatch({ type: 'globalPointerUp', payload: store.getState() });
    //   }, 0);
    //
    //   console.log(camera);
    //   raycaster.setFromCamera( getMouseCoords(event), camera);
    //   const intersects = raycaster.intersectObjects( scene.children[2].children, true);
    //   console.log(intersects);
    // });
    gl.domElement.addEventListener('mouseleave', (event) => {
      setTimeout(() => {
        dispatch({ type: 'globalPointerUp', payload: store.getState() });
      }, 0);
    });
  };

  return (
    <div>
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <Canvas
            gl={{ antialias: false, alpha: false }}
            camera={{
              position: [15, 10, 15],
              near: 0.1, far: 200000,
              aspect: window.innerWidth / window.innerHeight,
              fov: 75,
            }}
            raycaster={{ linePrecision: 5 }}
            onCreated={setUpCanvas}
          >
            <Provider store={store}>
              <CameraControls
                center={rotationCenter}
                disabled={manipulatorIsMoving}
              />
              <ambientLight/>
              <pointLight position={[0, 10, 0]}/>
              <Suspense fallback={<Loading/>}>
                <Structure/>
              </Suspense>
            </Provider>
          </Canvas>
        )}
      </ReactReduxContext.Consumer>
      <EditorUI/>
    </div>
  );
}

function Loading() {
  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <sphereGeometry attach="geometry" args={[1, 16, 16]}/>
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
  let outerCoordinates = contour.output.map(({ column, meta }, index) => column.position);

  outerCoordinates = [...outerCoordinates, outerCoordinates[0]];

  const [x, y] = get2DCenterOfMass(outerCoordinates);

  return [x * unitSide, unitHeight, y * unitSide];
}

function get2DCenterOfMass(outerCoordinates) {
  const pol = polygon([outerCoordinates]);
  return centerOfMass(pol).geometry.coordinates;
}
