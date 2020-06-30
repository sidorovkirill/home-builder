import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import CameraControls from './camera-controls';
import EditorUI from 'components/editor-ui';
import Structure from 'components/structure';

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
                <CameraControls />
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

const setUpCanvas  = ({gl}) => {
    gl.setSize(window.innerWidth, window.innerHeight);
};

function Box(props) {
    // This reference will give us direct access to the mesh
    const mesh = useRef();

    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
            onClick={(e) => setActive(!active)}
            onPointerOver={(e) => setHover(true)}
            onPointerOut={(e) => setHover(false)}>
            <boxBufferGeometry attach="geometry" args={[10, 10, 10]} />
            <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    )
}

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
