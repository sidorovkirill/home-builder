import * as THREE from 'three';
import React, { useRef, useLayoutEffect, useState } from 'react';
import { unitSide, crossbarSide, unitHeight } from 'constants/construction-parameters.js';

const OuterManipulatorFace = function(props) {
  const {
    id,
    name,
    position,
    rotation,
    height,
    onClick,
    selected,
    selectionTexture,
  } = props;
  const hoveredFace = useRef();
  const selectedFace = useRef();
  const xOffset = unitSide / 2;
  const zOffset = height / 2;
  const yOffset = -crossbarSide / 2 - 0.005;

  const [hover, setHover] = useState(false);

  useLayoutEffect(() => {
    hoveredFace.current.translate(xOffset, zOffset, yOffset);
    selectedFace.current.translate(xOffset, zOffset, yOffset);
  }, []);

  const onClickHandler = (event) => {
    if (onClick) {
      onClick(name, event);
    }
    event.stopPropagation();
  };

  const onHoverHandler = (event) => {
    setHover(!hover);
    event.stopPropagation();
  };

  const getOpacity = () => {
    if (hover) {
      return 0.5;
    } if(selected) {
      return 0;
    } else {
      return 0.2;
    }
  };

  return <group
    position={position}
    rotation={rotation}
  >
    <mesh
      name={name}
      visible
      onClick={onClickHandler}
      onPointerOver={onHoverHandler}
      onPointerOut={onHoverHandler}
    >
      <planeGeometry
        ref={hoveredFace}
        attach="geometry"
        args={[unitSide, height]}
      />
      <meshStandardMaterial
        attach="material"
        color={0xefa433}
        side={THREE.DoubleSide}
        transparent
        opacity={getOpacity()}
        roughness={1}
        metalness={0}
      />
    </mesh>
    <mesh visible={selected} >
      <planeGeometry
        ref={selectedFace}
        attach="geometry"
        args={[unitSide, height]}
      />
      <meshStandardMaterial
        attach="material"
        color={0xefa433}
        side={THREE.DoubleSide}
        map={selectionTexture}
        transparent
        opacity={0.7}
        roughness={1}
        metalness={0}
      />
    </mesh>
  </group>;
};

export default OuterManipulatorFace;