import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import styles from '../../../../styles/Home.module.css'
import { NextRequest, NextResponse } from 'next/server'

const XRPHome: NextPage = ({ pullRequest }: any) => {
  const router = useRouter();
  const { owner = '', repo = '', prid = '' } = router.query;
  console.log(pullRequest);

  return (
    <div className={styles.container}>
      <Head>
        <title>XRP Donation Page</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2 className={styles.title}>
          <a href="https://nextjs.org">XRP Donation</a> for OSS
        </h2>
        <h3>Show your support for your favorite Open-source project</h3>

        <table>
          <tr>
            <td>Project name</td>
            <td>{`${owner}/${repo}`}</td>
          </tr>
          <tr>
            <td>Pull request</td>
            <td>{`#${prid} ${pullRequest.title}`}</td>
          </tr>
          <tr>
            <td>Destination Address</td>
            <td></td>
          </tr>
        </table>

        <button>Donate XRP</button>
      </main>

      <footer className={styles.footer}>
        Powered by XRP
      </footer>
    </div>
  )
}

export async function getServerSideProps(context: any) {
  async function getPullRequestInfo(context: any) {
    const GRAPHQL_URL = 'https://api.github.com/graphql';
    const { owner = '', repo = '', prid = '' } = context.params;

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

  const pullRequest = await getPullRequestInfo(context);

  return {
    props: {
      pullRequest,
    },
  };
}

export default XRPHome
