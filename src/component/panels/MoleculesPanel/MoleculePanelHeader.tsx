import { Molecule } from 'openchemlib';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import {
  FaCopy,
  FaDownload,
  FaFileExport,
  FaFileImage,
  FaPaste,
  FaPlus,
  FaRegBookmark,
  FaRegTrashAlt,
} from 'react-icons/fa';
import { FaMaximize, FaMinimize } from 'react-icons/fa6';
import { IoOpenOutline } from 'react-icons/io5';
import { MdNumbers, MdOutlineLabelOff } from 'react-icons/md';
import { PanelHeader, Toolbar } from 'react-science/ui';

import type {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule.js';
import {
  getMolecules,
  parseErrorMessage,
} from '../../../data/molecules/MoleculeManager.js';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { usePreferences } from '../../context/PreferencesContext.tsx';
import { useToaster } from '../../context/ToasterContext.js';
import { useTopicMolecule } from '../../context/TopicMoleculeContext.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import AboutPredictionModal from '../../modal/AboutPredictionModal.js';
import PredictSpectraModal from '../../modal/PredictSpectraModal.js';
import { booleanToString } from '../../utility/booleanToString.ts';
import {
  browserNotSupportedErrorToast,
  copyPNGToClipboard,
  exportAsSVG,
} from '../../utility/export.js';
import { useMoleculeAnnotationCore } from '../hooks/useMoleculeAnnotationCore.ts';

const MOL_EXPORT_MENU: ToolbarPopoverMenuItem[] = [
  {
    icon: <FaCopy />,
    text: 'Copy as SMILES',
    data: {
      id: 'smiles',
    },
  },
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

export default function MoleculePanelHeader(props: MoleculePanelHeaderProps) {
  const {
    currentIndex,
    molecules,
    moleculesView,
    onMoleculeIndexChange,
    onOpenMoleculeEditor,
    renderSource = 'moleculePanel',
    onClickPreferences,
    onClickPastMolecule,
    children,
  } = props;
  const { rootRef } = useGlobal();
  const toaster = useToaster();
  const dispatch = useDispatch();
  const {
    current: { defaultMoleculeSettings },
  } = usePreferences();
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

  const copyHandler = useCallback(
    (value: any, title: any) => {
      void rawWriteWithType(value).then(() => {
        toaster.show({
          message: `${title} copied to clipboard`,
          intent: 'success',
        });
      });
    },
    [rawWriteWithType, toaster],
  );

  const exportHandler = useCallback(
    (selected: any) => {
      const m = molecules?.[currentIndex];
      const molecule = Molecule.fromMolfile(m.molfile);
      if (molecule) {
        switch (selected?.id) {
          case 'smiles':
            copyHandler(molecule.toIsomericSmiles(), 'SMILES');

            break;
          case 'molfileV3':
            copyHandler(m.molfile, 'MOLFile');
            break;
          case 'molfileV2': {
            copyHandler(
              molecule.toMolfile({ customLabelPosition: 'normal' }),
              'MOLFile',
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
    [molecules, currentIndex, copyHandler, saveAsPNGHandler, saveAsSVGHandler],
  );

  function handlePasteMoleculeAction() {
    onClickPastMolecule?.();
    void readText().then(handlePasteMolecule);
  }

  /**
   * The moleecule pasted could be SMILES, molfile or SDF
   * @param text - text from clipboard
   * @returns
   */

  async function handlePasteMolecule(text?: string) {
    try {
      const molecules = getMolecules(text);
      dispatch({
        type: 'ADD_MOLECULES',
        payload: { molecules, defaultMoleculeSettings },
      });
    } catch (error: any) {
      toaster.show({
        intent: 'danger',
        message: error?.message || parseErrorMessage,
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

  const topicMolecule = useTopicMolecule();

  function expandMoleculeHydrogens(expand?: boolean) {
    const molecule = molecules[currentIndex];

    if (!molecule) return;

    const { id, label } = molecule;
    const molfile = expand
      ? topicMolecule[id].toMolfileWithH({ version: 3 })
      : topicMolecule[id].toMolfileWithoutH({ version: 3 });
    dispatch({ type: 'SET_MOLECULE', payload: { id, label, molfile } });
  }

  function clearCustomAtomLabels() {
    const currentMolecule = molecules[currentIndex];

    if (!currentMolecule) return;
    const { id, label, molfile } = currentMolecule;

    const molecule = Molecule.fromMolfile(molfile);

    for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
      molecule.setAtomCustomLabel(atom, null);
    }

    dispatch({
      type: 'SET_MOLECULE',
      payload: { id, label, molfile: molecule.toMolfileV3() },
    });
  }

  const hasMolecules = molecules && molecules.length > 0;
  const showCounter = hasMolecules && renderSource !== 'predictionPanel';
  const moreMenu: ToolbarPopoverMenuItem[] = [
    {
      icon: <FaMaximize />,
      text: 'Expand all hydrogens',
      disabled: !hasMolecules,
      onClick: () => expandMoleculeHydrogens(true),
    },
    {
      icon: <FaMinimize />,
      text: 'Collapse all hydrogens',
      disabled: !hasMolecules,
      onClick: () => expandMoleculeHydrogens(false),
    },
    {
      icon: <MdOutlineLabelOff />,
      text: 'Clear custom atom labels',
      disabled: !hasMolecules,
      onClick: () => clearCustomAtomLabels(),
    },
  ];

  const { handleChangeAtomAnnotation, isAnnotation } =
    useMoleculeAnnotationCore(moleculeKey, moleculesView[moleculeKey]);
  return (
    <PanelHeader
      onClickSettings={onClickPreferences}
      current={showCounter ? currentIndex + 1 : undefined}
      total={showCounter ? molecules.length : undefined}
    >
      <Toolbar>
        {renderSource === 'predictionPanel' && <AboutPredictionModal />}
        {renderSource === 'moleculePanel' && (
          <ToolbarPopoverItem
            options={MOL_EXPORT_MENU}
            onClick={exportHandler}
            disabled={!hasMolecules}
            tooltip="Export As"
            icon={<FaFileExport />}
            id="molecule-export-as"
          />
        )}
        <Toolbar.Item
          tooltip="Paste SMILES or molfile"
          icon={<FaPaste />}
          onClick={handlePasteMoleculeAction}
        />
        {renderSource === 'moleculePanel' && (
          <Toolbar.Item
            tooltip="Add molecule"
            icon={<FaPlus />}
            onClick={onOpenMoleculeEditor}
          />
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

            <Toolbar.Item
              tooltip={`${booleanToString(!isAnnotation('atom-numbers'))} atom number`}
              icon={<MdNumbers />}
              onClick={() => handleChangeAtomAnnotation('atom-numbers')}
              active={isAnnotation('atom-numbers')}
              disabled={!hasMolecules}
            />
            <Toolbar.Item
              tooltip={`${booleanToString(!isAnnotation('custom-labels'))} custom labels`}
              icon={<FaRegBookmark />}
              onClick={() => handleChangeAtomAnnotation('custom-labels')}
              active={isAnnotation('custom-labels')}
              disabled={!hasMolecules}
            />
          </>
        )}

        <Toolbar.Item
          tooltip="Float molecule"
          icon={<IoOpenOutline />}
          onClick={floatMoleculeHandler}
          active={moleculesView?.[moleculeKey]?.floating.visible || false}
          disabled={!hasMolecules}
        />

        <ToolbarPopoverItem
          options={moreMenu}
          tooltip="More"
          tooltipProps={{
            minimal: true,
          }}
          icon="more"
        />
      </Toolbar>

      <div style={{ flex: 1 }}>{children}</div>

      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        onReadText={handlePasteMolecule}
        text={text}
        label="Enter here a molfile or SMILES"
      />
    </PanelHeader>
  );
}
