import {
  Button,
  Checkbox,
  Icon,
  InputGroup,
  PopoverNext,
} from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useState } from 'react';

import { useSelectedSpectra } from '../../hooks/useSelectedSpectra.ts';

const COLORS = {
  borderLight: '#DCE3EB',
  borderLighter: '#EDF0F3',
  textPrimary: '#1C2127',
  textSecondary: '#5F6B7C',
  textMuted: '#8F99A8',
  blue: '#215DB0',
  blueBg: '#EBF4FF',
  blueBorder: '#C5DCFF',
  blueDark: '#1B4E96',
  greenBg: '#D3F9D8',
  greenText: '#116329',
  orangeBg: '#FFF0E6',
};

const SpectraTrigger = styled.button<{ active?: boolean; disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid ${(p) => (p.active ? COLORS.blue : COLORS.borderLight)};
  background: ${(p) => (p.active ? COLORS.blueBg : '#f8fafc')};
  font-size: 12px;
  color: ${(p) => (p.active ? COLORS.blue : COLORS.textSecondary)};
  font-family: inherit;
  white-space: nowrap;
  width: 100%;
  justify-content: space-between;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    border-color: ${COLORS.blue};
    background: ${COLORS.blueBg};
    color: ${COLORS.blue};
  }
`;

const CountBadge = styled.span<{ variant: 'all' | 'some' | 'none' }>`
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  background: ${(p) =>
    p.variant === 'all'
      ? COLORS.greenBg
      : p.variant === 'some'
        ? COLORS.blueBg
        : '#F0F4F8'};
  color: ${(p) =>
    p.variant === 'all'
      ? COLORS.greenText
      : p.variant === 'some'
        ? COLORS.blue
        : COLORS.textMuted};
`;

const PickerWrap = styled.div`
  width: 252px;
  display: flex;
  flex-direction: column;
`;

const PickerHeader = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid ${COLORS.borderLighter};
`;

const PickerActions = styled.div`
  padding: 4px 10px 6px;
  border-bottom: 1px solid ${COLORS.borderLighter};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PickerLink = styled.button`
  background: none;
  border: none;
  color: ${COLORS.blue};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const PickerCount = styled.span`
  margin-left: auto;
  font-size: 11px;
  color: ${COLORS.textMuted};
  font-weight: 500;
`;

const PickerList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  padding: 4px 0;
`;

const PickerItem = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 13px;
  color: ${COLORS.textPrimary};
  background: ${(p) => (p.$checked ? '#f5f9ff' : 'transparent')};

  &:hover {
    background: #f5f9ff;
  }
`;

const PickerFooter = styled.div`
  padding: 8px 10px;
  border-top: 1px solid ${COLORS.borderLighter};
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  background: #f8fafc;
`;

function SpectraPickerContent({
  selected,
  onApply,
  onClose,
}: {
  selected: string[];
  onApply: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<string[]>(selected);
  const spectra = useSelectedSpectra() || [];

  const filtered = spectra.filter((spectrum) =>
    spectrum.info.name.toLowerCase().includes(query.toLowerCase()),
  );

  function toggle(id: string, checked: boolean) {
    setPending((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  return (
    <PickerWrap>
      <PickerHeader>
        <InputGroup
          round
          size="small"
          leftIcon="search"
          placeholder="Search spectra…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </PickerHeader>
      <PickerActions>
        <PickerLink onClick={() => setPending(spectra.map((s) => s.id))}>
          Select all
        </PickerLink>
        <PickerLink onClick={() => setPending([])}>Clear all</PickerLink>
        <PickerCount>
          {pending.length} / {spectra.length}
        </PickerCount>
      </PickerActions>
      <PickerList>
        {filtered.map((s) => (
          <PickerItem key={s.id} $checked={pending.includes(s.id)}>
            <Checkbox
              style={{ margin: 0 }}
              checked={pending.includes(s.id)}
              onChange={(e) => toggle(s.id, e.target.checked)}
            />
            {s.info.name}
          </PickerItem>
        ))}
      </PickerList>
      <PickerFooter>
        <Button size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="small"
          intent="primary"
          onClick={() => {
            onApply(pending);
            onClose();
          }}
        >
          Apply
        </Button>
      </PickerFooter>
    </PickerWrap>
  );
}

export function SpectraPicker({
  selected,
  onChange,
  disabled = false,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const spectra = useSelectedSpectra() || [];
  const selectedTotal = selected.length;
  const total = spectra.length;
  const variant: 'all' | 'some' | 'none' =
    selectedTotal === total ? 'all' : selectedTotal === 0 ? 'none' : 'some';
  const label =
    selectedTotal === total
      ? `all ${total}`
      : selectedTotal === 0
        ? 'none'
        : `${selectedTotal} / ${total}`;

  return (
    <PopoverNext
      lazy
      isOpen={disabled ? false : open}
      onInteraction={setOpen}
      placement="bottom-start"
      arrow={false}
      animation="minimal"
      content={
        <SpectraPickerContent
          selected={selected}
          onApply={onChange}
          onClose={() => setOpen(false)}
        />
      }
    >
      <SpectraTrigger
        disabled={disabled}
        active={open}
        onClick={() => setOpen(true)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CountBadge variant={variant}>{label}</CountBadge>
        </span>
        <Icon icon="caret-down" size={12} />
      </SpectraTrigger>
    </PopoverNext>
  );
}
