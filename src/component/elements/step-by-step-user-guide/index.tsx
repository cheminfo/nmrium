import {
  useRef,
  useState,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import Joyride, { Step } from 'react-joyride';

export type TargetElement = 'toolbar' | 'about' | 'step3';

export const STEPS: Readonly<Record<TargetElement, Omit<Step, 'target'>>> = {
  toolbar: {
    content: 'Click here to know about the project',
    placement: 'bottom',
    disableBeacon: true,
  },
  about: { content: 'This is the main toolbar', placement: 'right' },
  step3: {
    content: (
      <div>
        <span>
          Drop your <strong>Files</strong> here
        </span>
      </div>
    ),
    placement: 'top-start',
  },
};

export interface StepByStepUserGuideContextProps {
  registerStep: (element: HTMLElement | null, id: TargetElement) => void;
}

const StepByStepUserGuideInitialValues: StepByStepUserGuideContextProps = {
  registerStep: () => null,
};

const StepByStepUserGuideContext =
  createContext<StepByStepUserGuideContextProps>(
    StepByStepUserGuideInitialValues,
  );

export function useStepByStepUserGuide() {
  const context = useContext(StepByStepUserGuideContext);
  if (!context) {
    throw new Error('Step by step user guide context was not found');
  }
  return context;
}

export const StepByStepUserGuideProvider = ({ children }) => {
  const componentsRef = useRef<Record<string, HTMLElement>>({});
  const [steps, setSteps] = useState<Step[]>([]);
  const [isRun, run] = useState(false);

  const registerStep = useCallback(
    (element: HTMLElement | null, id: TargetElement) => {
      if (element) {
        componentsRef.current[id] = element;
      }
    },
    [],
  );

  useEffect(() => {
    const _steps = mapSteps(componentsRef.current);
    setSteps(_steps);
    run(true);
  }, []);

  const state = useMemo(() => ({ registerStep }), [registerStep]);

  return (
    <StepByStepUserGuideContext.Provider value={state}>
      <Joyride
        steps={steps}
        continuous
        run={isRun}
        scrollToFirstStep
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      {children}
    </StepByStepUserGuideContext.Provider>
  );
};

function mapSteps(components: Record<string, HTMLElement>) {
  return Object.entries(STEPS)
    .filter(([key]) => components[key])
    .map(([key, step]) => ({
      target: components[key],
      ...step,
    }));
}
