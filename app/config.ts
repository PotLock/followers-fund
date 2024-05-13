import {
    createConfig,
    http,
    cookieStorage,
    createStorage
} from 'wagmi'
import { arbitrum, base, baseSepolia, blast, bsc, degen, mainnet, optimism, polygon, sepolia, zora } from 'wagmi/chains'
import {  metaMask ,coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
    chains: [mainnet, sepolia , base , baseSepolia , blast ],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    connectors: [
        coinbaseWallet({
            appName: 'My Wagmi App',
          }),
    ],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [base.id]: http(),
        [baseSepolia.id] : http(),
        [blast.id] : http(),
    },
})