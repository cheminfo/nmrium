/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Fragment, CSSProperties } from 'react';
import { FaRegTrashAlt, FaSearchPlus, FaEdit } from 'react-icons/fa';

import { SIGNAL_KINDS } from '../../../../data/constants/signalsKinds';
import Select from '../../../elements/Select';
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
  const { editRange, deleteRange, changeRangeSignalKind, zoomRange } =
    useEditRangeModal(row);
  const showActions = showDeleteAction || showEditAction || showZoomAction;

  return (
    <Fragment>
      {showKind && (
        <td {...onHoverSignal}>
          {!row?.tableMetaInfo?.signal ? (
            ''
          ) : (
            <Select
              onChange={changeRangeSignalKind}
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
              onClick={() => deleteRange()}
            >
              <FaRegTrashAlt />
            </button>
          )}
          {showZoomAction && (
            <button
              type="button"
              className="zoom-button"
              onClick={() => zoomRange()}
            >
              <FaSearchPlus title="Zoom to range in spectrum" />
            </button>
          )}
          {showEditAction && (
            <button
              type="button"
              className="edit-button"
              onClick={() => editRange()}
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
