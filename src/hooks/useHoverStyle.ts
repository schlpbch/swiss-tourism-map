/**
 * Hook for consistent hover style handling
 * Replaces inline onMouseEnter/onMouseLeave/onMouseOver/onMouseOut handlers
 */

import type { CSSProperties } from 'react';

type HoverStyleProperty = 'backgroundColor' | 'boxShadow';

interface HoverConfig {
  property: HoverStyleProperty;
  defaultValue: string;
  hoverValue: string;
}

// Preset configurations for common hover patterns
const PRESETS = {
  /** SBB red button hover effect */
  'button-red': {
    property: 'backgroundColor' as const,
    defaultValue: 'var(--sbb-color-red)',
    hoverValue: 'var(--sbb-color-red125)',
  },
  /** Card elevation hover effect */
  'card': {
    property: 'boxShadow' as const,
    defaultValue: '0 1px 3px rgba(0, 0, 0, 0.05)',
    hoverValue: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  /** Filter button hover (milk background) */
  'button-secondary': {
    property: 'backgroundColor' as const,
    defaultValue: 'var(--sbb-color-milk)',
    hoverValue: 'var(--sbb-color-cloud)',
  },
} as const;

type PresetName = keyof typeof PRESETS;

type MouseHandler = (e: React.MouseEvent<HTMLElement>) => void;

interface HoverHandlers {
  onMouseEnter: MouseHandler;
  onMouseLeave: MouseHandler;
  /** Alias for onMouseEnter (for components using onMouseOver) */
  onMouseOver: MouseHandler;
  /** Alias for onMouseLeave (for components using onMouseOut) */
  onMouseOut: MouseHandler;
}

/**
 * Returns mouse event handlers for hover style effects
 *
 * @param preset - A preset name ('button-red', 'card', 'button-secondary') or custom config
 * @returns Object with onMouseEnter and onMouseLeave handlers
 *
 * @example
 * // Using a preset
 * const hoverHandlers = useHoverStyle('button-red');
 * <button {...hoverHandlers}>Click me</button>
 *
 * @example
 * // Using a custom config
 * const hoverHandlers = useHoverStyle({
 *   property: 'backgroundColor',
 *   defaultValue: '#fff',
 *   hoverValue: '#eee'
 * });
 */
export function useHoverStyle(preset: PresetName | HoverConfig): HoverHandlers {
  const config = typeof preset === 'string' ? PRESETS[preset] : preset;

  const onEnter: MouseHandler = (e) => {
    (e.currentTarget.style as CSSProperties & Record<string, string>)[config.property] = config.hoverValue;
  };

  const onLeave: MouseHandler = (e) => {
    (e.currentTarget.style as CSSProperties & Record<string, string>)[config.property] = config.defaultValue;
  };

  return {
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    onMouseOver: onEnter,
    onMouseOut: onLeave,
  };
}

/**
 * Conditional hover - only applies hover effect when condition is true
 *
 * @param preset - Preset name or custom config
 * @param condition - When false, handlers do nothing
 */
export function useConditionalHoverStyle(
  preset: PresetName | HoverConfig,
  condition: boolean
): HoverHandlers {
  const config = typeof preset === 'string' ? PRESETS[preset] : preset;

  const onEnter: MouseHandler = (e) => {
    if (condition) {
      (e.currentTarget.style as CSSProperties & Record<string, string>)[config.property] = config.hoverValue;
    }
  };

  const onLeave: MouseHandler = (e) => {
    if (condition) {
      (e.currentTarget.style as CSSProperties & Record<string, string>)[config.property] = config.defaultValue;
    }
  };

  return {
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    onMouseOver: onEnter,
    onMouseOut: onLeave,
  };
}

export default useHoverStyle;
