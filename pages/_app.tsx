import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@xterm/xterm/css/xterm.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
