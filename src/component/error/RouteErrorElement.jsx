import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import * as Sentry from '@sentry/react'

export default function RouteErrorElement() {
  const error = useRouteError()
  React.useEffect(() => {
    try {
      Sentry.captureException(error)
    } catch (e) {
      // ignore
    }
  }, [error])

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">{error.status} {error.statusText}</h1>
        <p className="mt-4">{error.data?.message ?? 'There was an error loading this page.'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-3 py-2 bg-blue-600 text-white rounded">Reload</button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">An unexpected error occurred</h1>
      <p className="mt-4">{String(error)}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-3 py-2 bg-blue-600 text-white rounded">Reload</button>
    </div>
  )
}
