import styled from '@emotion/styled';

const DotWrapper = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;
const Halo = styled.span<{ color: string }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: ${({ color }) => color};
  opacity: 0.18;
`;

const Dot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;

export function ColorDot(props: { color: string }) {
  const { color } = props;
  return (
    <DotWrapper>
      <Halo color={color} />
      <Dot color={color} />
    </DotWrapper>
  );
}
