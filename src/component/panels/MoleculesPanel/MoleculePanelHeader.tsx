/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrFt } from 'cheminfo-font';
import { useCallback } from 'react';
import {
  FaCopy,
  FaDownload,
  FaFileExport,
  FaFileImage,
  FaPaste,
  FaPlus,
  FaRegTrashAlt,
} from 'react-icons/fa';

import { useAssignmentData } from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import ButtonToolTip from '../../elements/ButtonToolTip';
import MenuButton from '../../elements/MenuButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { positions, useModal } from '../../elements/popup/Modal';
import PredictSpectraModal from '../../modal/PredictSpectraModal';
import { ADD_MOLECULE, DELETE_MOLECULE } from '../../reducer/types/Types';
import {
  copyPNGToClipboard,
  copyTextToClipboard,
  exportAsSVG,
} from '../../utility/Export';

const toolbarStyle = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;

  button svg {
    fill: #4e4e4e;
  }

  button {
    background-color: transparent;
    border: none;
    padding: 5px;
  }

  p {
    margin: 0;
    text-align: right;
    width: 100%;
    line-height: 22px;
    padding: 0px 10px;
  }
`;

const MOL_EXPORT_MENU = [
  {
    id: 'molfile',
    icon: <FaCopy />,
    label: 'Copy as molfile',
  },
  {
    id: 'png',
    icon: <FaFileImage />,
    label: 'Copy as PNG',
  },
  {
    id: 'svg',
    icon: <FaDownload />,
    label: 'Export as SVG',
  },
];

interface MoleculePanelHeaderProps {
  currentIndex: number;
  molecules: Array<any>;
  onMoleculeIndexChange: (index: number) => void;
  onOpenMoleculeEditor: () => void;
}

export default function MoleculePanelHeader({
  currentIndex,
  molecules,
  onMoleculeIndexChange = () => null,
  onOpenMoleculeEditor = () => null,
}: MoleculePanelHeaderProps) {
  const alert = useAlert();
  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();

  const saveAsSVGHandler = useCallback(() => {
    exportAsSVG(`molSVG${currentIndex}`, 'molFile');
  }, [currentIndex]);

  const saveAsPNGHandler = useCallback(() => {
    copyPNGToClipboard(`molSVG${currentIndex}`);
    alert.success('MOL copied as PNG to clipboard');
  }, [alert, currentIndex]);

  const saveAsMolHandler = useCallback(() => {
    if (molecules[currentIndex]) {
      void copyTextToClipboard(molecules[currentIndex].molfile).then((flag) => {
        if (flag) {
          alert.success('MOLFile copied to clipboard');
        } else {
          alert.error('copied not completed');
        }
      });
    }
  }, [alert, currentIndex, molecules]);

  const exportHandler = useCallback(
    ({ id }) => {
      switch (id) {
        case 'molfile':
          saveAsMolHandler();
          break;
        case 'png':
          saveAsPNGHandler();
          break;
        case 'svg':
          saveAsSVGHandler();
          break;
        default:
          break;
      }
    },
    [saveAsMolHandler, saveAsPNGHandler, saveAsSVGHandler],
  );

  const handlePaste = useCallback(() => {
    void navigator.clipboard.readText().then((molfile) => {
      dispatch({ type: ADD_MOLECULE, molfile });
    });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (molecules[currentIndex]?.key) {
      onMoleculeIndexChange(0);
      dispatch({
        type: DELETE_MOLECULE,
        payload: { key: molecules[currentIndex].key, assignmentData },
      });
    }
  }, [
    molecules,
    currentIndex,
    onMoleculeIndexChange,
    dispatch,
    assignmentData,
  ]);

  const openPredictSpectraModal = useCallback(() => {
    modal.show(<PredictSpectraModal molfile={molecules[currentIndex]} />, {
      position: positions.TOP_CENTER,
      enableResizing: true,
      width: 600,
    });
  }, [modal, molecules, currentIndex]);

  return (
    <div css={toolbarStyle}>
      <MenuButton
        component={<FaFileExport />}
        toolTip="Export As"
        items={MOL_EXPORT_MENU}
        onClick={exportHandler}
      />

      <ToolTip title="Paste molfile" popupPlacement="left">
        <button className="bar-button" type="button" onClick={handlePaste}>
          <FaPaste />
        </button>
      </ToolTip>
      <ToolTip title="Add Molecule" popupPlacement="left">
        <button
          className="bar-button"
          type="button"
          onClick={onOpenMoleculeEditor}
          data-test-id="panel-structures-button-add"
        >
          <FaPlus />
        </button>
      </ToolTip>
      <ToolTip title="Delete Molecule" popupPlacement="left">
        <button className="bar-button" type="button" onClick={handleDelete}>
          <FaRegTrashAlt />
        </button>
      </ToolTip>
      {molecules && molecules.length > 0 && (
        <ButtonToolTip
          popupTitle="Predict Spectra"
          popupPlacement="left"
          onClick={openPredictSpectraModal}
        >
          <SvgNmrFt />
        </ButtonToolTip>
      )}
      <p>
        {molecules &&
          molecules.length > 0 &&
          `${+(currentIndex + 1)} / ${molecules.length}`}{' '}
      </p>
    </div>
  );
}
