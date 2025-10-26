import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Palette, Type } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface TerminalWidgetProps {
  widgetId: string;
}

// Terminal themes
const terminalThemes = {
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    cursorAccent: '#282a36',
    selectionBackground: '#44475a',
    black: '#21222c',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff',
  },
  oneDark: {
    name: 'One Dark',
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#528bff',
    cursorAccent: '#ffffff',
    selectionBackground: '#3e4451',
    black: '#282c34',
    red: '#e06c75',
    green: '#98c379',
    yellow: '#e5c07b',
    blue: '#61afef',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#abb2bf',
    brightBlack: '#5c6370',
    brightRed: '#e06c75',
    brightGreen: '#98c379',
    brightYellow: '#e5c07b',
    brightBlue: '#61afef',
    brightMagenta: '#c678dd',
    brightCyan: '#56b6c2',
    brightWhite: '#ffffff',
  },
  nord: {
    name: 'Nord',
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    cursorAccent: '#2e3440',
    selectionBackground: '#4c566a',
    black: '#3b4252',
    red: '#bf616a',
    green: '#a3be8c',
    yellow: '#ebcb8b',
    blue: '#81a1c1',
    magenta: '#b48ead',
    cyan: '#88c0d0',
    white: '#e5e9f0',
    brightBlack: '#4c566a',
    brightRed: '#bf616a',
    brightGreen: '#a3be8c',
    brightYellow: '#ebcb8b',
    brightBlue: '#81a1c1',
    brightMagenta: '#b48ead',
    brightCyan: '#8fbcbb',
    brightWhite: '#eceff4',
  },
  solarizedDark: {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    cursor: '#839496',
    cursorAccent: '#002b36',
    selectionBackground: '#073642',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
  },
  monokai: {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    cursorAccent: '#272822',
    selectionBackground: '#49483e',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5',
  },
  tokyoNight: {
    name: 'Tokyo Night',
    background: '#1a1b26',
    foreground: '#c0caf5',
    cursor: '#c0caf5',
    cursorAccent: '#1a1b26',
    selectionBackground: '#283457',
    black: '#15161e',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
    white: '#a9b1d6',
    brightBlack: '#414868',
    brightRed: '#f7768e',
    brightGreen: '#9ece6a',
    brightYellow: '#e0af68',
    brightBlue: '#7aa2f7',
    brightMagenta: '#bb9af7',
    brightCyan: '#7dcfff',
    brightWhite: '#c0caf5',
  },
};

const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];

export function TerminalWidget({ widgetId }: TerminalWidgetProps) {
  console.log('=== TerminalWidget COMPONENT RENDER ===', widgetId);

  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof terminalThemes>('dracula');
  const [fontSize, setFontSize] = useState(14);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  console.log('Current state - theme:', currentTheme, 'fontSize:', fontSize);

  // Load settings from localStorage on mount
  useEffect(() => {
    console.log('TerminalWidget mounted, loading settings...');
    const savedTheme = localStorage.getItem('terminal-theme');
    const savedFontSize = localStorage.getItem('terminal-font-size');

    console.log('Saved theme from localStorage:', savedTheme);
    console.log('Saved fontSize from localStorage:', savedFontSize);

    if (savedTheme && savedTheme in terminalThemes) {
      console.log('Setting theme to:', savedTheme);
      setCurrentTheme(savedTheme as keyof typeof terminalThemes);
    }
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      console.log('Setting font size to:', size);
      setFontSize(size);
    }

    setSettingsLoaded(true);
  }, []);

  // Listen for settings changes from Settings widget
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const { theme, fontSize: newFontSize } = event.detail;
      if (theme && theme in terminalThemes) {
        setCurrentTheme(theme);
      }
      if (newFontSize) {
        setFontSize(newFontSize);
      }
    };

    window.addEventListener('terminal-settings-changed', handleSettingsChange as EventListener);

    return () => {
      window.removeEventListener('terminal-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    // Don't create terminal until settings are loaded
    if (!settingsLoaded) {
      console.log('Waiting for settings to load before creating terminal...');
      return;
    }

    console.log('Creating terminal with theme:', currentTheme, 'fontSize:', fontSize);

    let disposeTerminalListener: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    async function setup() {
      if (!containerRef.current || !window.api?.terminal) {
        setError('Terminal API not available');
        return;
      }

      try {
        // Spawn terminal backend
        const res = await window.api.terminal.spawn();
        if (!res?.ok) {
          setError(res?.error || 'Terminal backend unavailable');
          return;
        }

        // Create xterm instance
        const term = new Terminal({
          cursorBlink: true,
          allowProposedApi: true,
          fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
          fontSize: fontSize,
          theme: terminalThemes[currentTheme],
        });

        const fit = new FitAddon();
        term.loadAddon(fit);
        term.open(containerRef.current);
        fit.fit();

        // Send initial resize
        window.api.terminal.resize({ cols: term.cols, rows: term.rows });

        // Handle terminal input
        term.onData((data) => {
          window.api.terminal.write(data);
        });

        // Handle terminal output
        disposeTerminalListener = window.api.terminal.onData((data) => {
          term.write(data);
        });

        // Handle resize
        const handleResize = () => {
          try {
            fit.fit();
            window.api.terminal.resize({ cols: term.cols, rows: term.rows });
          } catch (err) {
            console.error('Resize error:', err);
          }
        };

        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);

        termRef.current = term;
        fitRef.current = fit;
        setIsReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize terminal';
        setError(message);
      }
    }

    setup();

    return () => {
      if (disposeTerminalListener) disposeTerminalListener();
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
        resizeObserver.disconnect();
      }
      try {
        termRef.current?.dispose();
      } catch (err) {
        console.error('Error disposing terminal:', err);
      }
    };
  }, [widgetId, currentTheme, fontSize, settingsLoaded]);

  // Show loading state while settings are being loaded
  if (!settingsLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">Loading terminal settings...</div>
          <div className="text-xs text-muted-foreground">Theme: {currentTheme} | Size: {fontSize}px</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Terminal Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">
            Make sure node-pty is installed and rebuilt for your Electron version:
            <br />
            <code className="bg-muted px-2 py-1 rounded mt-2 inline-block">
              npm install node-pty && npm run postinstall
            </code>
          </p>
        </Card>
      </div>
    );
  }

  const handleThemeChange = (themeKey: keyof typeof terminalThemes) => {
    setCurrentTheme(themeKey);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: terminalThemes[currentTheme].background }}
    >
      {/* Terminal toolbar */}
      <div
        className="border-b px-3 py-1.5 flex items-center justify-end gap-2"
        style={{
          backgroundColor: terminalThemes[currentTheme].background,
          borderColor: terminalThemes[currentTheme].brightBlack,
        }}
      >
        {/* Theme Selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-2 text-xs"
              style={{ color: terminalThemes[currentTheme].foreground }}
            >
              <Palette className="h-3 w-3" />
              {terminalThemes[currentTheme].name}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 z-50"
              sideOffset={5}
            >
              {Object.entries(terminalThemes).map(([key, theme]) => (
                <DropdownMenu.Item
                  key={key}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                  onSelect={() => handleThemeChange(key as keyof typeof terminalThemes)}
                >
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: theme.background }}
                  />
                  <span>{theme.name}</span>
                  {currentTheme === key && <span className="ml-auto">✓</span>}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Font Size Selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-2 text-xs"
              style={{ color: terminalThemes[currentTheme].foreground }}
            >
              <Type className="h-3 w-3" />
              {fontSize}px
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[120px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 z-50"
              sideOffset={5}
            >
              {fontSizes.map((size) => (
                <DropdownMenu.Item
                  key={size}
                  className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                  onSelect={() => handleFontSizeChange(size)}
                >
                  <span>{size}px</span>
                  {fontSize === size && <span className="ml-2">✓</span>}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex-1 overflow-hidden" ref={containerRef} />
    </div>
  );
}
