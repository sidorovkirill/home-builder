import React, { Children, useEffect, cloneElement, memo } from 'react';
import * as THREE from 'three';
import ReactDOM from 'react-dom';
import { useThree } from 'react-three-fiber';
import * as _ from 'lodash';

// Requirements for child:
// * target child elements should have the same prop "name" like a child
// * should realised "hover" props

var raycaster = new THREE.Raycaster();
let names = [];

const MultiselectParent = function(props) {
  const {onClick, onShedding} = props;

  useEffect(() => {
    names = Children.map(props.children, (component) => component.props.name);
  }, props.children);

  const { camera, gl: { domElement }, scene } = useThree();

  useEffect(() => {
    console.log(props);
    console.log(scene);
    domElement.addEventListener('mouseup', (event) => {
      raycaster.setFromCamera(getMouseCoords(event), camera);
      const intersects = raycaster.intersectObjects(scene.children,  true);
      const selectedNames = intersects.map((component) => component.object.name).filter((item) => item.length > 0);
      const targetIntersect = _.intersection(selectedNames, names);
      console.log(targetIntersect);
    });
  }, []);


  return props.children;
};

export default memo(MultiselectParent);

function getMouseCoords( event ) {
  const x = ( event.clientX / window.innerWidth ) * 2 - 1;
  const y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  return new THREE.Vector2(x, y);
}