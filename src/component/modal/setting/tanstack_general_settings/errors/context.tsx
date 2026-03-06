import { useStore } from '@tanstack/react-form';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { assert, withForm } from 'react-science/ui';

import {
  defaultGeneralSettingsFormValues,
  workspaceValidation,
} from '../validation.ts';

const GeneralSettingsErrorsIsOpenContext = createContext<boolean | null>(null);
const GeneralSettingsErrorsSetIsOpenContext = createContext<Dispatch<
  SetStateAction<boolean>
> | null>(null);
const GeneralSettingsErrorsCountContext = createContext<number | null>(null);

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

    return (
      <GeneralSettingsErrorsCountContext.Provider value={errorsCount}>
        <GeneralSettingsErrorsSetIsOpenContext.Provider value={setIsOpen}>
          <GeneralSettingsErrorsIsOpenContext.Provider value={isOpen}>
            {children}
          </GeneralSettingsErrorsIsOpenContext.Provider>
        </GeneralSettingsErrorsSetIsOpenContext.Provider>
      </GeneralSettingsErrorsCountContext.Provider>
    );
  },
});

export function useErrorsIsOpen() {
  const context = useContext(GeneralSettingsErrorsIsOpenContext);

  assert(
    typeof context === 'boolean',
    'useErrorsIsOpen must be used within a GeneralSettingsErrorsOpenProvider',
  );

  return context;
}

export function useErrorsDispatch() {
  const context = useContext(GeneralSettingsErrorsSetIsOpenContext);

  assert(
    typeof context === 'function',
    'useErrorsDispatch must be used within a GeneralSettingsErrorsOpenProvider',
  );

  return context;
}

export function useErrorsCount() {
  const context = useContext(GeneralSettingsErrorsCountContext);

  assert(
    typeof context === 'number',
    'useErrorsCount must be used within a GeneralSettingsErrorsOpenProvider',
  );

  return context;
}
