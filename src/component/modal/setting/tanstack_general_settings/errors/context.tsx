import { useStore } from '@tanstack/react-form';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { assert, withForm } from 'react-science/ui';

import {
  defaultGeneralSettingsFormValues,
  workspaceValidation,
} from '../validation.ts';

interface GeneralSettingsErrors {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  count: number;
}

const GeneralSettingsErrorsContext =
  createContext<GeneralSettingsErrors | null>(null);

interface GeneralSettingsErrorsOpenProvider {
  children: ReactNode;
}
const defaultProps: GeneralSettingsErrorsOpenProvider = {
  children: null,
};

export const GeneralSettingsErrorsOpenProvider = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  validators: { onDynamic: workspaceValidation },
  props: defaultProps,
  render: function GeneralSettingsErrorsOpenProvider({ form, children }) {
    const [isOpen, setIsOpen] = useState(false);

    const submitCount = useStore(form.store, (s) => s.submissionAttempts);
    const previousSubmitCount = useRef(submitCount);
    const errorsCount = useStore(form.store, (s) => {
      const recordErrors = s.errorMap.onDynamic;
      if (!recordErrors) return 0;

      let count = 0;
      for (const errors of Object.values(recordErrors)) {
        count += errors.length;
      }

      return count;
    });

    // open errors after submitting if there are errors
    useEffect(() => {
      if (previousSubmitCount.current === submitCount) return;
      previousSubmitCount.current = submitCount;

      if (errorsCount === 0) return;

      setIsOpen(true);
    }, [errorsCount, submitCount]);

    // close errors if all fixed
    useEffect(() => {
      if (errorsCount !== 0) return;

      setIsOpen(false);
    }, [errorsCount]);

    const contextValue = useMemo(
      () => ({ isOpen, setIsOpen, count: errorsCount }),
      [errorsCount, isOpen],
    );

    return (
      <GeneralSettingsErrorsContext.Provider value={contextValue}>
        {children}
      </GeneralSettingsErrorsContext.Provider>
    );
  },
});

export function useErrors() {
  const context = useContext(GeneralSettingsErrorsContext);

  assert(
    context,
    'useErrors must be used within a GeneralSettingsErrorsOpenProvider',
  );

  return context;
}
