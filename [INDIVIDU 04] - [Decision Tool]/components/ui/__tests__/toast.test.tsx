import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Toast } from '../toast';

describe('Toast', () => {
  it('renders with children and variant', () => {
    render(<Toast variant="default">Saved!</Toast>);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('applies correct class for destructive variant', () => {
    const { container } = render(<Toast variant="destructive">Error!</Toast>);
    expect(container.firstChild).toHaveClass('destructive');
  });

  it('is accessible', () => {
    render(<Toast variant="default">Accessible</Toast>);
    // Radix Toast uses role="status" for accessibility
    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
  });
});
