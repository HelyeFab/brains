import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatBytes, formatPercentage } from '@/lib/utils';
import { Activity, Cpu, HardDrive, Pause, Play, Zap, Timer, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdaptivePolling, useThrottledValue } from '@/hooks/useAdaptivePolling';
import { useWidgetStore } from '@/stores/useWidgetStore';
import type { SystemMetrics } from '@/types';

interface SystemMonitorWidgetProps {
  widgetId: string;
}

interface DataPoint {
  time: string;
  cpu: number;
  memory: number;
}

export function SystemMonitorWidget({ widgetId }: SystemMonitorWidgetProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<DataPoint[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  // Get active widget status
  const activeWidgetId = useWidgetStore((state) => state.activeWidgetId);
  const isActive = activeWidgetId === widgetId;

  // Use adaptive polling
  const {
    pollRate,
    isPaused,
    interval,
    setPollRate,
    togglePause,
    recordActivity,
  } = useAdaptivePolling({
    initialRate: 'normal',
    pauseWhenInactive: true,
    isActive,
  });

  // Throttle CPU core updates for better performance
  const throttledCores = useThrottledValue(metrics?.cpu.cores || [], 500);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!window.api?.system) return;

      try {
        // Get initial snapshot
        const snapshot = await window.api.system.getSnapshot();
        if (snapshot?.ok && mounted) {
          setMetrics(snapshot.data!);
        }

        // Subscribe to updates with adaptive interval
        if (!isPaused && interval > 0) {
          unsubRef.current = await window.api.system.subscribe(interval, (data) => {
            if (!mounted) return;

            setMetrics(data);

            // Add to history (keep last 30 data points)
            setHistory((prev) => {
              const newPoint: DataPoint = {
                time: new Date().toLocaleTimeString(),
                cpu: data.cpu.currentLoad,
                memory: (data.mem.used / data.mem.total) * 100,
              };

              const updated = [...prev, newPoint];
              return updated.slice(-30);
            });
          });
        }
      } catch (err) {
        console.error('Failed to initialize system monitor:', err);
      }
    }

    // Clean up old subscription before creating new one
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!isPaused && isActive) {
      init();
    }

    return () => {
      mounted = false;
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, [widgetId, interval, isPaused, isActive]);

  if (!metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading system metrics...</div>
      </div>
    );
  }

  const cpuLoad = metrics.cpu.currentLoad;
  const memUsed = metrics.mem.used;
  const memTotal = metrics.mem.total;
  const memPercent = (memUsed / memTotal) * 100;

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold">System Monitor</h2>
        </div>

        {/* Polling controls */}
        <div className="flex items-center gap-2" role="toolbar" aria-label="Polling controls">
          {/* Poll rate controls */}
          <div className="flex gap-1 bg-muted rounded-md p-1" role="group" aria-label="Poll rate">
            <Button
              size="sm"
              variant={pollRate === 'fast' ? 'default' : 'ghost'}
              onClick={() => {
                setPollRate('fast');
                recordActivity();
              }}
              className="h-7 px-2"
              aria-label="Fast polling (250ms)"
              aria-pressed={pollRate === 'fast'}
            >
              <Zap className="h-3 w-3" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant={pollRate === 'normal' ? 'default' : 'ghost'}
              onClick={() => {
                setPollRate('normal');
                recordActivity();
              }}
              className="h-7 px-2"
              aria-label="Normal polling (1s)"
              aria-pressed={pollRate === 'normal'}
            >
              <Timer className="h-3 w-3" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant={pollRate === 'slow' ? 'default' : 'ghost'}
              onClick={() => {
                setPollRate('slow');
                recordActivity();
              }}
              className="h-7 px-2"
              aria-label="Slow polling (5s)"
              aria-pressed={pollRate === 'slow'}
            >
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>

          {/* Pause/Play control */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              togglePause();
              recordActivity();
            }}
            className="h-7 px-2"
            aria-label={isPaused ? 'Resume polling' : 'Pause polling'}
          >
            {isPaused ? (
              <Play className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Pause className="h-3 w-3" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {isPaused && (
        <div className="bg-muted text-muted-foreground text-sm px-4 py-2 rounded-md flex items-center justify-between" role="status">
          <span>Polling paused</span>
          <Button size="sm" variant="ghost" onClick={() => {
            togglePause();
            recordActivity();
          }} aria-label="Resume polling">
            Resume
          </Button>
        </div>
      )}

      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-live="polite" aria-atomic="false">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`CPU usage ${formatPercentage(cpuLoad)}`}>
              {formatPercentage(cpuLoad)}
            </div>
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden" role="progressbar" aria-valuenow={cpuLoad} aria-valuemin={0} aria-valuemax={100} aria-label="CPU usage">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, cpuLoad)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              User: {formatPercentage(metrics.cpu.currentLoadUser)} | System:{' '}
              {formatPercentage(metrics.cpu.currentLoadSystem)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`Memory usage ${formatPercentage(memPercent)}`}>
              {formatPercentage(memPercent)}
            </div>
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden" role="progressbar" aria-valuenow={memPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Memory usage">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, memPercent)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatBytes(memUsed)} / {formatBytes(memTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label="CPU and memory usage history chart showing usage over time">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="CPU %"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Memory %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CPU Cores */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Cores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="list" aria-label="CPU core usage">
            {throttledCores.map((load, idx) => (
              <div key={idx} className="space-y-2" role="listitem">
                <div className="text-sm font-medium">Core {idx + 1}</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden" role="progressbar" aria-valuenow={load} aria-valuemin={0} aria-valuemax={100} aria-label={`Core ${idx + 1} usage`}>
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.min(100, load)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{formatPercentage(load)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
