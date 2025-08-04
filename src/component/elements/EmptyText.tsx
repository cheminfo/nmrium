import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import { FaRegEyeSlash } from 'react-icons/fa';

const EmptyContainer = styled.div`
  color: #6a6a6a;
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
`;

const Icon = styled(FaRegEyeSlash)`
  font-size: 1.1rem;
  margin: 0 10px;
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
