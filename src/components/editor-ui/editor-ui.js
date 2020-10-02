import React from 'react';
import styled from 'styled-components';
import FloorController from 'components/floor-controller';

const TopPanel = styled.div`
  position: absolute;
  height: 80px;
  padding-top: 20px;
  box-sizing: border-box;
  width: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
`;

const EditorUI = function() {
    return <TopPanel>
        <FloorController/>
    </TopPanel>
};

export default EditorUI;