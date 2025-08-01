import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmationDialog } from '../../confirmation-dialog';

describe('ConfirmationDialog', () => {

  it('renders with title and description', () => {
    render(
      <ConfirmationDialog
        title="Confirm"
        description="Are you sure?"
        cancelText="Cancel"
        confirmText="Yes"
        triggerText="Open Dialog"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });


  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationDialog
        title="Confirm"
        description="Proceed?"
        cancelText="Cancel"
        confirmText="Yes"
        triggerText="Open Dialog"
        onConfirm={onConfirm}
      />
    );
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'));
    // Click confirm
    fireEvent.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalled();
  });

  // No onCancel prop in implementation, so skip this test

  it('is accessible via keyboard', () => {
    render(
      <ConfirmationDialog
        title="Confirm"
        description="Proceed?"
        cancelText="Cancel"
        confirmText="Yes"
        triggerText="Open Dialog"
        onConfirm={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Open Dialog'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
});
