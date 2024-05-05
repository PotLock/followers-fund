import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { sendTransaction } from '@wagmi/core'
import { parseEther } from 'viem' 
import { config } from './config'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  const sendTranstaction = async() => {
    const result = await sendTransaction(config, {
        to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
        value: parseEther('0.01'),
      })
  }
  return (
    <div className='mt-2'>
      {/* {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>} */}
      <button onClick={() => disconnect()}  className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Disconnect</button>
      <button onClick={() => sendTranstaction()} className="bg-blue-500 mr-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Payout</button>
    </div>
  )
}