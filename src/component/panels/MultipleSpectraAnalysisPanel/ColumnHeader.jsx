/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback } from 'react';

import { COLUMNS_TYPES } from '../../../data/data1d/MulitpleAnalysis';
import { useDispatch } from '../../context/DispatchContext';
import DeleteButton from '../../elements/Tab/DeleteButton';
import DropDownButton from '../../elements/dropDownButton/DropDownButton';
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

const columnsFilters = [
  { key: 'relative', label: 'Relative' },
  { key: 'absolute', label: 'Absolute' },
  { key: 'min', label: 'Min Intensity' },
  { key: 'max', label: 'Max Intensity' },
];

const ColumnHeader = ({ charLabel, rangeLabel, data, onColumnFilter }) => {
  const dispatch = useDispatch();

  const deleteHandler = useCallback(() => {
    dispatch({ type: DELETE_ANALYZE_SPECTRA_RANGE, colKey: charLabel });
  }, [charLabel, dispatch]);

  return (
    <div css={styles}>
      {data.type === COLUMNS_TYPES.NORMAL && (
        <DropDownButton
          data={columnsFilters}
          formatSelectedValue={(value) => (value ? value.substr(0, 3) : value)}
          selectedKey={data.valueKey}
          onSelect={onColumnFilter}
        />
      )}
      <DeleteButton onDelete={deleteHandler} />
      <span className="label"> {charLabel}</span>
      <span className="label">{rangeLabel}</span>
    </div>
  );
};

export default ColumnHeader;
