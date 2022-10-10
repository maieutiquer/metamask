import { Container } from '@mui/material'
import detectEthereumProvider from '@metamask/detect-provider'
import { useEffect } from 'react'

import { Metamask, OnboardingButton } from './components'

export const App = () => {
    useEffect(() => {
        const detect = async () => {
            const provider = await detectEthereumProvider()

            // TODO: decide what to do with that info, add error handling
            if (provider) {
                console.info(provider)
            }
            // if (provider !== window.ethereum) {
            //     console.error('Do you have multiple wallets installed?')
            // }
        }

        detect()
    }, [])

    return (
        <Container>
            <h1>Crypto Wallet App</h1>
            {typeof window.ethereum === 'undefined' ? (
                <div>
                    No wallet is detected, you can install one of those:
                    <p>
                        <OnboardingButton />
                    </p>
                </div>
            ) : (
                <div>
                    You have the following wallets installed:
                    {window.ethereum.isMetaMask && <Metamask />}
                </div>
            )}
        </Container>
    )
}
