import { lazy, memo } from 'react';

export const possibleViews = {
  Exam: memo(lazy(() => import('./Exam'))),
  Exercise: memo(lazy(() => import('./Exercise'))),
  SingleView: memo(lazy(() => import('./SingleView'))),
  Test: memo(lazy(() => import('./Test'))),
  View: memo(lazy(() => import('./View'))),
};
