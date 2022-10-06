import { Container } from '@mui/material'

import { Metamask, OnboardingButton } from './components'

export const App = () => (
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
