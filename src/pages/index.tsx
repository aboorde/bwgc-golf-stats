import Head from 'next/head'
import Layout from '../components/layout/Layout'
import Dashboard from '../components/layout/Dashboard'

export default function Home() {
  return (
    <>
      <Head>
        <title>BWGC Golf Stats - Myrtle Beach Tournament</title>
        <meta name="description" content="Golf tournament analytics dashboard for BWGC Myrtle Beach trip" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Dashboard />
      </Layout>
    </>
  )
}