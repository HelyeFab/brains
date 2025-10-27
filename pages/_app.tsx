import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@xterm/xterm/css/xterm.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryProvider } from '@/providers/QueryProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <Component {...pageProps} />
      </QueryProvider>
    </ErrorBoundary>
  );
}
