import { splitColorAlpha, THEMES } from './themes';
import { SCRIMS } from './backgrounds';

describe('splitColorAlpha', () => {
  it('moves the alpha out of an rgba colour', () => {
    expect(splitColorAlpha('rgba(8,10,14,0.30)')).toEqual({ color: 'rgb(8, 10, 14)', opacity: 0.3 });
    expect(splitColorAlpha('rgba(255, 0, 0, 1)')).toEqual({ color: 'rgb(255, 0, 0)', opacity: 1 });
  });

  it('handles eight-digit hex', () => {
    const { color, opacity } = splitColorAlpha('#0b1f1cff');
    expect(color).toBe('#0b1f1c');
    expect(opacity).toBeCloseTo(1);
  });

  it('leaves an opaque colour alone', () => {
    expect(splitColorAlpha('#0b1f1c')).toEqual({ color: '#0b1f1c', opacity: 1 });
    expect(splitColorAlpha('white')).toEqual({ color: 'white', opacity: 1 });
  });
});

describe('the scrims stay see-through', () => {
  /**
   * The whole job of a scrim is to darken a photograph just enough to read text
   * over it. Painted at full opacity it hides the photograph completely, which
   * is exactly what a hard-coded stopOpacity of 1 used to do.
   */
  it.each(Object.entries(SCRIMS))('%s is translucent at every stop', (_kind, gradient) => {
    for (const [, raw] of gradient.stops) {
      const { opacity } = splitColorAlpha(raw);
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThan(1);
    }
  });
});

describe('theme gradients', () => {
  it('are opaque, so a theme fills the card', () => {
    for (const theme of THEMES) {
      for (const [, raw] of theme.gradient.stops) {
        expect(splitColorAlpha(raw).opacity, `${theme.id} ${raw}`).toBe(1);
      }
    }
  });
});
