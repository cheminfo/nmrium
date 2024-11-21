import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import { FaRegEyeSlash } from 'react-icons/fa';

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  color: #6a6a6a;
  padding: 1.5rem 0;
`;

const Icon = styled(FaRegEyeSlash)`
  margin: 0 10px;
  font-size: 1.1rem;
`;
const Text = styled.span`
  font-size: 0.8rem;
`;
interface EmptyTextProps {
  text: string;
  style?: { text?: CSSProperties; icon?: CSSProperties };
}

export function EmptyText(props: EmptyTextProps) {
  const { text, style = { text: {}, icon: {} } } = props;
  return (
    <EmptyContainer>
      <Icon style={style.icon} />
      <Text style={style.text}>{text}</Text>
    </EmptyContainer>
  );
}
