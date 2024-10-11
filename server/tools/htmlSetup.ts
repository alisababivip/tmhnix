export const setupHtmlRoutes = (app: any) => {
  app.get('/', (res) => {
    const appName = process.env.APP_PUBLIC_SITE_NAME || 'Platform'
    res.writeHeader('Content-Type', 'text/html')
    res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${appName} - Backend Service</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
        }
      </style>
    </head>
    <body>
      <h1>${appName} Backend Service</h1>
      <p>Status: <strong>Live</strong></p>
      <p>This is the backend service for <strong>${appName}</strong>. All systems operational.</p>
    </body>
    </html>
  `)
  })

  app.any('/*', (res) => {
    res.writeStatus('404 Not Found')
    res.writeHeader('Content-Type', 'text/html')
    res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 Not Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
        }
      </style>
    </head>
    <body>
      <h1>404 Not Found</h1>
      <p>The resource you are looking for is not available.</p>
    </body>
    </html>
  `)
  })
}
