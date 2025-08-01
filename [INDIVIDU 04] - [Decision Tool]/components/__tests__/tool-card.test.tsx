import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ToolCard } from '../tool-card';


const TestIcon = (props: any) => <svg data-testid="icon" {...props} />;
const defaultProps = {
  title: 'Decision Matrix',
  description: 'Compare options by criteria',
  icon: TestIcon,
  link: '/test',
};

describe('ToolCard', () => {
  it('renders title, description, and icon', () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByText('Decision Matrix')).toBeInTheDocument();
    expect(screen.getByText('Compare options by criteria')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders a link with the correct href', () => {
    render(<ToolCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: /start/i });
    expect(link).toHaveAttribute('href', '/test');
  });
});
