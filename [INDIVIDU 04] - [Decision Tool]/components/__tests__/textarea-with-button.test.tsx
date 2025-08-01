import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TextareaWithButton } from '../textarea-with-button';

describe('TextareaWithButton', () => {
  it('renders textarea inside card', () => {
    render(<TextareaWithButton placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('renders action button with label and calls onClick', () => {
    const onClick = vi.fn();
    render(
      <TextareaWithButton
        action={{ label: 'Send', onClick }}
        placeholder="Type here..."
      />
    );
    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('forwards ref and props to textarea', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<TextareaWithButton ref={ref} data-testid="my-textarea" />);
    expect(screen.getByTestId('my-textarea')).toBeInstanceOf(HTMLTextAreaElement);
  });
});
