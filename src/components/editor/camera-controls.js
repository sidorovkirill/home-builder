import React, {useRef} from "react";
import {extend, useFrame, useThree} from "react-three-fiber";

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

export default function CameraControls() {
    const {
        camera,
        gl: { domElement }
    } = useThree();

    const controls = useRef();
    useFrame(state => controls.current.update());

    return (
        <orbitControls
            ref={controls}
            args={[camera, domElement]}
        />
    );
};