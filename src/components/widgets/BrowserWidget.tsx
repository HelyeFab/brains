import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Globe, ArrowLeft, ArrowRight, RotateCw, ExternalLink, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrowserWidgetProps {
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

export function BrowserWidget({ widgetId }: BrowserWidgetProps) {
  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const webviewRef = useRef<any>(null);

  const handleNavigate = () => {
    if (!inputUrl) {
      return;
    }

    setError(''); // Clear previous errors

    if (!/^https?:\/\//i.test(inputUrl)) {
      // Auto-add https:// if missing
      const fullUrl = `https://${inputUrl}`;
      setInputUrl(fullUrl);
      setUrl(fullUrl);
      return;
    }

    setUrl(inputUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleGoBack = () => {
    if (webviewRef.current && canGoBack) {
      webviewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webviewRef.current && canGoForward) {
      webviewRef.current.goForward();
    }
  };

  const handleReload = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const handleHome = () => {
    setInputUrl('https://www.google.com');
    setUrl('https://www.google.com');
  };

  const handleOpenExternal = () => {
    if (url && window.api?.browser) {
      window.api.browser.open(url);
    }
  };

  // Set up webview event listeners
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError('');
    };

    const handleLoadStop = () => {
      setIsLoading(false);
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };

    const handleDidNavigate = (e: any) => {
      setInputUrl(e.url);
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
      setError('');
    };

    const handleDidFailLoad = (e: any) => {
      setIsLoading(false);
      // Filter out -3 (aborted) errors which are normal when navigating away
      if (e.errorCode !== -3 && e.errorCode !== 0) {
        let errorMessage = '';
        switch (e.errorCode) {
          case -105:
            errorMessage = 'Cannot resolve domain name. Please check the URL and try again.';
            break;
          case -106:
            errorMessage = 'No internet connection detected.';
            break;
          case -109:
            errorMessage = 'Invalid URL. Please check the address.';
            break;
          case -501:
            errorMessage = 'Insecure content blocked. Try using HTTPS.';
            break;
          default:
            errorMessage = `Failed to load page (Error ${e.errorCode}): ${e.errorDescription || 'Unknown error'}`;
        }
        setError(errorMessage);
      }
    };

    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-stop-loading', handleLoadStop);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigate);
    webview.addEventListener('did-fail-load', handleDidFailLoad);

    return () => {
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-stop-loading', handleLoadStop);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
      webview.removeEventListener('did-fail-load', handleDidFailLoad);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Browser toolbar */}
      <div className="border-b border-border p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={!canGoBack}
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoForward}
          disabled={!canGoForward}
          title="Forward"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReload}
          title="Reload"
        >
          <RotateCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleHome}
          title="Home"
        >
          <Home className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL..."
            className="flex-1 bg-secondary px-3 py-1.5 rounded text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handleNavigate}
        >
          Go
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenExternal}
          title="Open in new window"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Browser webview */}
      <div className="flex-1 relative">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-md">
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg shadow-lg">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="text-xs mt-1 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <webview
          ref={webviewRef}
          src={url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    </div>
  );
}
