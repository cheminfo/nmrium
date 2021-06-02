/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import OCL from 'openchemlib/full';
import { useState, useCallback, useEffect, memo } from 'react';
import { MF } from 'react-mf';
import OCLnmr from 'react-ocl-nmr';
import { useMeasure } from 'react-use';

import { useDispatch } from '../../context/DispatchContext';
import NextPrev from '../../elements/NextPrev';
import { positions, useModal } from '../../elements/popup/Modal';
import MoleculeWrapper from '../../hoc/MoleculeWrapper';
import MoleculeStructureEditorModal from '../../modal/MoleculeStructureEditorModal';
import { SET_MOLECULE } from '../../reducer/types/Types';

import MoleculePanelHeader from './MoleculePanelHeader';
import useAtomAssignment from './useAtomAssignment';

const panelContainerStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;
`;

const moleculeContainerStyle = css`
  width: 100%;
  height: 100%;

  .slider {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0px;
    .mol-svg-container {
      height: calc(100% - 25px);
      width: 100%;
      div {
        width: 100%;
        height: 100%;
      }
    }

    p {
      width: 100%;
      margin: 0 auto;
      display: block;
      position: relative;
      text-align: center;
    }

    svg polygon {
      fill: gray !important;
    }
  }
`;

function MoleculePanel({
  zones,
  ranges,
  molecules: moleculesProp,
  activeTab,
  displayerMode,
}) {
  const [refContainer, { width, height }] = useMeasure();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molecules, setMolecules] = useState([]);

  const dispatch = useDispatch();
  const modal = useModal();

  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment({ zones, ranges, activeTab, displayerMode });

  useEffect(() => {
    if (moleculesProp) {
      setMolecules((prevMolecules) => {
        if (moleculesProp.length > prevMolecules.length) {
          setCurrentIndex(molecules.length);
        }
        return moleculesProp;
      });
    }
  }, [molecules.length, moleculesProp]);

  const handleReplaceMolecule = useCallback(
    (key, molfile) => {
      dispatch({ type: SET_MOLECULE, molfile, key });
    },
    [dispatch],
  );

  const openMoleculeEditorHandler = useCallback(
    (event, moleclue) => {
      modal.show(
        <MoleculeStructureEditorModal
          onClose={() => {
            modal.close();
          }}
          selectedMolecule={moleclue}
        />,
        {
          position: positions.TOP_CENTER,
          width: 700,
          height: 500,
        },
      );
    },
    [modal],
  );

  const moleculeIndexHandler = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div css={panelContainerStyle}>
      <MoleculePanelHeader
        currentIndex={currentIndex}
        molecules={molecules}
        onOpenMoleculeEditor={openMoleculeEditorHandler}
        onMoleculeIndexChange={moleculeIndexHandler}
      />

      <div css={moleculeContainerStyle}>
        <NextPrev
          onChange={(slideIndex) => setCurrentIndex(slideIndex)}
          defaultIndex={currentIndex}
        >
          {molecules && molecules.length > 0 ? (
            molecules.map((mol, index) => (
              <div
                className="slider"
                key={mol.key}
                onDoubleClick={(event) => openMoleculeEditorHandler(event, mol)}
                style={{
                  backgroundColor: (index + 1) % 2 !== 0 ? '#fafafa' : 'white',
                }}
              >
                <div className="mol-svg-container" ref={refContainer}>
                  <OCLnmr
                    OCL={OCL}
                    id={`molSVG${index}`}
                    width={width > 0 ? width : 100}
                    height={height > 0 ? height : 100}
                    molfile={mol.molfile}
                    setMolfile={(molfile) =>
                      handleReplaceMolecule(mol.key, molfile)
                    }
                    setSelectedAtom={handleOnClickAtom}
                    atomHighlightColor={
                      currentDiaIDsToHighlight &&
                      currentDiaIDsToHighlight.length > 0
                        ? 'red'
                        : '#FFD700'
                    }
                    atomHighlightOpacity={0.35}
                    highlights={
                      currentDiaIDsToHighlight &&
                      currentDiaIDsToHighlight.length > 0
                        ? currentDiaIDsToHighlight
                        : assignedDiaIDsMerged
                    }
                    setHoverAtom={handleOnAtomHover}
                  />
                </div>
                <p>
                  <MF mf={mol.mf} /> - {mol.mw.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div
              style={{ width: '100%', height: '100%' }}
              onClick={openMoleculeEditorHandler}
            />
          )}
        </NextPrev>
      </div>
    </div>
  );
}

export default MoleculeWrapper(memo(MoleculePanel));
