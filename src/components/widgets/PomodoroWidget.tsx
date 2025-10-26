import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Pause, RotateCcw, Timer, Coffee, BriefcaseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroWidgetProps {
  widgetId: string;
}

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

const DURATIONS = {
  work: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export function PomodoroWidget({ widgetId }: PomodoroWidgetProps) {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount (browser beep sound)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVqzn77JmHAU7ltrzxHElBSl+zPLaizsIGGS57OihUBAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBSd4yPHckTsIF2a67OihUhAKTKXh8bllHAU2jtLzzn0pBQ==');
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore if audio play fails (user interaction required)
      });
    }

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work' ? 'Work session complete! Time for a break.' : 'Break complete! Ready to work?',
        icon: '/favicon.ico',
      });
    }

    // Increment session counter if work session
    if (mode === 'work') {
      setSessionsCompleted((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    // Request notification permission on first start
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const handleModeChange = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(DURATIONS[newMode]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Timer className="h-10 w-10 text-primary" aria-hidden="true" />
            <h1 className="text-4xl font-bold">Pomodoro Timer</h1>
          </div>
          <p className="text-muted-foreground">
            Stay focused with the Pomodoro Technique
          </p>
        </div>

        {/* Mode Selection */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3" role="group" aria-label="Timer mode selection">
              <Button
                variant={mode === 'work' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => handleModeChange('work')}
                disabled={isRunning}
                aria-label="Work mode (25 minutes)"
                aria-pressed={mode === 'work'}
              >
                <BriefcaseIcon className="h-4 w-4" aria-hidden="true" />
                Work
              </Button>
              <Button
                variant={mode === 'shortBreak' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => handleModeChange('shortBreak')}
                disabled={isRunning}
                aria-label="Short break mode (5 minutes)"
                aria-pressed={mode === 'shortBreak'}
              >
                <Coffee className="h-4 w-4" aria-hidden="true" />
                Short Break
              </Button>
              <Button
                variant={mode === 'longBreak' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => handleModeChange('longBreak')}
                disabled={isRunning}
                aria-label="Long break mode (15 minutes)"
                aria-pressed={mode === 'longBreak'}
              >
                <Coffee className="h-4 w-4" aria-hidden="true" />
                Long Break
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timer Display */}
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center gap-8">
              {/* Circular Progress */}
              <div className="relative" role="timer" aria-live="off" aria-atomic="true">
                <svg className="w-64 h-64 transform -rotate-90" role="img" aria-label={`Timer progress: ${Math.round(progress)}% complete`}>
                  {/* Background circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className={cn(
                      'transition-all duration-1000 ease-linear',
                      mode === 'work' ? 'text-red-500' : 'text-green-500'
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Time in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold font-mono" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">
                      {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4" role="group" aria-label="Timer controls">
                {!isRunning ? (
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="gap-2 px-8"
                    disabled={timeLeft === 0}
                    aria-label="Start timer"
                  >
                    <Play className="h-5 w-5" aria-hidden="true" />
                    Start
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handlePause}
                    variant="secondary"
                    className="gap-2 px-8"
                    aria-label="Pause timer"
                  >
                    <Pause className="h-5 w-5" aria-hidden="true" />
                    Pause
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={handleReset}
                  variant="outline"
                  className="gap-2"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sessions Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary" role="status" aria-live="polite" aria-label={`${sessionsCompleted} sessions completed`}>
                {sessionsCompleted}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {sessionsCompleted === 0
                  ? 'Start your first session!'
                  : `Great work! Keep it up! 🎉`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" role="img" aria-label={mode === 'work' ? 'Work mode active' : 'Break mode active'}>
                {mode === 'work' ? '💼' : '☕'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'work' ? 'Work Mode' : 'Break Time'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Choose a task to work on</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Start a 25-minute work session</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Work with full focus until the timer rings</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <span>Take a 5-minute break</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">5.</span>
                <span>After 4 sessions, take a longer 15-minute break</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
