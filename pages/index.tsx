import type { NextPage } from 'next'
import type { AxiosResponse } from 'axios'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import Form from 'react-bootstrap/Form'
import styles from '../styles/Home.module.css'

interface iTransaction {
  _id: string;
  amount: number;
  network: string;
  owner: string;
  repo: string;
  prid: number;
  timestamp: number;
  txid: string;
}

const Home: NextPage = () => {
  const [network, setNetwork] = useState<string>('testnet');
  const [transactions, setTransactions] = useState<Array<iTransaction>>([]);

  useEffect(() => {
    async function getTransactions() {
      const records: AxiosResponse = await axios.get('/api/transaction', {
        params: { network, limit: 3 },
      });
      setTransactions(records.data);
      console.log(records.data);
    }

    getTransactions();
  }, [network]);

  return (
    <div className={styles.container}>
      <Head>
        <title>XRP Donation Page</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h3 className={styles.title}>
          <Link href="/">XRP</Link> OSS Donation
        </h3>
        <h4>Show your support for your favorite Open-source project</h4>

        <p className={styles.description}>
          Select XRP Network:
          <Form.Select
            onChange={(e) => setNetwork(e.target.value)}
          >
            <option value="testnet">testnet</option>
            <option value="mainnet">mainnet</option>
          </Form.Select>
        </p>

        <h3>Last 3 transactions on {network}</h3>
        <div className={styles.grid}>
          {
            transactions.map(o => {
              return <Link key={o._id} href={`https://${network}.xrpl.org/transactions/${o.txid}`}>
                <a className={styles.card} rel="noreferrer" target="_blank">
                  <p><strong>{`${o.owner}/${o.repo} #${o.prid}`}</strong></p>
                  <p><small>{`${new Date(o.timestamp).toUTCString()}`}</small></p>
                  <p><small>tx: {o.txid.substring(0, 15)}...{o.txid.substring(o.txid.length - 13)}</small></p>
                  <p><strong>{`${o.amount / 1000000}`} XRP</strong>  &rarr;</p>
                </a>
              </Link>
            })
          }
        </div>
      </main>

      <footer className={styles.footer}>
        Powered by XRP
      </footer>
    </div>
  )
}

export default Home
