import { Icon, PopoverNext } from '@blueprintjs/core';
import styled from '@emotion/styled';

const MixedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #854f0b;
  background: #faeeda;
  border: 0.5px solid #ef9f27;
  border-radius: 5px;
  padding: 3px 5px;
  cursor: default;
  flex-shrink: 0;
`;

const MixedTooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 0;
  font-size: 12px;
  border-bottom: 0.5px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const MixedTooltipValue = styled.span`
  font-weight: 500;
`;

const MixedTooltipHeader = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #8f99a8;
  margin-bottom: 6px;
`;

const MixedTooltipContent = styled.div`
  padding: 8px 12px;
  min-width: 200px;
`;

interface MixedValuesBadgeProps {
  values: Record<string, string>;
}

export function MixedValuesBadge({ values }: MixedValuesBadgeProps) {
  if (!values) return null;

  return (
    <PopoverNext
      placement="bottom"
      interactionKind="hover"
      renderTarget={({ ref, ...targetProps }) => (
        <MixedBadge ref={ref} {...targetProps}>
          <Icon icon="changes" size={12} />
        </MixedBadge>
      )}
      content={
        <MixedTooltipContent>
          <MixedTooltipHeader>Current values per spectrum</MixedTooltipHeader>
          {Object.entries(values).map(([spectrumId, val]) => (
            <MixedTooltipRow key={spectrumId}>
              <MixedTooltipValue>
                {val || <em style={{ color: '#adb5bd' }}>not set</em>}
              </MixedTooltipValue>
            </MixedTooltipRow>
          ))}
        </MixedTooltipContent>
      }
    />
  );
}
