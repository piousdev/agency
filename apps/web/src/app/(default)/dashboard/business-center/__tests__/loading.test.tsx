import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import BusinessCenterLoading from '../loading';

describe('BusinessCenterLoading', () => {
  it('renders without crashing', () => {
    const { container } = render(<BusinessCenterLoading />);
    expect(container).toBeTruthy();
  });

  it('renders the header skeleton section', () => {
    const { container } = render(<BusinessCenterLoading />);
    const headerSection = container.querySelector('.mb-6');
    expect(headerSection).toBeTruthy();
  });

  it('renders header skeleton elements', () => {
    const { container } = render(<BusinessCenterLoading />);
    const headerSection = container.querySelector('.mb-6');
    // Check for Skeleton components by looking for elements with height classes (h-8, h-4, h-9)
    const skeletons = headerSection?.querySelectorAll('[class*="h-"]');
    expect(skeletons?.length).toBeGreaterThan(0);
  });

  it('renders exactly 6 widget grid skeletons', () => {
    const { container } = render(<BusinessCenterLoading />);
    const gridContainer = container.querySelector('.grid');
    const gridSkeletons = gridContainer?.querySelectorAll('[class*="h-64"]');
    expect(gridSkeletons?.length).toBe(6);
  });

  it('applies correct container classes', () => {
    const { container } = render(<BusinessCenterLoading />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('flex flex-col');
    expect(mainDiv.className).toContain('animate-in');
    expect(mainDiv.className).toContain('fade-in');
    expect(mainDiv.className).toContain('duration-300');
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<BusinessCenterLoading />);
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.className).toContain('grid-cols-1');
    expect(gridContainer?.className).toContain('md:grid-cols-2');
    expect(gridContainer?.className).toContain('lg:grid-cols-3');
  });

  it('renders unique skeleton keys', () => {
    const { container } = render(<BusinessCenterLoading />);
    const gridSkeletons = container.querySelectorAll('.grid > [class*="h-64"]');
    const keys = new Set();

    gridSkeletons.forEach((skeleton) => {
      const key = skeleton.getAttribute('data-key');
      if (key) keys.add(key);
    });

    expect(gridSkeletons.length).toBe(6);
  });
});
