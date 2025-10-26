import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Terminal, Palette, Type, Settings as SettingsIcon } from 'lucide-react';

interface SettingsWidgetProps {
  widgetId: string;
}

// Terminal themes
const terminalThemes = {
  dracula: { name: 'Dracula', preview: '#282a36' },
  oneDark: { name: 'One Dark', preview: '#282c34' },
  nord: { name: 'Nord', preview: '#2e3440' },
  solarizedDark: { name: 'Solarized Dark', preview: '#002b36' },
  monokai: { name: 'Monokai', preview: '#272822' },
  tokyoNight: { name: 'Tokyo Night', preview: '#1a1b26' },
};

const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];

export function SettingsWidget({ widgetId }: SettingsWidgetProps) {
  const [terminalTheme, setTerminalTheme] = useState<keyof typeof terminalThemes>('dracula');
  const [terminalFontSize, setTerminalFontSize] = useState(14);

  // Load settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('terminal-theme');
    const savedFontSize = localStorage.getItem('terminal-font-size');

    if (savedTheme && savedTheme in terminalThemes) {
      setTerminalTheme(savedTheme as keyof typeof terminalThemes);
    }
    if (savedFontSize) {
      setTerminalFontSize(parseInt(savedFontSize, 10));
    }
  }, []);

  const handleThemeChange = (theme: keyof typeof terminalThemes) => {
    setTerminalTheme(theme);
    localStorage.setItem('terminal-theme', theme);
    console.log('Saved terminal theme:', theme);
    // Dispatch custom event to notify terminal widgets
    window.dispatchEvent(new CustomEvent('terminal-settings-changed', {
      detail: { theme, fontSize: terminalFontSize }
    }));
  };

  const handleFontSizeChange = (size: number) => {
    setTerminalFontSize(size);
    localStorage.setItem('terminal-font-size', size.toString());
    console.log('Saved terminal font size:', size);
    // Dispatch custom event to notify terminal widgets
    window.dispatchEvent(new CustomEvent('terminal-settings-changed', {
      detail: { theme: terminalTheme, fontSize: size }
    }));
  };

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure your workspace preferences
            </p>
          </div>
        </div>

        {/* Terminal Settings */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Terminal className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Terminal Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Customize your terminal appearance
                </p>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Color Theme</label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(terminalThemes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key as keyof typeof terminalThemes)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                      ${terminalTheme === key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <div
                      className="w-8 h-8 rounded border border-border flex-shrink-0"
                      style={{ backgroundColor: theme.preview }}
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium">{theme.name}</div>
                      {terminalTheme === key && (
                        <div className="text-xs text-primary">Active</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Font Size</label>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {fontSizes.map((size) => (
                  <Button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    variant={terminalFontSize === size ? 'default' : 'outline'}
                    className="h-10"
                  >
                    {size}px
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Current size: <span className="font-semibold">{terminalFontSize}px</span>
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Changes will apply to newly opened terminal widgets. Close and reopen existing terminals to see updates.
              </p>
            </div>
          </div>
        </Card>

        {/* Future Settings Sections */}
        <Card className="p-6 border-dashed">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">More settings coming soon...</p>
            <p className="text-xs mt-1">Future sections: Appearance, Keyboard Shortcuts, Notifications</p>
          </div>
        </Card>

        {/* Support Section */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Support Development</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you enjoy using Brains, consider supporting its development
            </p>
            <div className="flex justify-center">
              <div id="bmc-button-container" />
            </div>
          </div>
        </Card>
      </div>

      <Script
        src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
        data-name="bmc-button"
        data-slug="YbEwc5qvHT"
        data-color="#5F7FFF"
        data-emoji=""
        data-font="Cookie"
        data-text="Buy me a coffee"
        data-outline-color="#000000"
        data-font-color="#ffffff"
        data-coffee-color="#FFDD00"
        strategy="lazyOnload"
      />
    </div>
  );
}
