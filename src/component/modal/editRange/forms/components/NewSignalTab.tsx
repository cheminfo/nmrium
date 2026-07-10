import { revalidateLogic } from '@tanstack/react-form';
import type { Range } from '@zakodium/nmr-types';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AppForm, useForm } from 'react-science/ui';
import { z } from 'zod/v4';
import type { CheckParams } from 'zod/v4/core';

import { useTabsController } from '../../../../elements/TabsProvider.js';
import { useActiveNucleusTab } from '../../../../hooks/useActiveNucleusTab.js';
import { usePanelPreferences } from '../../../../hooks/usePanelPreferences.js';
import { useEvent } from '../../../../utility/Events.js';
import { formatNumber } from '../../../../utility/formatNumber.js';

const styles: Record<
  'container' | 'innerContainer' | 'infoText',
  CSSProperties
> = {
  container: {
    padding: '0.4rem',
  },
  innerContainer: {
    width: '70%',
    display: 'block',
    margin: 'auto',
  },
  infoText: {
    padding: '10px 0',
    fontSize: '13px',
    textAlign: 'start',
  },
};

interface NewSignalTabProps {
  range: Range;
}

export function NewSignalTab(props: NewSignalTabProps) {
  const { range } = props;
  const { setValue } = useFormContext();
  const { selectedTabId: signalIndex, selectTab } = useTabsController();
  const { signals } = useWatch();
  const activeTab = useActiveNucleusTab();
  const { tablePreferences } = usePanelPreferences('ranges', activeTab);

  const schemaFormValidation = useMemo(() => {
    return getSignalValidationSchema(range);
  }, [range]);

  function saveHandler({ delta }: z.infer<typeof schemaFormValidation>) {
    const newSignal = {
      multiplicity: 'm',
      kind: 'signal',
      delta,
      js: [{ multiplicity: 'm', coupling: '' }],
    };

    const _signals = [...signals, newSignal];
    setValue('signals', _signals);
    selectTab(_signals.length - 1);
  }

  const form = useForm({
    defaultValues: {
      delta: String((range.from + range.to) / 2),
    },
    onSubmit: ({ value }) => {
      const parsedValues = schemaFormValidation.parse(value);
      saveHandler(parsedValues);
    },
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    validators: {
      onDynamic: schemaFormValidation,
    },
  });

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (signalIndex === -1 && shiftKey) {
        form.reset({ delta: String(xPPM) });
      }
    },
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (signalIndex === -1 && shiftKey) {
        form.reset({ delta: String((to - from) / 2 + from) });
      }
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <AppForm
          form={form}
          onSubmitMeta={(event) => {
            event.stopPropagation();
          }}
        >
          <form.AppField name="delta">
            {(field) => (
              <field.NumericInput
                autoFocus
                placeholder="𝛅(ppm)"
                label="Edit or select a delta value of new signal"
                helpText={`Value should be in range [${formatNumber(
                  range.from,
                  tablePreferences.from.format,
                )} ppm - ${formatNumber(range.to, tablePreferences.to.format)} ppm]`}
              />
            )}
          </form.AppField>

          <form.SubmitButton intent="success">Add a signal</form.SubmitButton>
        </AppForm>
      </div>
    </div>
  );
}

function getSignalValidationSchema(range: Range) {
  const params: CheckParams = {
    error: (ctx) => {
      const input = Number(ctx.input);
      return `${input.toFixed(5)} ppm out of the range`;
    },
  };

  return z.object({
    delta: z.coerce
      .number<string>()
      .min(range.from, params)
      .max(range.to, params),
  });
}
