import { DrawContourResult } from 'ml-conrec';
import { Spectrum2D } from 'nmr-load-save';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { drawContours } from '../../../data/data2d/Spectrum2D/contours';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';

interface Contour {
  positive: DrawContourResult<'basic'>;
  negative: DrawContourResult<'basic'>;
}

type Contours = Record<string, Contour>;

const ContoursContext = createContext<Contours>({});

interface ContoursProviderProps {
  children: ReactNode;
}

function getContours(spectrum: Spectrum2D, negative = false) {
  //TODO change the static contour options.
  return drawContours(
    spectrum,
    {
      contourLevels: [0, 100],
      numberOfLayers: 10,
    },
    negative,
  );
}

export function ContoursProvider({ children }: ContoursProviderProps) {
  const spectra = useSpectraByActiveNucleus() as Spectrum2D[];

  // TODO: Move the contour options from the `display` object within the spectrum object to `view` to prevent recalculating the contours when those options change.
  const contours = useMemo(() => {
    const contours: Contours = {};
    for (const spectrum of spectra) {
      const {
        id,
        info: { isFt },
      } = spectrum;

      if (!isFt) {
        continue;
      }

      const positive = getContours(spectrum);
      const negative = getContours(spectrum, true);
      contours[id] = { positive, negative };
    }
    return contours;
  }, [spectra]);

  return (
    <ContoursContext.Provider value={contours}>
      {children}
    </ContoursContext.Provider>
  );
}

export function useContours() {
  const context = useContext(ContoursContext);

  if (!context) {
    throw new Error('Contours context was not found');
  }

  return context;
}
