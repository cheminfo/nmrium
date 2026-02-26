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
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.75rem;
    }
  }
`;

const Actions = styled.div`
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
          {title}
          {actions && <Actions>{actions}</Actions>}
        </h2>
        {description && <p>{description}</p>}
      </header>

      {children}
    </Section>
  );
}
