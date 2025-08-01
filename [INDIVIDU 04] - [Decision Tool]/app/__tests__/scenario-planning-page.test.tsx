
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScenarioPlanningPage from '../[locale]/scenario-planning/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('ScenarioPlanningPage', () => {
  it('renders the Scenario Planning page header', () => {
    renderWithProviders(<ScenarioPlanningPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
