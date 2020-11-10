/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import DeleteButton from '../../elements/Tab/DeleteButton';
import { DELETE_ANALYZE_SPECTRA_RANGE } from '../../reducer/types/Types';

const styles = (styles) => css`
  position: relative;

  .delete {
    position: absolute;
    right: 0px;
    top: 0px;
  }
  .label {
    text-align: center;
    display: block;
  }

  ${styles}
`;

const ColumnHeader = ({ charLabel, rangeLabel }) => {
  const dispatch = useDispatch();

  const deleteHandler = useCallback(() => {
    dispatch({ type: DELETE_ANALYZE_SPECTRA_RANGE, colKey: charLabel });
  }, [charLabel, dispatch]);

  return (
    <div css={styles}>
      <DeleteButton onDelete={deleteHandler} />
      <span className="label"> {charLabel}</span>
      <span className="label">{rangeLabel}</span>
    </div>
  );
};

export default ColumnHeader;
