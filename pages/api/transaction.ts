import type { NextApiRequest, NextApiResponse } from 'next';
import connection from '../../helpers/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const method = req.method?.toUpperCase();
  try {
    switch (method) {
      case 'GET':
        const results = await getTransaction(req.query);
        res.status(200).send(results);
        break;
      case 'POST':
        const result = await insertTransaction(req.body);
        res.status(200).send(result);
        break;
      default:
        res.status(405).send({});
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({});
  }
}

async function insertTransaction(body: any): Promise<any> {
  const client = await connection;
  const db = client.db(process.env.MONGODB_DB);
  const result = await db.collection(process.env.MONGODB_COLLECTION)
    .insertOne(body);

  // insert github comment to the PR so that it trigger the label again

  return result;
}

async function getTransaction(query: any): Promise<any> {
  const client = await connection;
  const db = client.db(process.env.MONGODB_DB);
  const results = await db.collection(process.env.MONGODB_COLLECTION)
    .find(query)
    .sort({ timestamp: -1 })
    .toArray();

  return results;
}