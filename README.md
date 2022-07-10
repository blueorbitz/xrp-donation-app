# XRP Donation app

This is the frontend implementation for user to send **Donation** to their favorite Open Source project via XRP using XUMM wallet.

Refer to [XRP-Donation-Action](https://github.com/blueorbitz/xrp-donation-action) from the implementation to attach using Github Actions.

The Github action will route using `XRP_DONATION_URL` environment variable with the following structure for the endpoint.
`{XRP_DONATION_URL}/{Github Owner}/{Github Repo}/{Pull Request#}?address={xrp wallet}&network={xrp network}&target={target-goal}`.

## Stepzen configuration
Install Stepzen: `npm install -g stepzen`

Rename `config.yaml.sample` to `config.yaml`.
- Replace the `<Details>` with the respective information.
- Github access token
- Mongo Data API. Remember to turn on "Read & write" permissions.

Deploy changes: `stepzen start`

## Next JS configuration
Rename `.env.local.sample` to `.env.local`
- Xumm APIKey and APISecret.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Refer to [XRP-Donation-Action](https://github.com/blueorbitz/xrp-donation-action) to setup the Github Action. Once ready, it will create a donation link to using this Server url.

## Requisite

You'll need to have the following ready:
- Github token (personal for development)
- Xumm APIKey and APISecret.
- MongoDB

Copy `.env.local.sample` and rename to `.env.local`. Fill in the requiste information in the environment file.

`yarn dev` to start.

Everything else follow the guide from NextJS.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
