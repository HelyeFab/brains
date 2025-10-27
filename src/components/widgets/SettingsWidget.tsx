import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Terminal, Palette, Type, Settings as SettingsIcon, Bot, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { themes, type ThemeId } from '@/config/themes';

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
  const { themeId, setTheme } = useThemeStore();
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

        {/* App Theme Settings */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">App Theme</h2>
                <p className="text-sm text-muted-foreground">
                  Choose your workspace theme and background
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${themeId === theme.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{theme.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{theme.name}</h3>
                        {themeId === theme.id && (
                          <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  {theme.backgroundPattern && (
                    <div className="mt-3 h-16 rounded border border-border overflow-hidden relative bg-background/50">
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-30">
                        {theme.backgroundPattern.icons.slice(0, 5).map((icon, i) => (
                          <img
                            key={i}
                            src={`${theme.backgroundPattern!.path}/${icon}`}
                            alt=""
                            className="h-8 w-8"
                            style={{ opacity: theme.backgroundPattern!.opacity * 10 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>

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

        {/* AI Chat Requirements */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">AI Chat Requirements</h2>
                <p className="text-sm text-muted-foreground">
                  Setup instructions for the AI Chat widget
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium">Ollama Installation Required</p>
                  <p className="text-sm text-muted-foreground">
                    The AI Chat widget requires Ollama to be installed and running on your system.
                    At least one model must be pulled before you can start chatting.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Quick Setup:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>
                    Install Ollama from{' '}
                    <a
                      href="https://ollama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      ollama.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Open a terminal and run: <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">ollama pull llama3.2</code></li>
                  <li>Verify Ollama is running: <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">ollama list</code></li>
                  <li>Create an AI Chat widget and start chatting!</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Popular models: llama3.2, mistral, codellama, phi3, gemma2
                </p>
              </div>
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
        data-font="Arial"
        data-text="Buy me a coffee"
        data-outline-color="#000000"
        data-font-color="#ffffff"
        data-coffee-color="#FFDD00"
        strategy="lazyOnload"
      />
    </div>
  );
}
