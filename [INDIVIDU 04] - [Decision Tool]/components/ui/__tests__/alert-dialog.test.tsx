import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as AlertDialog from '../alert-dialog';

import { describe, it, expect, vi } from 'vitest';

describe('AlertDialog (composed)', () => {
  it('renders and is accessible', () => {
    render(
      <AlertDialog.AlertDialog open>
        <AlertDialog.AlertDialogContent>
          <AlertDialog.AlertDialogTitle>Alert!</AlertDialog.AlertDialogTitle>
          <AlertDialog.AlertDialogDescription>Something went wrong.</AlertDialog.AlertDialogDescription>
          <AlertDialog.AlertDialogAction>OK</AlertDialog.AlertDialogAction>
        </AlertDialog.AlertDialogContent>
      </AlertDialog.AlertDialog>
    );
    expect(screen.getByText('Alert!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby');
  });

  it('calls action when OK is clicked', () => {
    const onAction = vi.fn();
    render(
      <AlertDialog.AlertDialog open>
        <AlertDialog.AlertDialogContent>
          <AlertDialog.AlertDialogTitle>Alert!</AlertDialog.AlertDialogTitle>
          <AlertDialog.AlertDialogDescription>Error</AlertDialog.AlertDialogDescription>
          <AlertDialog.AlertDialogAction onClick={onAction}>OK</AlertDialog.AlertDialogAction>
        </AlertDialog.AlertDialogContent>
      </AlertDialog.AlertDialog>
    );
    fireEvent.click(screen.getByText('OK'));
    expect(onAction).toHaveBeenCalled();
  });
});
