import axios from 'axios'

const { STEPZEN_URL, STEPZEN_ADMIN_KEY } = process.env;

export default async function stepzenRequest(query: string) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${STEPZEN_ADMIN_KEY}`,
  };
  
  const data = await axios.post(STEPZEN_URL as string, { query }, { headers });  
  return data.data.data;
}

export function unquotedStringify(json: any) {
  const quoted = JSON.stringify(json);
  const unquoted = quoted.replace(/"([^"]+)":/g, '$1:');
  return unquoted;
}