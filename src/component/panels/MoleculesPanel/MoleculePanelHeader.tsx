import { Molecule as OCLMolecule } from 'openchemlib/full';
import { CSSProperties, ReactNode, useCallback } from 'react';
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
import { Toolbar } from 'react-science/ui';

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
import { PreferencesButton } from '../../elements/PreferencesButton';
import {
  ToolbarPopoverItem,
  ToolbarPopoverMenuItem,
} from '../../elements/ToolbarPopoverItem';
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

const MOL_EXPORT_MENU: ToolbarPopoverMenuItem[] = [
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
  onClickPastMolecule?: () => void;
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
  onClickPastMolecule,
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

  const saveAsPNGHandler = useCallback(async () => {
    if (!rootRef) return;
    await copyPNGToClipboard(rootRef, `molSVG${currentIndex} `);
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
            void saveAsPNGHandler();
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
    onClickPastMolecule?.();
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
      <Toolbar>
        {renderSource === 'moleculePanel' && (
          <>
            <ToolbarPopoverItem
              options={MOL_EXPORT_MENU}
              onClick={exportHandler}
              disabled={!hasMolecules}
              title="Export As"
              icon={<FaFileExport />}
            />

            <Toolbar.Item
              title="Paste molfile"
              icon={<FaPaste />}
              onClick={handlePasteMolfileAction}
            />
            <Toolbar.Item
              title="Add molecule"
              icon={<FaPlus />}
              onClick={onOpenMoleculeEditor}
            />
          </>
        )}

        {renderSource === 'moleculePanel' && (
          <>
            <Toolbar.Item
              title="Delete molecule"
              icon={<FaRegTrashAlt />}
              onClick={handleDelete}
              disabled={!hasMolecules}
            />
            {hasMolecules && (
              <PredictSpectraModal molecule={molecules[currentIndex]} />
            )}
          </>
        )}

        <Toolbar.Item
          title="Float molecule"
          icon={<IoOpenOutline />}
          onClick={floatMoleculeHandler}
          active={moleculesView?.[moleculeKey]?.floating.visible || false}
          disabled={!hasMolecules}
        />
        <Toolbar.Item
          title="Show atom number"
          icon={<p style={styles.atomLabel}>#</p>}
          onClick={showAtomNumbersHandler}
          active={moleculesView?.[moleculeKey]?.showAtomNumber || false}
          disabled={!hasMolecules}
        />
      </Toolbar>

      <div style={{ flex: 1 }}>{children}</div>
      {molecules && molecules.length > 0 && (
        <p style={styles.counter}>
          {`${+(currentIndex + 1)} / ${molecules.length}`}
        </p>
      )}
      {onClickPreferences && (
        <PreferencesButton title="Preferences" onClick={onClickPreferences} />
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
