# followers-fund
Reward your followers with the most clout via quadratic funding. Built on Farcaster &amp; base


<img width="757" alt="shapes at 24-05-04 15 05 11" src="https://github.com/PotLock/followers-fund/assets/45281667/b1cbabe5-2852-4f41-ad38-01857415c386">

![followersfundicon (1)](https://github.com/PotLock/followers-fund/assets/45281667/3c1024d2-41b2-42c5-b248-62e85ea5724b)


# About
Farcaster client that allows you to filter followers and rewards them using quadratic funding based on their amount of followers and pay them out in Base + post the results to Farcaster tagging everyone who has been paid out.

# Demo
Quick Pitch (Farcon) https://docs.google.com/presentation/d/1qU4OqdF0FwR2n4klJhCwJM5AM_lIGzbFddfed0LbxtY/edit#slide=id.g2d26cbb005d_0_5
Demo at https://followers.fund


# You will need
- A farcaster account (sigin with warpcast)
- A wallet on Base with tokens
# Resources
Backlog https://github.com/orgs/PotLock/projects/12/views/1




## Demo

- [https://fc-payouts.vercel.app/](https://fc-payouts.vercel.app/)


## Setup
- After deploying your repo to Vercel...
- Create a `kv` database `https://vercel.com/<name>/<project>/stores`
- Set the `KV` prefix url's for the new `kv` database
- Navigate to env variables: https://vercel.com/gregan/fc-links-follow/settings/environment-variables
- If you're doing something production facing w/ trusted data, set the `HUB_URL` environment variable to a production hub's public ip address port 2283 ref: https://docs.farcaster.xyz/reference/frames/spec#frame-signature-packet
- Set the `HOST` env variable to your public facing url or domain, ie; `https://<project>.vercel.app/`
