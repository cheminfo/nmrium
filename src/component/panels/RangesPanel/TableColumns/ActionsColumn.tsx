/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FaEdit, FaRegTrashAlt, FaSearchPlus } from 'react-icons/fa';

import { SIGNAL_KINDS } from '../../../../data/constants/signalsKinds.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { useDialog } from '../../../elements/DialogManager.js';
import { Select2 } from '../../../elements/Select2.js';
import { EditRangeModal } from '../../../modal/editRange/EditRangeModal.js';
import {
  BaseRangeColumnProps,
  OnHoverEvent,
  RowSpanTags,
} from '../RangesTableRow.js';
import useEditRangeModal from '../hooks/useEditRangeModal.js';

const styles = css`
  width: 66px;
  padding: 0 !important;

  button {
    background-color: transparent;
    border: none;
    padding: 5px;
  }

  button:disabled {
    opacity: 0.6;
  }
`;

interface ActionsColumnProps
  extends Omit<BaseRangeColumnProps, 'format'>,
    RowSpanTags {
  onHoverSignal?: OnHoverEvent['onHover'];
  onHoverRange?: OnHoverEvent['onHover'];
  showKind: boolean;
  showDeleteAction: boolean;
  showEditAction: boolean;
  showZoomAction: boolean;
}

function ActionsColumn({
  row,
  onHoverSignal,
  rowSpanTags,
  showKind,
  showDeleteAction,
  showEditAction,
  showZoomAction,
}: ActionsColumnProps) {
  const { deleteRange, changeRangeSignalKind, zoomRange } = useEditRangeModal();
  const showActions = showDeleteAction || showEditAction || showZoomAction;
  const { openDialog } = useDialog();
  const dispatch = useDispatch();
  return (
    <>
      {showKind && (
        <td {...onHoverSignal}>
          {!row?.tableMetaInfo?.signal ? (
            ''
          ) : (
            <Select2
              onItemSelect={({ value }) => changeRangeSignalKind(value, row)}
              items={SIGNAL_KINDS}
              selectedItemValue={row?.tableMetaInfo?.signal?.kind}
              selectedButtonProps={{ minimal: true, small: true }}
              fill
            />
          )}
        </td>
      )}
      {showActions && (
        <td {...rowSpanTags} css={styles}>
          {showDeleteAction && (
            <button
              type="button"
              className="delete-button"
              onClick={() => deleteRange(row?.id)}
            >
              <FaRegTrashAlt />
            </button>
          )}
          {showZoomAction && (
            <button
              type="button"
              className="zoom-button"
              onClick={() => zoomRange(row)}
            >
              <FaSearchPlus title="Zoom to range in spectrum" />
            </button>
          )}
          {showEditAction && (
            <button
              type="button"
              className="edit-button"
              onClick={() => {
                dispatch({
                  type: 'SET_SELECTED_TOOL',
                  payload: {
                    selectedTool: 'zoom',
                  },
                });
                dispatch({
                  type: 'TOGGLE_RANGES_VIEW_PROPERTY',
                  payload: { key: 'showMultiplicityTrees', value: true },
                });

                zoomRange(row);
                openDialog(EditRangeModal, row.id);
              }}
            >
              <FaEdit color="blue" />
            </button>
          )}
        </td>
      )}
    </>
  );
}

export default ActionsColumn;
