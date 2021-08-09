/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';

import {
  COLUMNS_TYPES,
  COLUMNS_VALUES_KEYS,
} from '../../../data/data1d/MultipleAnalysis';
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

  .container {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
  }

  .dropDown-container {
    justify-content: flex-start;
    align-items: flex-start;
  }

  .label-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-height: 45px;
  }

  .label {
    text-align: center;
  }

  ${styles}
`;

const columnsFilters: Array<{ key: string; label: string }> = [
  { key: COLUMNS_VALUES_KEYS.RELATIVE, label: 'Relative' },
  { key: COLUMNS_VALUES_KEYS.ABSOLUTE, label: 'Absolute' },
  { key: COLUMNS_VALUES_KEYS.MIN, label: 'Min Intensity' },
  { key: COLUMNS_VALUES_KEYS.MAX, label: 'Max Intensity' },
];

interface ColumnHeaderProps {
  charLabel: string;
  rangeLabel: string;
  onColumnFilter: (element: any) => void;
  data: {
    type: string;
    valueKey: string;
  };
}

function ColumnHeader({
  charLabel,
  rangeLabel,
  data,
  onColumnFilter,
}: ColumnHeaderProps) {
  const dispatch = useDispatch();

  const deleteHandler = useCallback(() => {
    dispatch({ type: DELETE_ANALYZE_SPECTRA_RANGE, colKey: charLabel });
  }, [charLabel, dispatch]);

  return (
    <div css={styles}>
      <div className="container">
        {data.type === COLUMNS_TYPES.NORMAL && (
          <div className="dropDown-container">
            <DropDownButton
              data={columnsFilters}
              formatSelectedValue={(value) =>
                value ? value.substr(0, 3) : value
              }
              selectedKey={data.valueKey}
              onSelect={onColumnFilter}
            />
          </div>
        )}
        <div className="label-container">
          <span className="label"> {charLabel}</span>
          <span className="label">{rangeLabel}</span>
        </div>
      </div>
      <DeleteButton onDelete={deleteHandler} />
    </div>
  );
}

export default ColumnHeader;
