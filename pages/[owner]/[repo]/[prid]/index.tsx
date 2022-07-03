import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import ProgressBar from 'react-bootstrap/ProgressBar'
import ListGroup from 'react-bootstrap/ListGroup'
import { XummSdk } from 'xumm-sdk'
import styles from '../../../../styles/Home.module.css'

const XRPHome: NextPage = ({ pullRequest, xummPayment }: any) => {
  const router = useRouter();
  const { owner = '', repo = '', prid = '', address = '', target = '100', network = 'testnet' } = router.query;

  // @ts-ignore
  const _target = parseInt(target);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [list, setList] = useState([]);

  const totalFunding = () => list.reduce((prev: number, curr: any) => prev + parseInt(curr.amount) / 1000000, 0);

  let websocketXummStatus: any = null;
  useEffect(() => {
    if (xummPayment?.refs?.websocket_status == null)
      return;
    if (websocketXummStatus != null)
      return;

    console.log('conneting to ', xummPayment?.refs?.websocket_status);
    websocketXummStatus = new WebSocket(xummPayment?.refs?.websocket_status);
    websocketXummStatus.onopen = function (event: any) {
      console.log('xumm websocket connect');
    };
    websocketXummStatus.onmessage = async function (event: any) {
      const data = JSON.parse(event.data);
      // console.log('xumm ping', data);
      if (data.expired)
        websocketXummStatus.close();

      if (data.signed) {
        console.log('xumm websocket message', data);
        const txid = data.txid;

        let networkUrl: string = ''; // https://xrpl.org/public-servers.html
        switch (network) {
          case 'mainnet': networkUrl = 'wss://s1.ripple.com:51233'; break;
          case 'devnet': networkUrl = 'wss://s.devnet.rippletest.net:51233'; break;
          default: networkUrl = 'wss://s.altnet.rippletest.net:51233';
        }
        // @ts-ignore
        const api = new xrpl.Client(networkUrl);
        await api.connect();

        // search xrp ledger for amount;
        const response = await api.request({
          command: 'tx',
          transaction: txid,
        });
        console.log('xrp txid', response);

        const amount = response.result.Amount;
        const sender = response.result.Account;
        const timestamp = new Date().getTime();

        const query = { owner, repo, prid, txid, amount, sender, timestamp };
        const isTargetAchieved = totalFunding() > _target;
        const record = await axios.post('/api/transaction', { isTargetAchieved, network, ...query });
        console.log('save', record);
        // @ts-ignore
        setList(oldList => [...oldList, query]);

        handleClose();
      }
    }
  }, [xummPayment])

  useEffect(() => {
    async function getTransactions() {
      const records = await axios.get('/api/transaction', {
        params: { owner, repo, prid },
      });
      setList(records.data);
    }

    getTransactions();
  }, [])

  return (
    <div>
      <Head>
        <title>XRP Donation Page</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h3 className={styles.title}>
          <a href="https://nextjs.org">XRP</a> OSS Donation
        </h3>
        <h4>Show your support for your favorite Open-source project</h4>

        <br />

        <Table style={{ width: '600px' }}>
          <tbody>
            <tr>
              <td><strong>Project name</strong></td>
              <td>{`${owner}/${repo}`}</td>
            </tr>
            <tr>
              <td><strong>Pull request</strong></td>
              <td>{`#${prid} ${pullRequest.title}`}</td>
            </tr>
            <tr>
              <td><strong>Destination Address</strong></td>
              <td>{address}</td>
            </tr>
            <tr>
              <td><strong>Funding Target</strong></td>
              <td>{target} XRP</td>
            </tr>
            <tr>
              <td><strong>Total Funding</strong></td>
              <td>{totalFunding()} XRP</td>
            </tr>
          </tbody>
        </Table>

        <strong>Funding Target</strong>
        <ProgressBar style={{ width: '600px' }} now={totalFunding() * 100 / _target} />

        <br />

        <Button variant="primary" onClick={handleShow}>
          Donate XRP
        </Button>

        <br />

        {list.length ? <h4>Transactions:</h4> : ''}

        <ListGroup style={{ width: '600px' }} className="d-flex gap-3 py-2">
          {list.map((o: any) => <ListGroup.Item key={o.txid}>
            <div>
              <p className="mb-0">
                <strong>{parseInt(o.amount) / 1000000} XRP</strong> on <i>{new Date(o.timestamp).toUTCString()}</i>
              </p>
              <p className="mb-0">
                Sender:
                <a href={`https://${network}.xrpl.org/accounts/${o.sender}`} rel="noreferrer" target="_blank">
                  <i>{o.sender}</i>
                </a>
              </p>
              <p className="mb-0">
                Txid:
                <a href={`https://${network}.xrpl.org/transactions/${o.txid}`} rel="noreferrer" target="_blank">
                  <i>{o.txid.substring(0, 35)}...{o.txid.substring(o.txid.length - 10)}</i>
                </a>
              </p>
            </div>
          </ListGroup.Item>)}
        </ListGroup>
      </main>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Scan this QR with Xumm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='text-center'>
            <Image
              alt="payment qr"
              src={xummPayment?.refs?.qr_png ?? ''}
              width={200}
              height={200}
            />
            <br />
            <Link href={xummPayment?.next.always ?? ''}>
              Xumm sign link
            </Link>
          </div>
        </Modal.Body>
      </Modal>

      <footer className={styles.footer}>
        Powered by XRP
      </footer>
    </div>
  )
}

export async function getServerSideProps(context: any) {
  const { owner = '', repo = '', prid = '', address = '' } = context.query;

  const [pullRequest, xummPayment]: Array<any> = await Promise.all([
    getPullRequestInfo(),
    getPaymentInfo(),
  ]);

  return {
    props: {
      pullRequest,
      xummPayment,
    },
  };

  async function getPullRequestInfo() {
    const GRAPHQL_URL = 'https://api.github.com/graphql';

    const headers = {
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    };
    const query = `query {
    repository(name: "${repo}", owner: "${owner}") {
      pullRequest(number: ${prid}) {
        id title
      }
    }
  }`;
    const res = await axios.post(GRAPHQL_URL, { query }, { headers });
    return res.data.data.repository.pullRequest;
  }

  async function getPaymentInfo() {
    // return {
    //   uuid: 'e5120941-53c6-4781-a76a-d6db26c84ce1',
    //   next: {
    //     always: 'https://xumm.app/sign/e5120941-53c6-4781-a76a-d6db26c84ce1'
    //   },
    //   refs: {
    //     qr_png: 'https://xumm.app/sign/e5120941-53c6-4781-a76a-d6db26c84ce1_q.png',
    //     qr_matrix: 'https://xumm.app/sign/e5120941-53c6-4781-a76a-d6db26c84ce1_q.json',
    //     qr_uri_quality_opts: ['m', 'q', 'h'],
    //     websocket_status: 'wss://xumm.app/sign/e5120941-53c6-4781-a76a-d6db26c84ce1'
    //   },
    //   pushed: false
    // };

    const xumm = new XummSdk(process.env.XUMM_APIKEY, process.env.XUMM_SECRET);

    const toHex = (str: string) => {
      const arr = [];
      for (var i = 0; i < str.length; i++) {
        arr.push((str.charCodeAt(i).toString(16)).slice(-4));
      }
      return arr.join("");
    }

    const MemoData = toHex(`Donation for ${owner}/${repo} #${prid}`)
    const request = {
      "TransactionType": "Payment",
      "Destination": address,
      "Memos": [
        {
          "Memo": {
            "MemoData": MemoData
          }
        }
      ]
    }

    // @ts-ignore
    const payload = await xumm.payload.create(request, true);
    console.log(payload);
    return payload;
  }
}

export default XRPHome
