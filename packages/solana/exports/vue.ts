import { onUnmounted, ref } from 'vue'

import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { getWeb3Modal } from '@web3modal/scaffold-vue'

import type { Web3ModalOptions } from '../src/client.js'
import type { CaipNetwork } from '@web3modal/scaffold'
import { SolStoreUtil } from '../src/utils/scaffold/SolanaStoreUtil.js'
import { Web3Modal } from '../src/client.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({
      ...options,
      _sdkVersion: `vue-solana-${ConstantsUtil.VERSION}`
    })
    getWeb3Modal(modal)
  }

  return modal
}

// -- Composites --------------------------------------------------------------
export function useWeb3ModalProvider() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalProvider" composition')
  }

  const walletProvider = ref(SolStoreUtil.state.provider)
  const connection = ref(SolStoreUtil.state.connection)

  const unsubscribe = modal.subscribeProvider(state => {
    walletProvider.value = state.provider
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    walletProvider: walletProvider.value ?? undefined,
    connection: connection.value ?? undefined
  }
}

export function useDisconnect() {
  function disconnect() {
    modal?.disconnect()
  }

  return {
    disconnect
  }
}

export function useSwitchNetwork() {
  async function switchNetwork(chainId: string) {
    await modal?.switchNetwork({ id: chainId } as CaipNetwork)
  }

  return {
    switchNetwork
  }
}

export function useWeb3ModalAccount() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalAccount" composition')
  }

  const address = ref(modal.getAddress())
  const isConnected = ref(SolStoreUtil.state.isConnected)
  const chainId = ref(SolStoreUtil.state.currentChain?.chainId)

  const unsubscribe = modal.subscribeProvider(state => {
    address.value = state.address ?? ''
    isConnected.value = state.isConnected
    chainId.value = state.chainId
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    address,
    isConnected,
    chainId
  }
}

export function useWeb3ModalError() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalError" composition')
  }

  const error = ref(SolStoreUtil.state.error)

  const unsubscribe = modal.subscribeProvider(state => {
    error.value = state.error
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    error
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@web3modal/scaffold-vue'

// -- Universal Exports -------------------------------------------------------
export { defaultSolanaConfig } from '../src/utils/defaultConfig.js'
