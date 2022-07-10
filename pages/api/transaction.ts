import type { NextApiRequest, NextApiResponse } from 'next';
import stepzenRequest, { unquotedStringify } from '../../helpers/stepzen';

const { MONGODB_DB, MONGODB_COLLECTION } = process.env;

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
  const { repo, owner, prid, txid, target, network, networkUrl } = body;

  const query = `query {
    repository(name: "${repo}", owner: "${owner}") {
      pullRequest(number: ${prid}) {
        id
      }
    }
    mongo(
      collection: "${MONGODB_COLLECTION}"
      database: "${MONGODB_DB}"
      dataSource: "Cluster0"
      sort: {timestamp: -1}
      filter: ${unquotedStringify({ repo, owner, prid })}
    ) {
      _id network owner repo prid txid amount
    }
    xrp: ripple_tx(
      server: "${networkUrl}"
      txid: "${txid}"
    ) {
      Account Amount
    }
  }`;
  const res = await stepzenRequest(query);

  const sender = res.xrp.Account;
  const amount = res.xrp.Amount;
  const pullRequestId = res.repository.pullRequest.id;
  const timestamp = new Date().getTime();

  const total = res.mongo.reduce((sum: number, e: any) => sum + parseInt(e.amount), 0);
  const isTargetAchieved = total >= (parseFloat(target) * 1000000);
  console.log('isTargetAchieved:', isTargetAchieved, total, amount, target);

  const insertData = { repo, owner, prid, sender, txid, amount, network, timestamp };
  const unquotedInsert = unquotedStringify(insertData);
  const commentBody = `<strong>XRPDonation:${isTargetAchieved ? 'Achieved' : 'Funded'}</strong> Received ${amount/1000000} XRP.\\nClick <a href=\\"https://${network}.xrpl.org/transactions/${txid}\\">here</a> for more details.`;

  const mutation = `mutation {
    insertMongo: mongoInsertOne(
      collection: "${MONGODB_COLLECTION}"
      database: "${MONGODB_DB}"
      dataSource: "Cluster0"
      document: ${unquotedInsert}
    )

    addComment(input: {subjectId: "${pullRequestId}", body: "${commentBody}"}) {
      subject { id }
    }
  }`;
  const insertRes = await stepzenRequest(mutation);
  
  return {...res, ...insertRes, insertData};
}

async function getTransaction(filter: any): Promise<any> {
  let limit = 50;
  if (filter.limit != null) {
    limit = parseInt(filter.limit);
    delete filter.limit;
  }

  const unquoted_Filter = unquotedStringify(filter);
  
  const query = `query MyMongo {
    mongo(
      collection: "${MONGODB_COLLECTION}"
      database: "${MONGODB_DB}"
      dataSource: "Cluster0"
      limit: ${limit}
      sort: {timestamp: -1}
      filter: ${unquoted_Filter}
    ) {
      _id target network owner repo prid txid amount sender timestamp
    }
  }`;
 
  const data = await stepzenRequest(query);
  return data.mongo;
}