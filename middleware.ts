import { NextResponse } from 'next/server'

export function middleware() {
  const response = NextResponse.next()
  
  response.headers.set('Accept', '*/*')
  response.headers.set('Accept-Encoding', 'gzip, deflate, br')
  
  return response
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    },
    responseLimit: false
  }
} 