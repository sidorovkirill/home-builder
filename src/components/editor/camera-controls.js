import React, {useRef, useEffect} from "react";
import {extend, useFrame, useThree} from "react-three-fiber";

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

const CameraControls = function(props) {
    const {
        camera,
        gl: { domElement }
    } = useThree();

    const controls = useRef();
    useFrame(state => controls.current.update());

    useEffect(() => {
        const {center} = props;
        controls.current.target.set(...center);
    }, []);

    return (
        <orbitControls
            ref={controls}
            args={[camera, domElement]}
        />
    );
};

export default CameraControls;