import React from 'react';
import styled from 'styled-components';

const TopPanel = styled.div`
  position: relative;
`;

const FlowItem = function() {
    return <TopPanel>
        <FloorController/>
    </TopPanel>
};

export default FlowItem;