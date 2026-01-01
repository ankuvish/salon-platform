// Sentry Error Tracking Configuration

import * as Sentry from "@sentry/nextjs";

export const initSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      
      // Performance Monitoring
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ["localhost", /^https:\/\/yourapp\.com/],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive information
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });
  }
};

// Custom error logging
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error);
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

// Log custom events
export const logEvent = (eventName: string, data?: Record<string, any>) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(eventName, {
      level: 'info',
      extra: data,
    });
  }
};
