import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { extend, useThree } from 'react-three-fiber';
import { DragControls } from './drag-controls';
import { DirectionTypes } from 'constants/model-variables.js';

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
    position,
    rotation,
    onDragStart,
    onDrag,
    onDragEnd
  } = props;
  const [x, y, z] = position;
  const face = useRef();
  const line = useRef();
  const [hover, setHover] = useState(false);
  const [isMoved, setMoveStatus] = useState(false);
  const {
    camera,
    gl: { domElement }
  } = useThree();
  const group = useRef();

  const onHoverHandler = (event) => {
    setHover(!hover);
    event.stopPropagation();
  };

  const changeMoveStatus = (isMoved) => {
    setMoveStatus(isMoved);
    onChangeMoveStatus(isMoved);
  };

  useEffect(() => {
    const dragControls = new DragControls([group.current], camera, domElement);
    dragControls.transformGroup = true;
    dragControls.enabled = true;

    const onDragStartHandler = (event) => {
      changeMoveStatus(true, event);
      onDragStart(event);
    };

    const onDragHandler = (event) => {
      const {z: actualY, x: actualX} = event.object.position;
      console.log(x, y);
      if(direction === DirectionTypes.TOWARD) {
        event.object.position.x = x;
        event.object.position.z = actualY;
      } else {
        event.object.position.x = actualX;
        event.object.position.z = y;
      }
      event.object.position.y = z;

      onDrag(calculateDistance(event.object.position), event);
    };

    const onDragEndHandler = (event) => {
      event.object.position.x = x;
      event.object.position.z = y;
      event.object.position.y = z;
      setTimeout(() => {
        changeMoveStatus(false, event);
      }, 0);
      onDragEnd(event);
    };

    dragControls.addEventListener( 'dragstart', onDragStartHandler);
    dragControls.addEventListener( 'drag', onDragHandler);
    dragControls.addEventListener( 'dragend', onDragEndHandler);

    return () => {
      dragControls.removeEventListener( 'dragstart', onDragStartHandler);
      dragControls.removeEventListener( 'drag', onDragHandler);
      dragControls.removeEventListener( 'dragend', onDragEndHandler);
    }
  }, [x, y, z, direction]);

  const calculateDistance = (newPosition) => {
    const {x: nx, y: nz, z: ny} = newPosition;

    if(direction === DirectionTypes.TOWARD) {
      return y - ny;
    } else {
      return x - nx;
    }
  };

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

  const defineOpacity = (isMoved, hover) => {
    if(isMoved) {
      return 0;
    } else {
      return hover ? 0.8 : 0.5
    }
  };

  const createMaterial = () => {
    return <meshStandardMaterial
      attach="material"
      color={0xE71322}
      side={THREE.DoubleSide}
      transparent
      opacity={defineOpacity(isMoved, hover)}
      roughness={1}
      metalness={0}
    />
  };

  return <group
    ref={group}
    position={[x, z, y]}
    rotation={[0, THREE.Math.degToRad(rotation), 0]}
    scale={new THREE.Vector3(scale, scale, scale)}
    onPointerOver={onHoverHandler}
    onPointerOut={onHoverHandler}
  >
    {renderFace()}
    {renderArrowLine()}
    {renderArrowHead()}
  </group>;
};

export default FacesManipulator;