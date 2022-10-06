import { useEffect, useRef, useState } from 'react'
import MetaMaskOnboarding from '@metamask/onboarding'

const ONBOARD_TEXT = 'Click here to install MetaMask!'
const CONNECT_TEXT = 'Connect'
const CONNECTED_TEXT = 'Connected'

export function OnboardingButton() {
    const [buttonText, setButtonText] = useState(ONBOARD_TEXT)
    const [isDisabled, setDisabled] = useState(false)
    const [accounts, setAccounts] = useState([])
    const onboarding = useRef<MetaMaskOnboarding>()

    useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding()
        }
    }, [])

    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(CONNECTED_TEXT)
                setDisabled(true)
                onboarding.current!.stopOnboarding() // TODO: check if ! can be removed
            } else {
                setButtonText(CONNECT_TEXT)
                setDisabled(false)
            }
        }
    }, [accounts])

    useEffect(() => {
        // TODO: check if "any" can be improved
        function handleNewAccounts(newAccounts: any) {
            setAccounts(newAccounts)
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum.request({ method: 'eth_requestAccounts' }).then(handleNewAccounts)
            window.ethereum.on('accountsChanged', handleNewAccounts)
            return () => {
                window.ethereum.removeListener('accountsChanged', handleNewAccounts)
            }
        }
    }, [])

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                // TODO: check if "any" can be improved
                .then((newAccounts: any) => setAccounts(newAccounts))
        } else {
            onboarding.current!.startOnboarding() // TODO: check if ! can be removed
        }
    }
    return (
        <button disabled={isDisabled} onClick={onClick}>
            {buttonText}
        </button>
    )
}
