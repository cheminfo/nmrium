import { Formik } from 'formik';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import * as Yup from 'yup';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useScaleChecked } from '../../context/ScaleContext';
import FormikInput from '../../elements/formik/FormikInput';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';

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

  const editiionManagerState = useMemo<PeaksEditionContextProps>(
    () => ({ onEdit: handleOnEdit, id: peak?.id }),
    [peak?.id, handleOnEdit],
  );

  const { x, y } = getPosition();

  return (
    <PeaksEditionContext.Provider value={editiionManagerState}>
      <div
        onClick={() => setPeak(null)}
        onContextMenu={() => setPeak(null)}
        style={{ position: 'relative' }}
      >
        {peak && (
          <div
            style={{
              position: 'absolute',
              display: 'block',
              transform: `translate(${x}px,${y}px)`,
            }}
          >
            <PeakEditionField
              key={peak.id}
              value={peak.value}
              onClose={() => setPeak(null)}
            />
          </div>
        )}
        {children}
      </div>
    </PeaksEditionContext.Provider>
  );
}

interface PeakFieldProps {
  value: number;
  onClose: () => void;
}

function PeakEditionField({ value, onClose }: PeakFieldProps) {
  const dispatch = useDispatch();

  function keyDownCheck(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      return true;
    } else if (event.key === 'Escape') {
      onClose();
      return false;
    }
  }
  function hanldeOnSubmit({ value: newValue }) {
    if (value) {
      const shift = newValue - value;
      dispatch({ type: 'SHIFT_SPECTRUM', payload: { shift } });
      onClose();
    }
  }

  return (
    <Formik
      initialValues={{ value }}
      onSubmit={hanldeOnSubmit}
      validationSchema={validationSchema}
    >
      {({ submitForm }) => (
        <FormikInput
          type="number"
          style={{
            input: {
              height: `${InputDimension.height}px`,
              padding: '5px',
              outline: 'none',
            },
          }}
          name="value"
          autoSelect
          onKeyDown={(e) => keyDownCheck(e) && submitForm()}
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
        />
      )}
    </Formik>
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
