import {
    createConfig,
    http,
    cookieStorage,
    createStorage
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import {  metaMask ,coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
    chains: [mainnet, sepolia],
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
    },
})