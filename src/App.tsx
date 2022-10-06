import { Metamask, OnboardingButton } from './components'

export const App = () => (
    <div>
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
    </div>
)
