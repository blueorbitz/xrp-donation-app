import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'
import Script from 'next/script'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Script src="https://unpkg.com/xrpl@2.0.0/build/xrpl-latest-min.js" />
    <Component {...pageProps} />
  </>
}

export default MyApp
