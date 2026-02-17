/* eslint-disable react-hooks/rules-of-hooks */
export async function register() {
  // Only enable instrumentation in production
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING

    if (connectionString) {
      // Dynamic import to avoid bundling gRPC dependencies when not needed
      const { useAzureMonitor } = await import('@azure/monitor-opentelemetry')
      useAzureMonitor({
        azureMonitorExporterOptions: {
          connectionString,
        },
      })
      console.log('Application Insights telemetry initialized')
    }
  }
}
