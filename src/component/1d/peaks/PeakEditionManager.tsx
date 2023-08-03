import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useScaleChecked } from '../../context/ScaleContext';
import { useDispatch } from '../../context/DispatchContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import { useChartData } from '../../context/ChartContext';

const validationSchema = Yup.object({
  value: Yup.number().required(),
});

const InputDimension = { height: 28, width: 100 };

interface PeakEditionListenerProps {
  x: number;
  y: number;
  useScaleX?: boolean;
  useScaleY?: boolean;
  dx?: number;
  dy?: number;
  value: number;
  id: string;
}

interface PeaksEditionContextProps {
  onEdit: (
    e: React.MouseEvent,
    peak?: Required<PeakEditionListenerProps>,
  ) => void;
  id?: string;
}

const peaksEditionContext: PeaksEditionContextProps = {
  onEdit: () => {},
};

const PeaksEditionContext =
  createContext<PeaksEditionContextProps>(peaksEditionContext);

function usePeaksEditionManager() {
  const context = useContext(PeaksEditionContext);

  if (!context) {
    throw new Error('Peak edition manager context was not found');
  }
  return context;
}

function stopPropagation(e) {
  e.stopPropagation();
}

export function PeakEditionProvider({ children }) {
  const { scaleX, scaleY } = useScaleChecked();
  const { width } = useChartData();
  const spectrum = useActiveSpectrum();
  const [peak, setPeak] = useState<Required<PeakEditionListenerProps> | null>(
    null,
  );
  const dispatch = useDispatch();

  function getPosition() {
    let x = 0;
    let y = 0;

    if (!peak) {
      return { x, y };
    }

    const { x: px, y: py, dx, dy, useScaleX, useScaleY } = peak;
    x = px + dx;

    if (useScaleX) {
      x = scaleX()(px) + dx;
    }
    y = py + dy;
    if (useScaleY) {
      y = scaleY(spectrum?.id)(py) + dy;
    }

    if (x + InputDimension.width > width) {
      x = x - InputDimension.width;
    }

    return { x, y };
  }

  const handleOnEdit = useCallback<PeaksEditionContextProps['onEdit']>(
    (e, peak) => {
      e.stopPropagation();
      if (peak) {
        setPeak({ ...peak });
      } else {
        setPeak(null);
      }
    },
    [],
  );

  function keyDownCheck(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      return true;
    } else if (event.key === 'Escape') {
      setPeak(null);
      return false;
    }
  }
  function hanldeOnSubmit({ value }) {
    if (peak) {
      const shift = value - peak.value;
      dispatch({ type: 'SHIFT_SPECTRUM', payload: { shift } });
      setPeak(null);
    }
  }

  const editiionManagerState = useMemo<PeaksEditionContextProps>(
    () => ({ onEdit: handleOnEdit, id: peak?.id }),
    [peak?.id, handleOnEdit],
  );

  const { x, y } = getPosition();

  return (
    <PeaksEditionContext.Provider value={editiionManagerState}>
      <div onClick={() => setPeak(null)} style={{ position: 'relative' }}>
        {peak && (
          <div
            style={{
              position: 'absolute',
              display: 'block',
              transform: `translate(${x}px,${y}px)`,
            }}
          >
            <Formik
              initialValues={{ value: peak.value }}
              enableReinitialize
              onSubmit={hanldeOnSubmit}
              validationSchema={validationSchema}
            >
              {({ submitForm }) => (
                <FormikNumberInput
                  style={{ height: `${InputDimension.height}px` }}
                  name="value"
                  autoFocus
                  onKeyDown={(e) => keyDownCheck(e) && submitForm()}
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                />
              )}
            </Formik>
          </div>
        )}
        {children}
      </div>
    </PeaksEditionContext.Provider>
  );
}

export function PeakEditionListener(
  props: PeakEditionListenerProps & { children: ReactNode },
) {
  const {
    children,
    x,
    y,
    value,
    useScaleX = false,
    useScaleY = false,
    dx = 0,
    dy = -InputDimension.height,
    id,
  } = props;
  const { onEdit, id: editingPeakId } = usePeaksEditionManager();
  return (
    <g
      onClick={(e) =>
        onEdit(e, { x, y, value, useScaleX, useScaleY, dx, dy, id })
      }
    >
      {editingPeakId !== id && children}
    </g>
  );
}
