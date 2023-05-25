/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrFt } from 'cheminfo-font';
import { Molecule as OCLMolecule } from 'openchemlib/full';
import { CSSProperties, useCallback } from 'react';
import {
  FaCopy,
  FaDownload,
  FaFileExport,
  FaFileImage,
  FaPaste,
  FaPlus,
  FaRegTrashAlt,
} from 'react-icons/fa';
import { IoOpenOutline } from 'react-icons/io5';

import {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import ActiveButton from '../../elements/ActiveButton';
import ButtonToolTip from '../../elements/ButtonToolTip';
import MenuButton from '../../elements/MenuButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { positions, useModal } from '../../elements/popup/Modal';
import AboutPredictionModal from '../../modal/AboutPredictionModal';
import PredictSpectraModal from '../../modal/PredictSpectraModal';
import {
  ADD_MOLECULE,
  DELETE_MOLECULE,
  FLOAT_MOLECULE_OVER_SPECTRUM,
  TOGGLE_MOLECULE_ATOM_NUMBER,
} from '../../reducer/types/Types';
import {
  copyPNGToClipboard,
  copyTextToClipboard,
  exportAsSVG,
} from '../../utility/export';

const toolbarStyle = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240 240 240);
  padding: 2px 5px;

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
    padding: 0 10px;
  }
`;

const atomLabelStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  padding: 0,
  margin: 0,
  textAlign: 'center',
  lineHeight: 1,
};

const MOL_EXPORT_MENU = [
  {
    id: 'molfileV3',
    icon: <FaCopy />,
    label: 'Copy as molfile V3',
  },
  {
    id: 'molfileV2',
    icon: <FaCopy />,
    label: 'Copy as molfile V2',
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

export interface MoleculeHeaderActionsOptions {
  hidePast?: boolean;
  hideAdd?: boolean;
  hideExport?: boolean;
  hideDelete?: boolean;
  hidePredict?: boolean;
  showAboutPredict?: boolean;
}
interface MoleculePanelHeaderProps {
  currentIndex: number;
  molecules: Array<StateMoleculeExtended>;
  moleculesView: MoleculesView;
  onMoleculeIndexChange: (index: number) => void;
  onOpenMoleculeEditor: () => void;
  actionsOptions?: MoleculeHeaderActionsOptions;
}

export default function MoleculePanelHeader({
  currentIndex,
  molecules,
  moleculesView,
  onMoleculeIndexChange = () => null,
  onOpenMoleculeEditor = () => null,
  actionsOptions = {},
}: MoleculePanelHeaderProps) {
  const { rootRef } = useGlobal();
  const alert = useAlert();
  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();
  const moleculeKey = molecules?.[currentIndex]?.id;

  const saveAsSVGHandler = useCallback(() => {
    if (!rootRef) return;
    exportAsSVG(rootRef, `molSVG${currentIndex}`, 'molFile');
  }, [rootRef, currentIndex]);

  const saveAsPNGHandler = useCallback(() => {
    if (!rootRef) return;
    copyPNGToClipboard(rootRef, `molSVG${currentIndex}`);
    alert.success('MOL copied as PNG to clipboard');
  }, [rootRef, alert, currentIndex]);

  const saveAsMolHandler = useCallback(
    (molfile) => {
      void copyTextToClipboard(molfile).then((flag) => {
        if (flag) {
          alert.success('MOLFile copied to clipboard');
        } else {
          alert.error('copied not completed');
        }
      });
    },
    [alert],
  );

  const exportHandler = useCallback(
    ({ id }) => {
      switch (id) {
        case 'molfileV3': {
          const molfile = molecules?.[currentIndex].molfile || '';
          saveAsMolHandler(molfile);
          break;
        }
        case 'molfileV2': {
          const molfile = molecules?.[currentIndex].molfile || '';
          saveAsMolHandler(OCLMolecule.fromMolfile(molfile).toMolfile());
          break;
        }
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
    [
      currentIndex,
      molecules,
      saveAsMolHandler,
      saveAsPNGHandler,
      saveAsSVGHandler,
    ],
  );

  const handlePaste = useCallback(() => {
    void navigator.clipboard.readText().then((molfile) => {
      dispatch({ type: ADD_MOLECULE, payload: { molfile } });
    });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (molecules[currentIndex]?.id) {
      onMoleculeIndexChange(0);
      dispatch({
        type: DELETE_MOLECULE,
        payload: { id: molecules[currentIndex].id, assignmentData },
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

  function floatMoleculeHandler() {
    dispatch({
      type: FLOAT_MOLECULE_OVER_SPECTRUM,
      payload: { id: moleculeKey },
    });
  }

  function showAtomNumbersHandler() {
    dispatch({
      type: TOGGLE_MOLECULE_ATOM_NUMBER,
      payload: { id: moleculeKey },
    });
  }

  const hasMolecules = molecules && molecules.length > 0;

  return (
    <div css={toolbarStyle}>
      {actionsOptions?.showAboutPredict && <AboutPredictionModal />}
      {!actionsOptions.hideExport && (
        <MenuButton
          component={<FaFileExport />}
          toolTip="Export As"
          items={MOL_EXPORT_MENU}
          onClick={exportHandler}
        />
      )}

      {!actionsOptions.hidePast && (
        <ToolTip title="Paste molfile" popupPlacement="left">
          <button className="bar-button" type="button" onClick={handlePaste}>
            <FaPaste />
          </button>
        </ToolTip>
      )}
      {!actionsOptions.hideAdd && (
        <ToolTip title="Add molecule" popupPlacement="left">
          <button
            className="bar-button"
            type="button"
            onClick={onOpenMoleculeEditor}
          >
            <FaPlus />
          </button>
        </ToolTip>
      )}
      {!actionsOptions.hideDelete && (
        <ToolTip title="Delete molecule" popupPlacement="left">
          <button className="bar-button" type="button" onClick={handleDelete}>
            <FaRegTrashAlt />
          </button>
        </ToolTip>
      )}
      {!actionsOptions.hidePredict && hasMolecules && (
        <ButtonToolTip
          popupTitle="Predict spectra"
          popupPlacement="left"
          onClick={openPredictSpectraModal}
        >
          <SvgNmrFt />
        </ButtonToolTip>
      )}

      <ActiveButton
        value={moleculesView?.[moleculeKey]?.floating.visible || false}
        popupTitle="Float molecule"
        popupPlacement="left"
        onClick={floatMoleculeHandler}
        disabled={!hasMolecules}
      >
        <IoOpenOutline />
      </ActiveButton>
      <ActiveButton
        style={{ marginLeft: '2px' }}
        value={moleculesView?.[moleculeKey]?.showAtomNumber || false}
        popupTitle="Show atom number"
        popupPlacement="left"
        onClick={showAtomNumbersHandler}
        disabled={!hasMolecules}
      >
        <p style={atomLabelStyle}>#</p>
      </ActiveButton>

      <p>
        {molecules &&
          molecules.length > 0 &&
          `${+(currentIndex + 1)} / ${molecules.length}`}{' '}
      </p>
    </div>
  );
}
