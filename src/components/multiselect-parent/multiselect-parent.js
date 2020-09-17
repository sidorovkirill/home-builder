import React, { Children, useEffect, cloneElement, memo } from 'react';
import * as THREE from 'three';
import { useThree } from 'react-three-fiber';
import * as _ from 'lodash';

// Requirements for child:
// * target child elements should have the same prop "name" like a child
// * should realised "hover" props

var raycaster = new THREE.Raycaster();
let names = [];

const MultiselectParent = function(props) {
  const {onClick, onDropped} = props;
  const { camera, gl: { domElement }, scene } = useThree();

  useEffect(() => {
    names = Children.map(props.children, (component) => ({
      name: component.props.name,
      columnid: component.props.columnid
    }));
  }, [props.children]);

  useEffect(() => {
    domElement.addEventListener('click', clickHandler);
    //return domElement.removeEventListener('click', clickHandler);
  }, []);

  const clickHandler = (event) => {
    raycaster.setFromCamera(getMouseCoords(event), camera);
    const intersects = raycaster.intersectObjects(scene.children,  true);
    const selectedNames = intersects.map((component) => component.object.name).filter((item) => item.length > 0);
    const targetIntersect = intersectionInOrder(selectedNames, names);
    if(targetIntersect.length > 0) {
      onClick(targetIntersect);
    } else {
      onDropped();
    }
  };

  return props.children;
};

export default memo(MultiselectParent);

function getMouseCoords( event ) {
  const x = ( event.clientX / window.innerWidth ) * 2 - 1;
  const y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  return new THREE.Vector2(x, y);
}

function intersectionInOrder(intersects, names) {
  return intersects.map((intersectionName) => names.find((item) => item.name === intersectionName));
}