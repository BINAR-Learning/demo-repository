
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SeeResultButton } from '../see-result-button';

describe('SeeResultButton', () => {
  it('renders with label and calls onClick', () => {
    const onClick = vi.fn();
    render(
      <SeeResultButton
        loading={false}
        disabled={false}
        onClick={onClick}
        label="See Result"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('See Result');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('shows loader when loading', () => {
    render(
      <SeeResultButton
        loading={true}
        disabled={false}
        onClick={() => {}}
        label="See Result"
      />
    );
    // Loader2 does not have data-testid, so check for SVG presence
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('is disabled when loading or disabled', () => {
    const { rerender } = render(
      <SeeResultButton
        loading={true}
        disabled={false}
        onClick={() => {}}
        label="See Result"
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
    rerender(
      <SeeResultButton
        loading={false}
        disabled={true}
        onClick={() => {}}
        label="See Result"
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
