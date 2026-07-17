import type { Spectrum } from '@zakodium/nmrium-core';

interface GetViewSpectraOptions<S extends Spectrum> {
  data: S[];
  spectrumLiveProcessed: S | undefined;
}

/**
 * Return all spectra, with `spectrumLiveProcessed` replacing the related spectrum in data.
 */
export function getViewSpectra<S extends Spectrum>(
  state: GetViewSpectraOptions<S>,
) {
  const { data, spectrumLiveProcessed } = state;

  if (!spectrumLiveProcessed) return data;

  return data.map((s) =>
    s.id === spectrumLiveProcessed.id ? spectrumLiveProcessed : s,
  );
}
