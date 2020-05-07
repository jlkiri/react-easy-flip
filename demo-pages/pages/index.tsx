import Head from 'next/head'
import App from './App'
import { FlipProvider } from 'react-easy-flip'

export default function Home() {
  return (
    <FlipProvider>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </FlipProvider>
  )
}
