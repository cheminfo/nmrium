import { Icon, Switch, Tag, Tooltip } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useSelectedSpectra } from '../../../../hooks/useSelectedSpectra.ts';

const Container = styled.div<{ isActive: boolean; isDisabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  padding: 5px 10px;
  background: ${({ isActive }) =>
    isActive ? 'rgba(232, 98, 26, 0.07)' : 'rgba(0,0,0,0.03)'};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.4 : 1)};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'default')};
  user-select: none;
`;

const LabelGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
`;

const LabelIcon = styled(Icon)<{ isActive: boolean }>`
  color: ${({ isActive }) => (isActive ? '#E8621A' : '#888')};
  flex-shrink: 0;
`;

const LabelText = styled.span<{ isActive: boolean }>`
  font-size: 13px;
  color: ${({ isActive }) => (isActive ? '#C05215' : '#555')};
  white-space: nowrap;
`;

const StyledSwitch = styled(Switch)`
  margin: 0;
`;

const CountTag = styled(Tag)<{ isActive: boolean }>`
  color: ${({ isActive }) => (isActive ? '#E8621A' : '#666')} !important;
`;

export function ApplyToAllSelected() {
  const spectra = useSelectedSpectra();
  const { control, setValue } = useFormContext();
  const applyToAllSelected = useWatch({ control, name: 'applyToAll' });
  const selectedCount = spectra?.length || 0;
  const isDisabled = selectedCount < 2;
  const label =
    selectedCount === 0
      ? '0 selected'
      : selectedCount === 1
        ? '1 spectrum'
        : `${selectedCount} spectra`;

  const tooltipContent = isDisabled
    ? 'Select at least 2 spectra to apply color to all'
    : applyToAllSelected
      ? `Color will be applied to all ${selectedCount} selected spectra`
      : 'Enable to apply the chosen color to all selected spectra';
  return (
    <Tooltip content={tooltipContent} placement="top">
      <Container
        isActive={applyToAllSelected && !isDisabled}
        isDisabled={isDisabled}
        onClick={() =>
          !isDisabled && setValue('applyToAll', !applyToAllSelected)
        }
      >
        <LabelGroup>
          <LabelIcon
            icon="tint"
            size={14}
            isActive={applyToAllSelected && !isDisabled}
          />
          <LabelText isActive={applyToAllSelected && !isDisabled}>
            Apply to all selected
          </LabelText>
          <CountTag minimal round isActive={applyToAllSelected && !isDisabled}>
            {label}
          </CountTag>
        </LabelGroup>
        <Controller
          name="applyToAll"
          control={control}
          render={({ field }) => {
            const { value, onChange } = field;
            return (
              <StyledSwitch
                defaultChecked={value}
                checked={value}
                disabled={isDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  onChange(!e.currentTarget.checked);
                  e.stopPropagation();
                }}
              />
            );
          }}
        />
      </Container>
    </Tooltip>
  );
}
