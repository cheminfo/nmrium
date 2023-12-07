import { Molecule as OCLMolecule } from 'openchemlib/full';
import { CSSProperties, ReactNode, useCallback } from 'react';
import {
  FaCog,
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
import { getMolecules } from '../../../data/molecules/MoleculeManager';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import ActiveButton from '../../elements/ActiveButton';
import Button from '../../elements/Button';
import { DropdownMenu, DropdownMenuProps } from '../../elements/DropdownMenu';
import { useAlert } from '../../elements/popup/Alert';
import AboutPredictionModal from '../../modal/AboutPredictionModal';
import PredictSpectraModal from '../../modal/PredictSpectraModal';
import { copyPNGToClipboard, exportAsSVG } from '../../utility/export';
import PanelHeader from '../header/PanelHeader';

const styles: Record<'counter' | 'atomLabel', CSSProperties> = {
  counter: {
    margin: 0,
    textAlign: 'right',
    lineHeight: '22px',
    padding: '0 5px',
    whiteSpace: 'nowrap',
  },
  atomLabel: {
    width: '14px',
    height: '14px',
    padding: 0,
    margin: 0,
    textAlign: 'center',
    lineHeight: 1,
  },
};

const MOL_EXPORT_MENU: DropdownMenuProps['options'] = [
  {
    icon: <FaCopy />,
    text: 'Copy as molfile V3',
    data: {
      id: 'molfileV3',
    },
  },
  {
    icon: <FaCopy />,
    text: 'Copy as molfile V2',
    data: {
      id: 'molfileV2',
    },
  },
  {
    icon: <FaFileImage />,
    text: 'Copy as PNG',
    data: {
      id: 'png',
    },
  },
  {
    icon: <FaDownload />,
    text: 'Export as SVG',
    data: {
      id: 'svg',
    },
  },
];
interface MoleculePanelHeaderProps {
  currentIndex: number;
  molecules: StateMoleculeExtended[];
  moleculesView: MoleculesView;
  onMoleculeIndexChange?: (index: number) => void;
  onOpenMoleculeEditor: () => void;
  renderSource?: 'moleculePanel' | 'predictionPanel';
  onClickPreferences?: () => void;
  children?: ReactNode;
}

export default function MoleculePanelHeader({
  currentIndex,
  molecules,
  moleculesView,
  onMoleculeIndexChange,
  onOpenMoleculeEditor,
  renderSource = 'moleculePanel',
  onClickPreferences,
  children,
}: MoleculePanelHeaderProps) {
  const { rootRef } = useGlobal();
  const alert = useAlert();
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();
  const moleculeKey = molecules?.[currentIndex]?.id;
  const saveAsSVGHandler = useCallback(() => {
    if (!rootRef) return;
    exportAsSVG(rootRef, `molSVG${currentIndex} `, 'molFile');
  }, [rootRef, currentIndex]);

  const saveAsPNGHandler = useCallback(() => {
    if (!rootRef) return;
    copyPNGToClipboard(rootRef, `molSVG${currentIndex} `);
    alert.success('MOL copied as PNG to clipboard');
  }, [rootRef, alert, currentIndex]);

  const {
    rawWriteWithType,
    readText,
    shouldFallback,
    cleanShouldFallback,
    text,
  } = useClipboard();

  const saveAsMolHandler = useCallback(
    (molfile) => {
      void rawWriteWithType(molfile).then(() => {
        alert.success('MOLFile copied to clipboard');
      });
    },
    [alert, rawWriteWithType],
  );

  const exportHandler = useCallback(
    (selected) => {
      const molecule = molecules?.[currentIndex];
      if (molecule) {
        switch (selected?.id) {
          case 'molfileV3':
            saveAsMolHandler(molecule.molfile);
            break;
          case 'molfileV2': {
            saveAsMolHandler(
              OCLMolecule.fromMolfile(molecule.molfile).toMolfile(),
            );

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

  function handlePasteMolfileAction() {
    void readText().then(handlePasteMolfile);
  }
  async function handlePasteMolfile(molfile: string | undefined) {
    if (!molfile) return;
    const molecules = await getMolecules(molfile);
    dispatch({ type: 'ADD_MOLECULES', payload: { molecules } });
    cleanShouldFallback();
  }

  const handleDelete = useCallback(() => {
    if (molecules[currentIndex]?.id) {
      onMoleculeIndexChange?.(0);
      dispatch({
        type: 'DELETE_MOLECULE',
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

  function floatMoleculeHandler() {
    dispatch({
      type: 'FLOAT_MOLECULE_OVER_SPECTRUM',
      payload: { id: moleculeKey },
    });
  }

  function showAtomNumbersHandler() {
    dispatch({
      type: 'TOGGLE_MOLECULE_ATOM_NUMBER',
      payload: { id: moleculeKey },
    });
  }

  const hasMolecules = molecules && molecules.length > 0;

  return (
    <PanelHeader>
      {renderSource === 'predictionPanel' && <AboutPredictionModal />}
      {renderSource === 'moleculePanel' && (
        <DropdownMenu options={MOL_EXPORT_MENU} onSelect={exportHandler}>
          <Button.BarButton
            as="div"
            disabled={!hasMolecules}
            color={{ base: '#4e4e4e', hover: '#4e4e4e' }}
            toolTip="Export As"
            tooltipOrientation="horizontal"
          >
            <FaFileExport />
          </Button.BarButton>
        </DropdownMenu>
      )}
      <Button.BarButton
        onClick={handlePasteMolfileAction}
        color={{ base: '#4e4e4e', hover: '#4e4e4e' }}
        toolTip="Paste molfile"
        tooltipOrientation="horizontal"
      >
        <FaPaste />
      </Button.BarButton>
      <Button.BarButton
        onClick={onOpenMoleculeEditor}
        color={{ base: '#4e4e4e', hover: '#4e4e4e' }}
        toolTip="Add molecule"
        tooltipOrientation="horizontal"
      >
        <FaPlus />
      </Button.BarButton>
      {renderSource === 'moleculePanel' && (
        <>
          <Button.BarButton
            onClick={handleDelete}
            color={{ base: '#4e4e4e', hover: '#4e4e4e' }}
            toolTip="Delete molecule"
            tooltipOrientation="horizontal"
            disabled={!hasMolecules}
          >
            <FaRegTrashAlt />
          </Button.BarButton>
          {hasMolecules && (
            <PredictSpectraModal molecule={molecules[currentIndex]} />
          )}
        </>
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
        <p style={styles.atomLabel}>#</p>
      </ActiveButton>
      <div style={{ flex: 1 }}>{children}</div>
      {molecules && molecules.length > 0 && (
        <p style={styles.counter}>
          {`${+(currentIndex + 1)} / ${molecules.length}`}
        </p>
      )}
      {onClickPreferences && (
        <Button.BarButton
          color={{ base: 'black', hover: 'black' }}
          onClick={onClickPreferences}
          toolTip="Preferences"
          tooltipOrientation="vertical"
        >
          <FaCog />
        </Button.BarButton>
      )}

      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        onReadText={handlePasteMolfile}
        text={text}
        label="Molfile"
      />
    </PanelHeader>
  );
}
