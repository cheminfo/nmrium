import { CSSProperties, MouseEvent } from 'react';

import {
  COLUMNS_TYPES,
  COLUMNS_VALUES_KEYS,
} from '../../../data/data1d/multipleSpectraAnalysis';
import DeleteButton from '../../elements/Tab/DeleteButton';
import DropDownButton from '../../elements/dropDownButton/DropDownButton';
import { useHighlight } from '../../highlight/index';

const styles: Record<
  | 'container'
  | 'deleteButton'
  | 'innerContainer'
  | 'dropdownContainer'
  | 'labelContainer'
  | 'label',
  CSSProperties
> = {
  container: {
    position: 'relative',
    padding: '0.15rem 0.4rem',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    margin: 0,
  },
  dropdownContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  labelContainer: {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    minHeight: '45px',
  },
  label: {
    textAlign: 'center',
  },
};

const columnsFilters: Array<{ key: string; label: string }> = [
  { key: COLUMNS_VALUES_KEYS.RELATIVE, label: 'Relative' },
  { key: COLUMNS_VALUES_KEYS.ABSOLUTE, label: 'Absolute' },
  { key: COLUMNS_VALUES_KEYS.MIN, label: 'Min Intensity' },
  { key: COLUMNS_VALUES_KEYS.MAX, label: 'Max Intensity' },
];

interface AnalysisColumnHeaderProps {
  columnKey: string;
  rangeLabel: string;
  onColumnFilter: (element: any) => void;
  data: {
    type: string;
    valueKey: string;
  };
  onDelete: () => void;
}

function AnalysisColumnHeader({
  columnKey,
  rangeLabel,
  data,
  onColumnFilter,
  onDelete,
}: AnalysisColumnHeaderProps) {
  const highlight = useHighlight([columnKey]);

  function deleteHandler(e: MouseEvent) {
    e.stopPropagation();
    onDelete();
  }
  return (
    <div
      style={{ ...styles.container, ...highlight.defaultActiveStyle }}
      {...highlight.onHover}
    >
      <div style={styles.innerContainer}>
        {data.type === COLUMNS_TYPES.NORMAL && (
          <div style={styles.dropdownContainer}>
            <DropDownButton
              data={columnsFilters}
              formatSelectedValue={(item) => item.label.slice(0, 3)}
              selectedKey={data.valueKey}
              onSelect={onColumnFilter}
            />
          </div>
        )}
        <div style={styles.labelContainer}>
          <span style={styles.label}> {columnKey}</span>
          <span style={styles.label}>{rangeLabel}</span>
        </div>
      </div>
      <DeleteButton onDelete={deleteHandler} style={styles.deleteButton} />
    </div>
  );
}

export default AnalysisColumnHeader;
