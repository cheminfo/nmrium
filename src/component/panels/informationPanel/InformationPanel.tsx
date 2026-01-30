import type { TooltipProps } from '@blueprintjs/core';
import { useMemo } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { TbTableShortcut } from 'react-icons/tb';
import type { InfoPanelData } from 'react-science/ui';
import { InfoPanel, Toolbar } from 'react-science/ui';

import { usePreferences } from '../../context/PreferencesContext.tsx';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.ts';
import { useDialogToggle } from '../../hooks/useDialogToggle.ts';
import useSpectrum from '../../hooks/useSpectrum.js';
import { booleanToString } from '../../utility/booleanToString.ts';

import { InformationEditionModal } from './InformationEditionModal.tsx';

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
    return 'Select a spectrum to edit its meta information';
  }
  return 'Edit spectrum meta information';
}

export function InformationPanel() {
  const { info, meta, customInfo } = useSpectrum(emptyData);
  const activeSpectrum = useActiveSpectrum();
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

  const toolTipProps: Omit<TooltipProps, 'content'> = {
    intent: !activeSpectrum ? 'danger' : 'none',
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
              disabled={!activeSpectrum}
              tooltipProps={toolTipProps}
              icon={<TbTableShortcut />}
              onClick={handleToggleInformationBlock}
              active={infoBlock.visible}
              tooltip={getToggleInformationBlock(
                infoBlock.visible,
                !!activeSpectrum,
              )}
            />
            <Toolbar.Item
              disabled={!activeSpectrum}
              tooltipProps={toolTipProps}
              icon={<FaRegEdit />}
              onClick={() => {
                openDialog('informationModal');
              }}
              tooltip={getEditTooltip(!!activeSpectrum)}
            />
          </Toolbar>
        }
        data={data}
        title=""
      />
    </>
  );
}
