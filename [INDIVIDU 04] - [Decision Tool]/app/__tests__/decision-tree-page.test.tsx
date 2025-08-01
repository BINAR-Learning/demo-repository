
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DecisionTreePage from '../[locale]/decision-tree/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('DecisionTreePage', () => {
  it('renders the Decision Tree page header', () => {
    renderWithProviders(<DecisionTreePage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
