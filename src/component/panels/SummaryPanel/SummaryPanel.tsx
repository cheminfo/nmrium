import styled from '@emotion/styled';
import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import type {
  Correlation,
  Link,
  Options as CorrelationOptions,
  Values as CorrelationValues,
} from 'nmr-correlation';
import { getLinkDelta, getLinkDim } from 'nmr-correlation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaFlask, FaSlidersH } from 'react-icons/fa';

import {
  findRange,
  findSignal1D,
  findSignal2D,
  findSpectrum,
  findZone,
} from '../../../data/utilities/FindUtilities.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { withDialog } from '../../elements/DialogManager.js';
import Select from '../../elements/Select.js';
import { useDialogToggle } from '../../hooks/useDialogToggle.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';

import CorrelationTable from './CorrelationTable/CorrelationTable.js';
import { EditLinkModal } from './CorrelationTable/editLink/EditLinkModal.js';
import Overview from './Overview.js';
import { SetMolecularFormulaModal } from './SetMolecularFormulaModal.js';
import { SetShiftToleranceModal } from './SetShiftTolerancesModal.js';
import {
  findSignalMatch1D,
  findSignalMatch2D,
  getAtomType,
} from './utilities/Utilities.js';

type EditCorrelationAction =
  | 'add'
  | 'move'
  | 'remove'
  | 'unmove'
  | 'setPathLength';

export type OnEditCorrelationCallback = (
  editedCorrelations: Correlation[],
  action: EditCorrelationAction,
  link?: Link,
  options?: CorrelationOptions,
) => void;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
  width: 100%;
`;

const InnerHeader = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`;
const OverviewContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: 10px;
  width: 100%;
`;

const SelectionContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-right: 2px;
  white-space: nowrap;
  width: 100%;
`;

const SelectionLabel = styled.label`
  font-size: 13px;
`;

const EditLinkDialog = withDialog(EditLinkModal);

function SummaryPanel() {
  const {
    correlations: correlationsData,
    data: spectraData,
    xDomain,
    yDomain,
    displayerMode,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const dispatch = useDispatch();
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    shiftToleranceModal: false,
    molecularFormula: false,
  });

  const [additionalColumnData, setAdditionalColumnData] = useState<
    Correlation[]
  >([]);
  const [
    selectedAdditionalColumnsAtomType,
    setSelectedAdditionalColumnsAtomType,
  ] = useState<string>('H');
  const [showProtonsAsRows, setShowProtonsAsRows] = useState(false);
  const [filterIsActive, setFilterIsActive] = useState(false);

  const filteredCorrelationsData = useMemo(() => {
    const isInView = (correlation: Correlation): boolean => {
      if (correlation.pseudo) {
        return false;
      }
      const atomTypesInView = activeTab
        .split(',')
        .map((tab) => getAtomType(tab));

      const factor = 10000;
      const xDomain0 = xDomain[0] * factor;
      const xDomain1 = xDomain[1] * factor;
      const yDomain0 = yDomain[0] * factor;
      const yDomain1 = yDomain[1] * factor;

      if (displayerMode === '1D') {
        const firstLink1D = correlation.link.find(
          (link: Link) => getLinkDim(link) === 1,
        );
        if (!firstLink1D) {
          return false;
        }
        let delta = getLinkDelta(firstLink1D);
        if (delta === undefined) {
          return false;
        }
        delta *= factor;
        const spectrum = findSpectrum(
          spectraData,
          firstLink1D.experimentID,
          true,
        );
        if (
          spectrum &&
          atomTypesInView[0] === correlation.atomType &&
          delta >= xDomain0 &&
          delta <= xDomain1
        ) {
          return true;
        }
        // try to find a link which contains the belonging 2D signal in the spectra in view
        if (
          correlation.link.some((link: Link) => {
            const spectrum = findSpectrum(
              spectraData,
              link.experimentID,
              true,
            ) as Spectrum2D;
            return findSignalMatch1D(
              spectrum,
              link,
              factor,
              xDomain0,
              xDomain1,
            );
          })
        ) {
          return true;
        }
      } else if (displayerMode === '2D') {
        if (!atomTypesInView.includes(correlation.atomType)) {
          return false;
        }
        const firstLink2D = correlation.link.find(
          (link: Link) => getLinkDim(link) === 2,
        );
        if (!firstLink2D) {
          return false;
        }
        const spectrum = findSpectrum(
          spectraData,
          firstLink2D.experimentID,
          true,
        ) as Spectrum2D;
        // correlation is represented by a 2D signal
        if (
          findSignalMatch2D(
            spectrum,
            firstLink2D,
            factor,
            xDomain0,
            xDomain1,
            yDomain0,
            yDomain1,
          )
        ) {
          return true;
        }
        // try to find a link which contains the belonging 2D signal in the spectra in view
        else if (
          correlation.link.some((link: any) => {
            const spectrum = findSpectrum(
              spectraData,
              link.experimentID,
              true,
            ) as Spectrum2D;
            return findSignalMatch2D(
              spectrum,
              link,
              factor,
              xDomain0,
              xDomain1,
              yDomain0,
              yDomain1,
            );
          })
        ) {
          return true;
        }
      }
      // do not show correlation
      return false;
    };

    if (correlationsData) {
      const _values = filterIsActive
        ? correlationsData.values.filter((correlation: any) =>
            isInView(correlation),
          )
        : correlationsData.values;

      return { ...correlationsData, values: _values };
    }
  }, [
    activeTab,
    correlationsData,
    displayerMode,
    filterIsActive,
    spectraData,
    xDomain,
    yDomain,
  ]);

  const additionalColumnTypes = useMemo(() => {
    const columnTypes = ['H', 'H-H'].concat(
      correlationsData
        ? correlationsData.values
            .map((correlation: any) => correlation.atomType)
            .filter(
              (atomType: any, i: any, array: any) =>
                atomType !== 'H' && array.indexOf(atomType) === i,
            )
        : [],
    );

    return columnTypes.map((columnType) => {
      return {
        label: columnType,
        value: columnType,
      };
    });
  }, [correlationsData]);

  useEffect(() => {
    const _selectedAdditionalColumnsAtomType =
      selectedAdditionalColumnsAtomType.split('-')[0];

    setAdditionalColumnData(
      filteredCorrelationsData
        ? filteredCorrelationsData.values
            .filter(
              (correlation: any) =>
                correlation.atomType === _selectedAdditionalColumnsAtomType,
            )
            // eslint-disable-next-line unicorn/no-array-reverse
            .reverse()
        : [],
    );
  }, [filteredCorrelationsData, selectedAdditionalColumnsAtomType]);

  const editEquivalencesSaveHandler = useCallback(
    (correlation: Correlation, value: number) => {
      dispatch({
        type: 'SET_CORRELATION',
        payload: {
          id: correlation.id,
          correlation: {
            ...correlation,
            equivalence: value,
            edited: { ...correlation.edited, equivalence: value !== 1 },
          },
        },
      });
    },
    [dispatch],
  );

  const editNumericValuesSaveHandler = useCallback(
    ({
      correlation,
      values,
      key,
    }: {
      correlation: Correlation;
      values: number[];
      key: 'hybridization' | 'protonsCount';
    }) => {
      dispatch({
        type: 'SET_CORRELATION',
        payload: {
          id: correlation.id,
          correlation: {
            ...correlation,
            [key]: values,
            edited: { ...correlation.edited, [key]: true },
          },
          options: {
            skipDataUpdate: true,
          },
        },
      });
    },
    [dispatch],
  );

  const setCorrelationsHandler = useCallback(
    (correlations: CorrelationValues, options?: CorrelationOptions) => {
      dispatch({
        type: 'SET_CORRELATIONS',
        payload: {
          correlations,
          options,
        },
      });
    },
    [dispatch],
  );

  const deleteCorrelationHandler = useCallback(
    (correlation: Correlation) => {
      const correlationLinks = correlation?.links;

      if (!(Array.isArray(correlationLinks) && correlationLinks.length > 0)) {
        return;
      }

      dispatch({
        type: 'DELETE_CORRELATION',
        payload: {
          correlation,
        },
      });
    },
    [dispatch],
  );

  const deleteSignalHandler = useCallback(
    (link: Link) => {
      // remove linking signal in spectrum
      const linkDim = getLinkDim(link);
      if (linkDim === 1) {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          false,
        ) as Spectrum1D;
        const range = findRange(spectrum, link.signal.id);
        const signal = findSignal1D(spectrum, link.signal.id);

        if (spectrum && range && signal) {
          dispatch({
            type: 'DELETE_1D_SIGNAL',
            payload: {
              spectrum,
              range,
              signal,
            },
          });
        }
      } else if (linkDim === 2) {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          false,
        ) as Spectrum2D;
        const zone = findZone(spectrum, link.signal.id);
        const signal = findSignal2D(spectrum, link.signal.id);

        if (zone && signal) {
          dispatch({
            type: 'DELETE_2D_SIGNAL',
            payload: {
              spectrum,
              zone,
              signal,
            },
          });
        }
      }
    },
    [dispatch, spectraData],
  );

  const changeSignalPathLengthHandler = useCallback(
    (link: Link) => {
      const linkDim = getLinkDim(link);
      if (linkDim === 2) {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          false,
        ) as Spectrum2D;
        const zone = findZone(spectrum, link.signal.id);
        const signal = findSignal2D(spectrum, link.signal.id);
        if (zone && signal) {
          dispatch({
            type: 'SET_2D_SIGNAL_PATH_LENGTH',
            payload: {
              spectrum,
              zone,
              signal,
              pathLength: link.signal.j?.pathLength,
            },
          });
        }
      }
    },
    [dispatch, spectraData],
  );

  const editCorrelationTableCellHandler = useCallback(
    (
      editedCorrelations: Correlation[],
      action: string,
      link?: Link,
      options?: CorrelationOptions,
    ) => {
      if (
        action === 'add' ||
        action === 'move' ||
        action === 'remove' ||
        action === 'unmove' ||
        action === 'setPathLength'
      ) {
        if (link && !link.pseudo) {
          if (action === 'remove') {
            deleteSignalHandler(link);
          } else if (action === 'setPathLength') {
            changeSignalPathLengthHandler(link);
          }
        }
        setCorrelationsHandler(editedCorrelations, options);
      } else if (action === 'removeAll') {
        deleteCorrelationHandler(editedCorrelations[0]);
      }
    },
    [
      changeSignalPathLengthHandler,
      deleteCorrelationHandler,
      deleteSignalHandler,
      setCorrelationsHandler,
    ],
  );

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const total = correlationsData ? correlationsData.values.length : 0;
  return (
    <Container>
      <EditLinkDialog onEdit={editCorrelationTableCellHandler} />
      <SetMolecularFormulaModal
        isOpen={dialog.molecularFormula}
        onClose={closeDialog}
      />
      <SetShiftToleranceModal
        isOpen={dialog.shiftToleranceModal}
        onClose={closeDialog}
      />
      <DefaultPanelHeader
        total={total}
        counter={filteredCorrelationsData?.values.length}
        onFilter={handleOnFilter}
        filterToolTip={
          filterIsActive
            ? 'Show all correlations'
            : 'Hide correlations out of view'
        }
        leftButtons={[
          {
            icon: <FaFlask />,
            tooltip: `Set molecular formula (${correlationsData?.options?.mf || ''})`,
            onClick: () => openDialog('molecularFormula'),
          },
          {
            icon: <FaSlidersH />,
            tooltip: 'Set shift tolerance',
            onClick: () => openDialog('shiftToleranceModal'),
          },
        ]}
      >
        <InnerHeader>
          <OverviewContainer>
            <Overview correlationsData={correlationsData} />
          </OverviewContainer>
          <SelectionContainer>
            <span>
              <SelectionLabel>View:</SelectionLabel>
              <Select
                onChange={(selection) => {
                  setSelectedAdditionalColumnsAtomType(selection);
                  if (selection === 'H-H') {
                    setShowProtonsAsRows(true);
                  } else {
                    setShowProtonsAsRows(false);
                  }
                }}
                items={additionalColumnTypes}
                defaultValue={selectedAdditionalColumnsAtomType}
                style={{
                  fontSize: '12px',
                  width: '70px',
                  height: '18px',
                  border: '1px solid grey',
                }}
              />
            </span>
          </SelectionContainer>
        </InnerHeader>
      </DefaultPanelHeader>
      <CorrelationTable
        correlationsData={correlationsData}
        filteredCorrelationsData={filteredCorrelationsData}
        additionalColumnData={additionalColumnData}
        editEquivalencesSaveHandler={editEquivalencesSaveHandler}
        onSaveEditNumericValues={editNumericValuesSaveHandler}
        onEditCorrelationTableCellHandler={editCorrelationTableCellHandler}
        showProtonsAsRows={showProtonsAsRows}
        spectraData={spectraData}
      />
    </Container>
  );
}

export default memo(SummaryPanel);
