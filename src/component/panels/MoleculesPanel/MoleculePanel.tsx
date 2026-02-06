/** @jsxImportSource @emotion/react */
import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';

import type {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule.js';
import { useChartData } from '../../context/ChartContext.js';
import { NextPrev } from '../../elements/NextPrev.js';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal.js';

import MoleculeHeader from './MoleculeHeader.js';
import { MoleculeOptionsPanel } from './MoleculeOptionsPanel.js';
import MoleculePanelHeader from './MoleculePanelHeader.js';
import { MoleculeStructure } from './MoleculeStructure.js';

const styles: Record<
  'panel' | 'innerPanel' | 'molecule' | 'slider' | 'items',
  SerializedStyles
> = {
  panel: css({
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  }),
  innerPanel: css({
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
  }),
  molecule: css({
    flex: 1,
    minHeight: '100px',
  }),
  slider: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  }),
  items: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }),
};

interface MoleculePanelInnerProps {
  molecules: StateMoleculeExtended[];
  moleculesView: MoleculesView;
}

function MoleculePanelInner(props: MoleculePanelInnerProps) {
  const { molecules: moleculesProp, moleculesView } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molecules, setMolecules] = useState<StateMoleculeExtended[]>([]);
  const [isFlipped, setFlipStatus] = useState(false);

  const { modal, openMoleculeEditor } = useMoleculeEditor();

  useEffect(() => {
    if (moleculesProp) {
      // eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state
      setMolecules((prevMolecules) => {
        if (moleculesProp.length > prevMolecules.length) {
          setCurrentIndex(molecules.length);
        }
        return moleculesProp;
      });
    }
  }, [molecules.length, moleculesProp]);

  function moleculeIndexHandler(index: any) {
    setCurrentIndex(index);
  }

  const lastIndex = molecules?.length > 0 ? molecules.length - 1 : 0;
  const activeIndex = Math.min(currentIndex, lastIndex);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const onClose = useCallback(() => {
    setFlipStatus(false);
  }, []);

  return (
    <div css={styles.panel}>
      {!isFlipped && (
        <MoleculePanelHeader
          currentIndex={activeIndex}
          moleculesView={moleculesView}
          molecules={molecules}
          onOpenMoleculeEditor={() => openMoleculeEditor()}
          onMoleculeIndexChange={moleculeIndexHandler}
          onClickPreferences={settingsPanelHandler}
        />
      )}
      {isFlipped && <MoleculeOptionsPanel onClose={onClose} />}
      {!isFlipped && (
        <div css={styles.innerPanel}>
          <div css={styles.molecule}>
            <ResponsiveChart>
              {({ height, width }) => {
                return (
                  <NextPrev
                    onChange={(slideIndex) => setCurrentIndex(slideIndex)}
                    index={currentIndex}
                  >
                    {molecules && molecules.length > 0 ? (
                      molecules.map((mol: StateMoleculeExtended, index) => {
                        return (
                          <div key={mol.id} css={styles.items}>
                            <MoleculeHeader
                              currentMolecule={mol}
                              molecules={molecules}
                            />

                            <div
                              css={styles.slider}
                              className="mol-svg-container"
                              onDoubleClick={() => openMoleculeEditor(mol)}
                              style={{
                                backgroundColor:
                                  (index + 1) % 2 !== 0 ? '#fafafa' : 'white',
                              }}
                            >
                              <MoleculeStructure
                                index={index}
                                width={width}
                                height={height - 60}
                                molecule={mol}
                                moleculeView={moleculesView?.[mol.id] || {}}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        css={styles.slider}
                        style={{ height: '100%' }}
                        onClick={() => openMoleculeEditor()}
                      >
                        <span>Click to draw molecule</span>
                      </div>
                    )}
                  </NextPrev>
                );
              }}
            </ResponsiveChart>
          </div>
        </div>
      )}
      {modal}
    </div>
  );
}

const MemoizedMoleculePanel = memo(MoleculePanelInner);

export default function MoleculePanel() {
  const {
    molecules,
    view: {
      molecules: moleculesView,
      spectra: { activeTab },
    },
    displayerMode,
  } = useChartData();

  return (
    <MemoizedMoleculePanel
      {...{
        molecules,
        moleculesView,
        displayerMode,
        activeTab,
      }}
    />
  );
}
