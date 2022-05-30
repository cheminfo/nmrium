/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Fragment, CSSProperties } from 'react';
import { FaRegTrashAlt, FaSearchPlus, FaEdit } from 'react-icons/fa';

import { SignalKinds } from '../../../../data/constants/SignalsKinds';
import Select from '../../../elements/Select';
import useEditRangeModal from '../hooks/useEditRangeModal';
import { RangeData } from '../hooks/useMapRanges';

const styles = css`
  width: 66px;
  padding: 0 !important;
  button {import useEditRangeModal from './../../../hooks/useEditRangeModal';

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

interface ActionsColumnProps {
  rowData: RangeData;
  rowSpanTags: {
    rowSpan: any;
    style: CSSProperties;
  };
  onHoverSignal?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  onHoverRange?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

function ActionsColumn({
  rowData,
  onHoverSignal,
  rowSpanTags,
}: ActionsColumnProps) {
  const { editRange, deleteRange, changeRangeSignalKind, zoomRange } =
    useEditRangeModal(rowData);

  return (
    <Fragment>
      <td {...onHoverSignal}>
        <Select
          onChange={changeRangeSignalKind}
          data={SignalKinds}
          defaultValue={rowData.tableMetaInfo.signal.kind}
          style={selectBoxStyle}
        />
      </td>
      <td {...rowSpanTags} css={styles}>
        <button
          type="button"
          className="delete-button"
          onClick={() => deleteRange()}
        >
          <FaRegTrashAlt />
        </button>
        <button
          type="button"
          className="zoom-button"
          onClick={() => zoomRange()}
        >
          <FaSearchPlus title="Zoom to range in spectrum" />
        </button>
        <button
          type="button"
          className="edit-button"
          onClick={() => editRange()}
        >
          <FaEdit color="blue" />
        </button>
      </td>
    </Fragment>
  );
}

export default ActionsColumn;
