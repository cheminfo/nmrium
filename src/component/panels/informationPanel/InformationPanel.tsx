import type { TooltipProps } from '@blueprintjs/core';
import { useMemo } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { TbTableShortcut } from 'react-icons/tb';
import type { InfoPanelData } from 'react-science/ui';
import { InfoPanel, Toolbar } from 'react-science/ui';

import { usePreferences } from '../../context/PreferencesContext.js';
import { useActiveSpectra } from '../../hooks/useActiveSpectra.ts';
import { useDialogToggle } from '../../hooks/useDialogToggle.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { booleanToString } from '../../utility/booleanToString.js';

import { InformationEditionModal } from './InformationEditionModal.js';

const emptyData = { info: {}, meta: {} };

function getToggleInformationBlock(
  isVisible: boolean,
  isSpectrumSelected: boolean,
) {
  if (!isSpectrumSelected) {
    return 'Select a spectrum to display the information block';
  }

  return `${booleanToString(!isVisible, { trueLabel: 'Display' })} information block}`;
}

function getEditTooltip(isSpectrumSelected: boolean) {
  if (!isSpectrumSelected) {
    return 'Select a one or more spectra to edit their metadata';
  }
  return 'Edit metadata for the selected spectra';
}

export function InformationPanel() {
  const { info, meta, customInfo } = useSpectrum(emptyData);
  const activeSpectra = useActiveSpectra();

  const {
    dispatch,
    current: { infoBlock },
  } = usePreferences();
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    informationModal: false,
  });
  const data: InfoPanelData[] = useMemo(
    () => [
      { description: 'Custom information', data: customInfo || {} },
      { description: 'Spectrum information', data: info || {} },
      { description: 'Other spectrum parameters', data: meta || {} },
    ],
    [customInfo, info, meta],
  );

  const tooltipProps: Omit<TooltipProps, 'content'> = {
    intent: !activeSpectra ? 'danger' : 'none',
  };

  function handleToggleInformationBlock() {
    dispatch({
      type: 'TOGGLE_INFORMATION_BLOCK',
      payload: {},
    });
  }

  return (
    <>
      <InformationEditionModal
        isOpen={dialog.informationModal}
        onCloseDialog={closeDialog}
      />
      <InfoPanel
        leftElement={
          <Toolbar>
            <Toolbar.Item
              disabled={!activeSpectra || activeSpectra.length > 1}
              tooltipProps={tooltipProps}
              icon={<TbTableShortcut />}
              onClick={handleToggleInformationBlock}
              active={infoBlock.visible}
              tooltip={getToggleInformationBlock(
                infoBlock.visible,
                !!activeSpectra,
              )}
            />
            <Toolbar.Item
              disabled={!activeSpectra || activeSpectra.length === 0}
              tooltipProps={tooltipProps}
              icon={<FaRegEdit />}
              onClick={() => {
                openDialog('informationModal');
              }}
              tooltip={getEditTooltip(!!activeSpectra)}
            />
          </Toolbar>
        }
        data={data}
        title=""
      />
    </>
  );
}
