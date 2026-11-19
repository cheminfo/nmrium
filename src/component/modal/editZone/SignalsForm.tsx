import {
  Button,
  Classes,
  HTMLTable,
  Icon,
  Tag,
  Tooltip,
} from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useField } from '@tanstack/react-form';
import { noop } from '@zakodium/utils';
import { useId } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { withForm } from 'react-science/ui';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths.js';
import { SIGNAL_KINDS } from '../../../data/constants/signalsKinds.js';
import IsotopesViewer from '../../elements/IsotopesViewer.js';
import type { ZoneData } from '../../panels/ZonesPanel/hooks/useMapZones.js';
import {
  CellActions,
  CellActionsButton,
} from '../setting/tanstack_general_settings/ui/cell_actions.js';

import { defaultZoneFormValues, zoneFormSchema } from './zoneForm.js';

const signalNumericFields = [
  { property: 'x.delta', label: 'F2' },
  { property: 'y.delta', label: 'F1' },
  { property: 'j.pathLength.from', label: 'Minimum path length' },
  { property: 'j.pathLength.to', label: 'Maximum path length' },
] as const;

export const SignalsForm = withForm({
  defaultValues: defaultZoneFormValues,
  validators: { onDynamic: zoneFormSchema },
  props: { zone: {} as ZoneData },
  render: function Render({ form, zone }) {
    const titleId = useId();
    const signals = useField({ form, name: 'signals', mode: 'array' });
    const fields = signals.state.value;

    function handleAddSignal() {
      const x = (zone.x.from + zone.x.to) / 2;
      const y = (zone.y.from + zone.y.to) / 2;
      const pathLength = zone.tableMetaInfo.experiment
        ? DefaultPathLengths[zone.tableMetaInfo.experiment]
        : undefined;
      signals.pushValue({
        id: crypto.randomUUID(),
        kind: 'signal',
        sign: 0,
        x: { delta: x, originalDelta: x },
        y: { delta: y, originalDelta: y },
        j: {
          pathLength: {
            from: pathLength?.from ?? 1,
            to: pathLength?.to ?? 1,
          },
        },
      });
    }

    return (
      <section aria-labelledby={titleId}>
        <SectionHeader>
          <div>
            <SectionTitle>
              <Heading id={titleId}>Signals</Heading>
              <Tag minimal round aria-label={`${fields.length} signals`}>
                {fields.length}
              </Tag>
            </SectionTitle>
            <SectionHint>
              <Icon icon="info-sign" size={12} />
              At least one signal is required.
            </SectionHint>
          </div>
          <Button
            icon="plus"
            variant="outlined"
            intent="primary"
            size="small"
            onClick={handleAddSignal}
          >
            Add signal
          </Button>
        </SectionHeader>
        <TableContainer className="signals-table-container">
          <SignalsTable aria-label="Zone signals">
            <colgroup>
              <col style={{ width: 40 }} />
              <col style={{ width: '23%' }} />
              <col span={4} />
              <col style={{ width: 36 }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} aria-label="Signal number">
                  #
                </th>
                <th scope="col" rowSpan={2}>
                  Kind
                </th>
                <th scope="colgroup" colSpan={2}>
                  Chemical shift (ppm)
                </th>
                <th scope="colgroup" colSpan={2}>
                  J-coupling path length
                </th>
                <th scope="col" rowSpan={2} aria-label="Actions" />
              </tr>
              <tr>
                {(['F2', 'F1'] as const).map((axis, index) => (
                  <th key={axis} scope="col">
                    <AxisHeading>
                      {axis}
                      <IsotopesViewer
                        value={zone.tableMetaInfo.nuclei[index]}
                      />
                    </AxisHeading>
                  </th>
                ))}
                <th scope="col" title="Minimum J-coupling path length">
                  Min.
                </th>
                <th scope="col" title="Maximum J-coupling path length">
                  Max.
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <SignalRow
                  key={field.id}
                  form={form}
                  index={index}
                  canDelete={fields.length > 1}
                  onDelete={() => signals.removeValue(index)}
                />
              ))}
            </tbody>
          </SignalsTable>
        </TableContainer>
      </section>
    );
  },
});

interface SignalRowProps {
  index: number;
  canDelete: boolean;
  onDelete: () => void;
}

const defaultSignalRowProps: SignalRowProps = {
  index: 0,
  canDelete: false,
  onDelete: noop,
};

const SignalRow = withForm({
  defaultValues: defaultZoneFormValues,
  validators: { onDynamic: zoneFormSchema },
  props: defaultSignalRowProps,
  render: ({ form, index, canDelete, onDelete }) => (
    <tr>
      <th scope="row">
        <SignalNumber>{index + 1}</SignalNumber>
      </th>
      <td>
        <form.AppField name={`signals[${index}].kind`}>
          {(kindField) => (
            <kindField.Select
              items={SIGNAL_KINDS}
              renderButton={({ selectedOption }) => (
                <Button
                  variant="outlined"
                  size="small"
                  aria-label={`Signal ${index + 1} kind`}
                  endIcon="double-caret-vertical"
                  onBlur={kindField.handleBlur}
                  fill
                >
                  {selectedOption?.label ?? 'Select kind'}
                </Button>
              )}
            />
          )}
        </form.AppField>
      </td>
      {signalNumericFields.map(({ property, label }) => (
        <td key={property}>
          <SignalInput
            form={form}
            index={index}
            property={property}
            label={label}
          />
        </td>
      ))}
      <td>
        <CellActions>
          <CellActionsButton
            intent="danger"
            variant="minimal"
            aria-label={`Delete signal ${index + 1}`}
            title={
              !canDelete
                ? 'A zone must contain at least one signal'
                : `Delete signal ${index + 1}`
            }
            disabled={!canDelete}
            onClick={onDelete}
          >
            <FaRegTrashAlt className={Classes.ICON} />
          </CellActionsButton>
        </CellActions>
      </td>
    </tr>
  ),
});

interface SignalInputProps {
  index: number;
  property: (typeof signalNumericFields)[number]['property'];
  label: string;
}

const defaultSignalInputProps: SignalInputProps = {
  index: 0,
  property: 'x.delta',
  label: '',
};

const SignalInput = withForm({
  defaultValues: defaultZoneFormValues,
  validators: { onDynamic: zoneFormSchema },
  props: defaultSignalInputProps,
  render: function Render({ form, index, property, label }) {
    const errorId = useId();
    const isPathLength = property.startsWith('j.');

    return (
      <form.AppField name={`signals[${index}].${property}`}>
        {(field) => {
          const error = field.state.meta.errors
            .map((issue) => issue?.message)
            .find(Boolean);

          return (
            <SignalInputContainer>
              <Tooltip
                content={error}
                disabled={!error}
                intent="danger"
                placement="top"
                targetTagName="div"
              >
                <field.NumericInput
                  aria-label={`Signal ${index + 1} ${label}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  fill
                  size="small"
                  buttonPosition="none"
                  min={isPathLength ? 1 : undefined}
                  step={isPathLength ? 1 : 0.01}
                  majorStepSize={1}
                  minorStepSize={isPathLength ? 1 : 0.001}
                />
              </Tooltip>
              {error && <AccessibleError id={errorId}>{error}</AccessibleError>}
            </SignalInputContainer>
          );
        }}
      </form.AppField>
    );
  },
});

const SignalInputContainer = styled.div`
  .${Classes.FORM_HELPER_TEXT} {
    display: none;
  }

  .${Classes.POPOVER_TARGET} {
    display: block;
    width: 100%;
  }
`;

const AccessibleError = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

const TableContainer = styled.div`
  max-height: 300px;
  overflow: auto;
  border: 1px solid #dce0e5;
  border-radius: 6px;
`;

const AxisHeading = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
`;

const SectionHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Heading = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const SectionHint = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  color: #5f6b7c;
  font-size: 12px;
`;

const SignalNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: #5f6b7c;
  background: #edf0f3;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const SignalsTable = styled(HTMLTable)`
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
  font-variant-numeric: tabular-nums;

  .${Classes.FORM_GROUP} {
    min-height: 0;
    gap: 0;
  }

  .${Classes.FORM_GROUP} > div {
    min-width: 0;
    width: 100%;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f6f7f9;
  }

  th,
  td {
    vertical-align: middle;
    box-shadow: none;
    overflow-wrap: anywhere;
  }

  && th,
  && td {
    padding: 5px;
  }

  thead th {
    text-align: center;
    color: #5f6b7c;
    font-size: 12px;
    font-weight: 600;
  }

  tbody tr {
    border-top: 1px solid #e5e8eb;
  }

  tbody tr:hover {
    background: #f9fafb;
  }

  tbody th,
  td:last-child {
    text-align: center;
  }
`;
