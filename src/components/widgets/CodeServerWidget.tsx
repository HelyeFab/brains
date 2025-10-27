import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Monitor, ArrowLeft, ArrowRight, RotateCw, ExternalLink, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useCodeServerStore } from '@/stores/useCodeServerStore';
import { cn } from '@/lib/utils';

interface CodeServerWidgetProps {
  widgetId: string;
}

// Extend Window interface to include webview element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

export function CodeServerWidget({ widgetId }: CodeServerWidgetProps) {
  const { serverUrl, setServerUrl } = useCodeServerStore();
  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const webviewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && (window as any).api?.browser;

  const handleSaveUrl = () => {
    setServerUrl(inputUrl);
    setShowSettings(false);
    // Force iframe reload with new URL
    if (!isElectron) {
      setIframeKey(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveUrl();
    }
  };

  const handleGoBack = () => {
    if (isElectron && webviewRef.current && canGoBack) {
      webviewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (isElectron && webviewRef.current && canGoForward) {
      webviewRef.current.goForward();
    }
  };

  const handleReload = () => {
    if (isElectron && webviewRef.current) {
      webviewRef.current.reload();
    } else {
      // Force iframe reload
      setIframeKey(prev => prev + 1);
    }
  };

  const handleOpenExternal = () => {
    if (serverUrl) {
      if (window.api?.browser) {
        window.api.browser.open(serverUrl);
      } else {
        window.open(serverUrl, '_blank');
      }
    }
  };

  // Set up webview event listeners (Electron only)
  useEffect(() => {
    if (!isElectron) return;

    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleLoadStop = () => {
      setIsLoading(false);
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };

    const handleDidNavigate = () => {
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };

    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-stop-loading', handleLoadStop);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigate);

    return () => {
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-stop-loading', handleLoadStop);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
    };
  }, [isElectron]);

  if (showSettings) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Code Server Settings</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="server-url" className="block text-sm font-medium mb-2">
                Server URL
              </label>
              <input
                id="server-url"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="http://localhost:8080"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the URL of your code-server instance
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveUrl} className="flex-1">
                Save & Connect
              </Button>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* CORS Warning for Browser Mode */}
      {!isElectron && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span className="text-yellow-700 dark:text-yellow-300">
            Browser mode: Some features may not work due to CORS restrictions. Use Electron app for full functionality.
          </span>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="h-12 border-b border-border bg-card px-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          disabled={!canGoBack || !isElectron}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoForward}
          disabled={!canGoForward || !isElectron}
          aria-label="Go forward"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReload}
          aria-label="Reload"
        >
          <RotateCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>

        <div className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{serverUrl}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenExternal}
          aria-label="Open in external browser"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Webview (Electron) or iframe (Browser) */}
      <div className="flex-1 relative">
        {isElectron ? (
          <webview
            ref={webviewRef}
            src={serverUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={serverUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            title="Code Server"
          />
        )}
      </div>
    </div>
  );
}
