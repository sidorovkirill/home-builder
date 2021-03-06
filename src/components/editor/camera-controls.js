import React, {useRef, useEffect} from "react";
import {extend, useFrame, useThree} from "react-three-fiber";
import {OrbitControls} from "utils/orbit-controls";
import {getDistance, convertCoordinates} from 'utils/math';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
    changeDistance,
    changeMovingStatus
} from 'reducers/camera';

extend({ OrbitControls });

let distance = 0;

const CameraControls = function(props) {
    const {center, disabled} = props;
    const {
        camera,
        gl: { domElement }
    } = useThree();

    const dispatch = useDispatch();
    const lastDistance = useSelector(state => state.camera.distance, shallowEqual);
    const controls = useRef();

    useFrame(state => {
        const dist = parseFloat(distance.toFixed(3));
        if(dist !== lastDistance) {
            dispatch(changeDistance(dist));
        }
        controls.current.update();
    });

    useEffect(() => {
        controls.current.target.set(...center);
        controls.current.addEventListener('change', (event) => {
            const actualPos = convertCoordinates(event.target.object.position);
            const actualCenter = convertCoordinates(event.target.target);
            distance = getDistance(actualCenter, actualPos);
        }, false);
        controls.current.addEventListener('start', (event) => {
            console.log("--start move--");
            dispatch(changeMovingStatus(true));
        }, false);
        controls.current.addEventListener('wheel', (event) => {
            console.log("scroll");
        }, false);
        controls.current.addEventListener('end', (event) => {
            setTimeout(() => {
                console.log("--end move--");
                dispatch(changeMovingStatus(false));
            }, 0);
        }, false);
    }, []);

    useEffect(() => {
        console.log(controls);
        if(disabled) {
            controls.current.dispose();
        } else {
            controls.current.activate();
        }
    }, [disabled]);

    return (
        <orbitControls
            ref={controls}
            args={[camera, domElement]}
            maxPolarAngle={Math.PI / 2}
            enabled={!disabled}
        />
    );
};

export default CameraControls;