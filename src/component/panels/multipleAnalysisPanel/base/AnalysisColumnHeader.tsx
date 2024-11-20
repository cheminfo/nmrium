import {
  ANALYSIS_COLUMN_TYPES,
  ANALYSIS_COLUMN_VALUES_KEYS,
} from 'nmr-load-save';
import type { CSSProperties, MouseEvent } from 'react';

import { Select2 } from '../../../elements/Select2.js';
import DeleteButton from '../../../elements/Tab/DeleteButton.js';
import { useHighlight } from '../../../highlight/index.js';

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

const columnsFilters: Array<{ value: string; label: string }> = [
  { value: ANALYSIS_COLUMN_VALUES_KEYS.RELATIVE, label: 'Relative' },
  { value: ANALYSIS_COLUMN_VALUES_KEYS.ABSOLUTE, label: 'Absolute' },
  { value: ANALYSIS_COLUMN_VALUES_KEYS.MIN, label: 'Min Intensity' },
  { value: ANALYSIS_COLUMN_VALUES_KEYS.MAX, label: 'Max Intensity' },
];

interface AnalysisColumnHeaderProps {
  columnKey: string;
  rangeLabel: string;
  onColumnFilter: (value: string) => void;
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
        {data.type === ANALYSIS_COLUMN_TYPES.NORMAL && (
          <div
            style={styles.dropdownContainer}
            onClick={(event) => event.stopPropagation()}
          >
            <Select2
              getSelectedText={(item) => item.label.slice(0, 3)}
              items={columnsFilters}
              selectedItemValue={data.valueKey}
              onItemSelect={({ value }) => {
                onColumnFilter(value);
              }}
              selectedButtonProps={{ small: true, minimal: true }}
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
