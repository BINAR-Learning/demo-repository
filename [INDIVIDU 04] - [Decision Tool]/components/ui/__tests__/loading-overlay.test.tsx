import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { LoadingOverlay } from '../../loading-overlay';

describe('LoadingOverlay', () => {
  it('renders and is visible', () => {
    render(<LoadingOverlay text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeVisible();
  });

  it('has appropriate aria attributes', () => {
    render(<LoadingOverlay text="Loading..." />);
    const overlay = screen.getByRole('alert');
    expect(overlay).toHaveAttribute('aria-busy', 'true');
  });
});
