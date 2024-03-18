import { SvgNmrRangePicking } from 'cheminfo-font';
import { useCallback } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import { useCheckToolsVisibility } from '../../hooks/useCheckToolsVisibility';

export function SpectraAutomaticPickingButton() {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const { data } = useChartData();
  const isToolVisible = useCheckToolsVisibility();

  const automaticPickingHandler = useCallback(() => {
    void (async () => {
      const hideLoading = toaster.showLoading({
        message: 'Automatic Ranges/Zones detection for all spectra in progress',
      });
      setTimeout(() => {
        dispatch({ type: 'AUTO_RANGES_SPECTRA_PICKING' });
        dispatch({ type: 'AUTO_ZONES_SPECTRA_PICKING' });
        hideLoading();
      }, 0);
    })();
  }, [toaster, dispatch]);

  if (
    (Array.isArray(data) && data.length === 0) ||
    !isToolVisible('autoRangeAndZonePicking')
  ) {
    return null;
  }

  return (
    <Toolbar.Item
      icon={<SvgNmrRangePicking />}
      title="Automatic ranges/zones picking for all spectra"
      onClick={automaticPickingHandler}
    />
  );
}
