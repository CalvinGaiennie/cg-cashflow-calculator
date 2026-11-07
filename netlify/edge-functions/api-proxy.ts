const BACKEND_URL = (
  Netlify.env.get('INTINTUS_BACKEND_URL') ??
  'https://habittrackerpythonbackend.onrender.com'
).replace(/\/+$/, '')

export default async function handler(request: Request) {
  const url = new URL(request.url)

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const backendPath = url.pathname.replace(/^\/api/, '')
  const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (lowerKey !== 'host' && lowerKey !== 'connection' && lowerKey !== 'keep-alive' && lowerKey !== 'content-length') {
      headers.set(key, value)
    }
  })

  try {
    let body: string | null = null
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text()
      } catch {
        body = null
      }
    }

    const fetchOptions: RequestInit = { method: request.method, headers }
    if (body) fetchOptions.body = body

    const backendResponse = await fetch(backendUrl, fetchOptions)

    const responseHeaders = new Headers()
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return
      responseHeaders.append(key, value)
    })
    const setCookies =
      typeof backendResponse.headers.getSetCookie === 'function' ? backendResponse.headers.getSetCookie() : []
    for (const cookie of setCookies) {
      responseHeaders.append('Set-Cookie', cookie)
    }

    responseHeaders.set('Access-Control-Allow-Origin', url.origin)
    responseHeaders.set('Access-Control-Allow-Credentials', 'true')

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        details: error instanceof Error ? error.message : String(error),
        backendUrl,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': url.origin,
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    )
  }
}

export const config = {
  path: '/api/*',
}
