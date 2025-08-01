import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

// Import after mocks

import { TooltipProvider } from '@/components/ui/tooltip';
import ShareUrlButton from '../share-url-button';

import { Tools } from '@/lib/toolsConfig';
import * as utils from '@/lib/utils';

describe('ShareUrlButton', () => {
  it('renders and copies generated URL to clipboard on click', async () => {
    const tool: Tools = 'decisionMatrix';
    const fakeData = { foo: 'bar' };
    const fakeUrl = 'https://example.com/share?lz=1&data=abc';
    vi.spyOn(utils, 'getDataByTool').mockReturnValue(fakeData);
    vi.spyOn(utils, 'createShareUrl').mockReturnValue(fakeUrl);
    render(
      <TooltipProvider>
        <ShareUrlButton tool={tool} label="Share" />
      </TooltipProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);
    expect(utils.getDataByTool).toHaveBeenCalledWith(tool);
    expect(utils.createShareUrl).toHaveBeenCalledWith(fakeData);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(fakeUrl);
  });

  it('shows warning message in tooltip if provided', async () => {
    render(
      <TooltipProvider>
        <ShareUrlButton tool="decisionMatrix" warningMessage="Test warning" />
      </TooltipProvider>
    );
    // Open the tooltip by focusing the button
    const button = screen.getByRole('button');
    button.focus();
    // Wait for tooltip content to appear
    expect(await screen.findByText('Test warning')).toBeInTheDocument();
  });

  it('shows label and icon', () => {
    render(
      <TooltipProvider>
        <ShareUrlButton tool="decisionMatrix" label="Share this" />
      </TooltipProvider>
    );
    expect(screen.getByText('Share this')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });
});
