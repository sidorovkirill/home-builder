import * as THREE from 'three';
import React, { useRef, useLayoutEffect, useState } from 'react';
import {unitSide, crossbarSide, unitHeight} from 'constants/construction-parameters.js';

const OuterManipulatorFace =  function(props) {
  const {position, rotation, height} = props;
  const geometry = useRef();
  const xOffset = unitSide / 2;
  const zOffset = height / 2;
  const yOffset = - crossbarSide / 2 - 0.005;

  const [hover, setHover] = useState(false);

  useLayoutEffect(() => {
    geometry.current.translate(xOffset, zOffset, yOffset);
  }, []);

  return <mesh
    visible position={position}
    rotation={rotation}
    onClick={e => console.log('click')}
    onWheel={e => console.log('wheel spins')}
    onPointerUp={e => console.log('up')}
    onPointerDown={e => console.log('down')}
    onPointerOver={e => {
      setHover(true);
      console.log(e);
      e.stopPropagation()
    }}
    onPointerOut={e => {
      setHover(false);
      console.log(e);
      e.stopPropagation()
    }}
    onPointerMove={e => console.log('move')}
    onUpdate={self => console.log('props have been updated')}
  >
    <planeGeometry
      ref={geometry}
      attach="geometry"
      args={[unitSide, height]}
    />
    <meshStandardMaterial
      attach="material"
      color={hover ? 0x121212 : 0xefa433}
      side={THREE.DoubleSide}
      transparent
      opacity={0.5}
      roughness={1}
      metalness={0}
    />
  </mesh>
};

export default OuterManipulatorFace;