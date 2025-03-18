import { Molecule as OCLMolecule } from 'openchemlib/full';
import type { CSSProperties, ReactNode } from 'react';
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
import { IoOpenOutline } from 'react-icons/io5';
import { PanelHeader, Toolbar } from 'react-science/ui';

import type {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule.js';
import { getMolecules } from '../../../data/molecules/MoleculeManager.js';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import AboutPredictionModal from '../../modal/AboutPredictionModal.js';
import PredictSpectraModal from '../../modal/PredictSpectraModal.js';
import {
  browserNotSupportedErrorToast,
  copyPNGToClipboard,
  exportAsSVG,
} from '../../utility/export.js';

const styles: Record<'atomLabel', CSSProperties> = {
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
  const toaster = useToaster();
  const dispatch = useDispatch();

  const moleculeKey = molecules?.[currentIndex]?.id;
  const saveAsSVGHandler = useCallback(() => {
    if (!rootRef) return;
    exportAsSVG(`molSVG${currentIndex}`, {
      rootElement: rootRef,
      fileName: 'molFile',
    });
  }, [rootRef, currentIndex]);

  const saveAsPNGHandler = useCallback(async () => {
    if (!rootRef) return;

    try {
      await copyPNGToClipboard(`molSVG${currentIndex}`, {
        rootElement: rootRef,
      });
      toaster.show({
        message: 'MOL copied as PNG to clipboard',
        intent: 'success',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toaster.show({ intent: 'danger', message: error.message });
      } else {
        toaster.show(browserNotSupportedErrorToast);
      }
    }
  }, [rootRef, currentIndex, toaster]);

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
        toaster.show({
          message: 'MOLFile copied to clipboard',
          intent: 'success',
        });
      });
    },
    [rawWriteWithType, toaster],
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
    try {
      const molecules = getMolecules(molfile);
      dispatch({ type: 'ADD_MOLECULES', payload: { molecules } });
    } catch {
      toaster.show({
        intent: 'danger',
        message:
          'Failed to parse SMILES or molfile. Please paste a valid format',
      });
    } finally {
      cleanShouldFallback();
    }
  }

  const handleDelete = useCallback(() => {
    if (molecules[currentIndex]?.id) {
      onMoleculeIndexChange?.(0);
      dispatch({
        type: 'DELETE_MOLECULE',
        payload: { id: molecules[currentIndex].id },
      });
    }
  }, [molecules, currentIndex, onMoleculeIndexChange, dispatch]);

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
    <PanelHeader
      onClickSettings={onClickPreferences}
      current={molecules && molecules.length > 0 ? currentIndex + 1 : undefined}
      total={molecules && molecules.length > 0 ? molecules.length : undefined}
    >
      <Toolbar>
        {renderSource === 'predictionPanel' && <AboutPredictionModal />}
        {renderSource === 'moleculePanel' && (
          <>
            <ToolbarPopoverItem
              options={MOL_EXPORT_MENU}
              onClick={exportHandler}
              disabled={!hasMolecules}
              tooltip="Export As"
              icon={<FaFileExport />}
              id="molecule-export-as"
            />

            <Toolbar.Item
              tooltip="Paste molfile"
              icon={<FaPaste />}
              onClick={handlePasteMolfileAction}
            />
            <Toolbar.Item
              tooltip="Add molecule"
              icon={<FaPlus />}
              onClick={onOpenMoleculeEditor}
            />
          </>
        )}

        {renderSource === 'moleculePanel' && (
          <>
            <Toolbar.Item
              tooltip="Delete molecule"
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
          tooltip="Float molecule"
          icon={<IoOpenOutline />}
          onClick={floatMoleculeHandler}
          active={moleculesView?.[moleculeKey]?.floating.visible || false}
          disabled={!hasMolecules}
        />
        <Toolbar.Item
          tooltip="Show atom number"
          icon={<p style={styles.atomLabel}>#</p>}
          onClick={showAtomNumbersHandler}
          active={moleculesView?.[moleculeKey]?.showAtomNumber || false}
          disabled={!hasMolecules}
        />
      </Toolbar>

      <div style={{ flex: 1 }}>{children}</div>

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
