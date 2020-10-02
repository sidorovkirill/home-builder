import React from 'react';
import styled from "styled-components";
import {
    shallowEqual,
    useDispatch,
    useSelector,
    batch
} from 'react-redux';
import {
    addFloor as addFloorAction,
    choseFloor as choseFloorAction
} from 'reducers/structure';

const height = "60";
const itemWeight = "40";

const Container = styled.div`
  position: relative;
  height: ${height}px;
  width: auto;
  pointer-events: all;
  background-color: gainsboro;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  border-radius: 10px;
  overflow: hidden;
  user-select: none;
`;

const Title = styled.div`
  line-height: ${height}px;
  padding: 0 20px 0 20px;
`;

const PlusButton = styled.button`
  line-height: ${height}px;
  width: ${itemWeight}px;
  height: 100%;
  border: none;
  background-color: gainsboro;
  font-size: 18px;
  
  &:hover {
    background-color: darkgray;
  }
  
  &:active {
    background-color: gainsboro;
  }
`;

const Item = styled.button.attrs(props => ({
    active: props.active || false,
}))`
  width: ${itemWeight}px;
  line-height: ${height}px;
  height: 100%;
  border: none;
  background-color: ${props => props.active ? 'darkgray' : 'gainsboro'};
  
  &:hover {
    background-color: darkgray;
  }
  
  &:active {
    background-color: gainsboro;
  }
`;


const FloorController = function() {
    const dispatch = useDispatch();
    const {
        structure: allFloors,
        floor
    } = useSelector(state => state.structure, shallowEqual);

    const addFloor = () => {
        console.log(addFloorAction());
        dispatch(addFloorAction());
        // batch(() => {
        //     dispatch(addFloorAction());
        //     dispatch(choseFloorAction(floor + 1));
        // });
    };

    const choseFloor = (index) => {
        dispatch(choseFloorAction(index));
    };

    return <Container>
        <Title>Floor</Title>
        {allFloors.map((item, index) =>
          <Item
            active={index === floor - 1}
            onClick={() => choseFloor(index + 1)}
          >
              {index + 1}
          </Item>)}
        <PlusButton onClick={addFloor}>+</PlusButton>
    </Container>
};

export default FloorController;