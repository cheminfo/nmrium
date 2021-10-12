import { css } from '@emotion/react';

export const tablePanelStyle = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
   
  .inner-container{
     height 100%;
     overflow: hidden; 
  }

  .table-container{
     overflow: auto;
     height: 100%;
     display: block;
     background-color: white;

  }

`;
