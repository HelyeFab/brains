import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Globe, ArrowLeft, ArrowRight, RotateCw, ExternalLink } from 'lucide-react';

interface BrowserWidgetProps {
  widgetId: string;
}

export function BrowserWidget({ widgetId }: BrowserWidgetProps) {
  const [url, setUrl] = useState('https://www.example.com');
  const [inputUrl, setInputUrl] = useState(url);

  const handleNavigate = () => {
    if (inputUrl && /^https?:\/\//i.test(inputUrl)) {
      setUrl(inputUrl);
      // In a real implementation, this would load the URL in a webview
      window.api?.browser?.open(inputUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Browser toolbar */}
      <div className="border-b border-border p-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL..."
            className="flex-1 bg-secondary px-3 py-1.5 rounded text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button variant="default" size="sm" onClick={handleNavigate}>
          Go
        </Button>
      </div>

      {/* Browser content area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Browser Widget</h3>
            <p className="text-muted-foreground">
              Enter a URL above and click "Go" to open it in a new window.
            </p>
            <p className="text-sm text-muted-foreground">
              Current URL: <span className="font-mono text-primary">{url}</span>
            </p>
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                Note: For security reasons, web pages open in separate windows. A future version could
                integrate a webview component here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
