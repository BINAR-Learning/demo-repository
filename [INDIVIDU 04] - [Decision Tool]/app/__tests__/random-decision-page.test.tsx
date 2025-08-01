
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RandomDecisionPage from '../[locale]/random-decision/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('RandomDecisionPage', () => {
  it('renders the Random Decision page header', () => {
    renderWithProviders(<RandomDecisionPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
