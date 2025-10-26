import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Card } from '@/components/ui/Card';

interface TerminalWidgetProps {
  widgetId: string;
}

export function TerminalWidget({ widgetId }: TerminalWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
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
          fontSize: 14,
          theme: {
            background: '#0a0a0a',
            foreground: '#e0e0e0',
            cursor: '#00ff00',
            black: '#000000',
            red: '#ff5555',
            green: '#50fa7b',
            yellow: '#f1fa8c',
            blue: '#bd93f9',
            magenta: '#ff79c6',
            cyan: '#8be9fd',
            white: '#bfbfbf',
            brightBlack: '#4d4d4d',
            brightRed: '#ff6e67',
            brightGreen: '#5af78e',
            brightYellow: '#f4f99d',
            brightBlue: '#caa9fa',
            brightMagenta: '#ff92d0',
            brightCyan: '#9aedfe',
            brightWhite: '#e6e6e6',
          },
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
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize terminal');
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
  }, [widgetId]);

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

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      <div className="flex-1 overflow-hidden" ref={containerRef} />
    </div>
  );
}
