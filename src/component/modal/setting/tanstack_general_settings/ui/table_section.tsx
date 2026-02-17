import styled from '@emotion/styled';
import type { ReactNode } from 'react';

const Section = styled.section`
  margin-top: 15px;
  gap: 5px;
  display: flex;
  flex-direction: column;

  > header {
    display: flex;
    flex-direction: column;

    > h2 {
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.75rem;
    }
  }
`;

const Actions = styled.div`
  float: right;
  display: flex;
  gap: 0.5em;
`;

interface TableSectionProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}
export function TableSection(props: TableSectionProps) {
  const { title, description, actions, children } = props;

  return (
    <Section>
      <header>
        <h2>
          {actions && <Actions>{actions}</Actions>}
          {title}
        </h2>
        {description && <p>{description}</p>}
      </header>

      {children}
    </Section>
  );
}
