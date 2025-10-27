export type ThemeId = 'dark' | 'light' | 'creativity' | 'love' | 'cozy';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  baseTheme: 'light' | 'dark';
  icon: string;
  backgroundPattern?: {
    path: string;
    opacity: number;
    size: number; // Size of each sticker in pixels
    spacing: number; // Spacing between stickers
    icons: string[]; // List of icon filenames
  };
}

export const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Classic dark theme',
    baseTheme: 'dark',
    icon: '🌙',
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Classic light theme',
    baseTheme: 'light',
    icon: '☀️',
  },
  {
    id: 'creativity',
    name: 'Creativity',
    description: 'Creative workspace with artistic icons',
    baseTheme: 'dark',
    icon: '🎨',
    backgroundPattern: {
      path: '/bg-stickers/4228672-creativity/svg',
      opacity: 0.4,
      size: 80,
      spacing: 140,
      icons: [
        '001-drawing tablet.svg',
        '002-creativity.svg',
        '003-creativity.svg',
        '004-creativity.svg',
        '005-creativity.svg',
        '006-creativity.svg',
        '007-creativity.svg',
        '008-creativity.svg',
        '009-creativity.svg',
        '010-tool.svg',
        '011-think different.svg',
        '012-paint.svg',
        '013-Paint tube.svg',
        '014-book.svg',
        '015-light bulb.svg',
        '016-brainstorm.svg',
        '017-drawing.svg',
        '018-creativity.svg',
        '019-rocket.svg',
        '020-learning.svg',
      ],
    },
  },
  {
    id: 'love',
    name: 'Love',
    description: 'Romantic theme with love icons',
    baseTheme: 'dark',
    icon: '💝',
    backgroundPattern: {
      path: '/bg-stickers/4383817-love/svg',
      opacity: 0.4,
      size: 80,
      spacing: 140,
      icons: [
        '001-love.svg',
        '002-love.svg',
        '003-love.svg',
        '004-love.svg',
        '005-love.svg',
        '006-love.svg',
        '007-love.svg',
        '008-love.svg',
        '009-love.svg',
        '010-love.svg',
        '011-love.svg',
        '012-love.svg',
        '013-love.svg',
        '014-love.svg',
        '015-love.svg',
        '016-love.svg',
        '017-love.svg',
        '018-love.svg',
        '019-love.svg',
        '020-love.svg',
      ],
    },
  },
  {
    id: 'cozy',
    name: 'Cozy Home',
    description: 'Warm and comfortable home theme',
    baseTheme: 'dark',
    icon: '🏠',
    backgroundPattern: {
      path: '/bg-stickers/4497794-stay-at-home/svg',
      opacity: 0.4,
      size: 80,
      spacing: 140,
      icons: [
        '001-stay at home.svg',
        '002-slippers.svg',
        '003-breakfast.svg',
        '004-macrame.svg',
        '005-blanket.svg',
        '006-candle.svg',
        '007-socks.svg',
        '008-teapot.svg',
        '009-yarn.svg',
        '010-candles.svg',
        '011-table lamp.svg',
        '012-drawers.svg',
        '013-sweater.svg',
        '014-turntable.svg',
        '015-fireplace.svg',
        '016-sleeping mask.svg',
        '017-pillows.svg',
        '018-time to sleep.svg',
        '019-plant pot.svg',
        '020-cat.svg',
      ],
    },
  },
];

export function getTheme(id: ThemeId): Theme {
  return themes.find((t) => t.id === id) || themes[0];
}
