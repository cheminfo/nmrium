/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Fragment, CSSProperties } from 'react';
import { FaEdit, FaRegTrashAlt, FaSearchPlus } from 'react-icons/fa';

import { SIGNAL_KINDS } from '../../../../data/constants/signalsKinds';
import { useDispatch } from '../../../context/DispatchContext';
import { useDialog } from '../../../elements/DialogManager';
import Select from '../../../elements/Select';
import { EditRangeModal } from '../../../modal/editRange/EditRangeModal';
import {
  OnHoverEvent,
  BaseRangeColumnProps,
  RowSpanTags,
} from '../RangesTableRow';
import useEditRangeModal from '../hooks/useEditRangeModal';

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

const selectBoxStyle: CSSProperties = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

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
    <Fragment>
      {showKind && (
        <td {...onHoverSignal}>
          {!row?.tableMetaInfo?.signal ? (
            ''
          ) : (
            <Select
              onChange={(kind) => changeRangeSignalKind(kind, row)}
              items={SIGNAL_KINDS}
              defaultValue={row?.tableMetaInfo?.signal?.kind}
              style={selectBoxStyle}
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
    </Fragment>
  );
}

export default ActionsColumn;
