import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { extend, useThree } from 'react-three-fiber';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

const faceSize = 1.5;
const arrowLength = 1.5;

const coneParameters = {
  height: 1,
  radius: 0.1,
  radialSegments: 32
};

const lineParameters = {
  radius: 0.02,
  height: arrowLength,
  radialSegments: 20
};

const FacesManipulator = function (props) {
  const {
    scale,
    direction,
    onChangeMoveStatus,
    position
  } = props;
  const face = useRef();
  const line = useRef();
  const [hover, setHover] = useState(false);
  const {
    camera,
    gl: { domElement }
  } = useThree();
  const group = useRef();

  const onHoverHandler = (event) => {
    setHover(!hover);
    event.stopPropagation();
  };

  const changeMoveStatus = (isMoved, event) => {
    onChangeMoveStatus(isMoved);
    event.stopPropagation();
  };

  useEffect(() => {
    const dragControls = new DragControls([group.current], camera, domElement);
    dragControls.transformGroup = true;
    dragControls.enabled = true;
    dragControls.addEventListener( 'dragstart', function ( event ) {
      console.log('dragstart', event);
    } );
    dragControls.addEventListener( 'drag', function ( event ) {
      console.log('drag', event.object.position);
      event.object.position.y = 0;
      event.object.position.x = 0;
    } );
    dragControls.addEventListener( 'dragend', function ( event ) {
      console.log('dragend', event);
    } );
  }, []);

  const renderFace = () => {
    return <mesh
      visible
    >
      <planeGeometry
        ref={face}
        attach="geometry"
        args={[faceSize, faceSize]}
      />
      {createMaterial()}
    </mesh>
  };

  const renderArrowLine = () => {
    const {radius, height, radialSegments} = lineParameters;
    const {radius: arrrowHeadRadius} = coneParameters;

    return <>
      <mesh
        rotation={[THREE.Math.degToRad(-90), 0, 0]}
        position={[0, 0, -height / 2]}
        attach="geometry"
        ref={line}
      >
        <cylinderBufferGeometry
          attach="geometry"
          args={[radius, radius, height, radialSegments]}/>
        {createMaterial()}
      </mesh>
      <mesh
        rotation={[THREE.Math.degToRad(-90), 0, 0]}
        position={[0, 0, -height / 2]}
        attach="geometry"
        ref={line}
      >
        <cylinderBufferGeometry
          attach="geometry"
          args={[arrrowHeadRadius, arrrowHeadRadius, height, radialSegments]}/>
        <meshStandardMaterial
          attach="material"
          color={0xE71322}
          side={THREE.DoubleSide}
          transparent
          opacity={0}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </>
  };

  const renderArrowHead = () => {
    const {radius, height, radialSegments} = coneParameters;
    return <mesh
      rotation={[THREE.Math.degToRad(-90), 0, 0]}
      position={[0, 0, -(arrowLength + height/2)]}
      visible
    >
      <coneBufferGeometry
        attach="geometry"
        args={[radius, height, radialSegments]}/>
      {createMaterial()}
    </mesh>
  };

  const createMaterial = () => {
    return <meshStandardMaterial
      attach="material"
      color={0xE71322}
      side={THREE.DoubleSide}
      transparent
      opacity={hover ? 0.8 : 0.5}
      roughness={1}
      metalness={0}
    />
  };

  const [x, y, z] = position;
  console.log(position);

  return <group
    ref={group}
    position={[x, z, y]}
    scale={new THREE.Vector3(scale, scale, scale)}
    onPointerUp={(event) => changeMoveStatus(false, event)}
    onPointerDown={(event) => changeMoveStatus(true, event)}
    onPointerOver={onHoverHandler}
    onPointerOut={onHoverHandler}
  >
    {renderFace()}
    {renderArrowLine()}
    {renderArrowHead()}
  </group>;
};

export default FacesManipulator;