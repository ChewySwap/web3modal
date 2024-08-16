import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Provider } from '../src/utils/scaffold/SolanaTypesUtil.js'
import { WalletConnectProvider } from '../src/providers/WalletConnectProvider.js'
import { mockUniversalProvider } from './mocks/UniversalProvider.js'
import { WalletStandardProvider } from '../src/providers/WalletStandardProvider.js'
import { mockWalletStandard } from './mocks/WalletStandard.js'
import { TestConstants } from './util/TestConstants.js'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction.js'

const providers: { name: string; provider: Provider }[] = [
  {
    name: 'WalletConnectProvider',
    provider: new WalletConnectProvider({
      provider: mockUniversalProvider(),
      chains: TestConstants.chains,
      getActiveChain: () => TestConstants.chains[0]
    })
  },
  {
    name: 'WalletStandardProvider',
    provider: new WalletStandardProvider({
      wallet: mockWalletStandard(),
      getActiveChain: () => TestConstants.chains[0]
    })
  }
]

describe.each(providers)('Generic provider tests for $name', ({ provider }) => {
  const events = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    accountsChanged: vi.fn(),
    chainChanged: vi.fn()
  }

  beforeAll(() => {
    provider.on('connect', events.connect)
    provider.on('disconnect', events.disconnect)
    provider.on('accountsChanged', events.accountsChanged)
    provider.on('chainChanged', events.chainChanged)
  })

  it('should connect, return address and emit event', async () => {
    const address = await provider.connect()

    expect(address).toEqual(TestConstants.accounts[0].address)
    expect(events.connect).toHaveBeenCalledWith(TestConstants.accounts[0].publicKey)
  })

  it('should disconnect and emit event', async () => {
    await provider.disconnect()

    expect(events.disconnect).toHaveBeenCalledWith(undefined)
  })

  it('should signMessage', async () => {
    const result = await provider.signMessage(new TextEncoder().encode('test'))

    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('should signTransaction with Legacy Transaction', async () => {
    const result = await provider.signTransaction(mockLegacyTransaction())

    expect(result).toBeInstanceOf(Transaction)
  })

  it('should signTransaction with Versioned Transaction', async () => {
    const result = await provider.signTransaction(mockVersionedTransaction())

    expect(result).toBeInstanceOf(VersionedTransaction)
  })

  it('should signAndSendTransaction with Legacy Transaction', async () => {
    const result = await provider.signAndSendTransaction(mockLegacyTransaction())

    expect(result).toBeTypeOf('string')
  })

  it('should signAndSendTransaction with Versioned Transaction', async () => {
    const result = await provider.signAndSendTransaction(mockVersionedTransaction())

    expect(result).toBeTypeOf('string')
  })
})