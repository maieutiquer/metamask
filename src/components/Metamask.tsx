import { useState } from 'react'

export const Metamask = () => {
    const [account, setAccount] = useState(null)

    const onEnableEtheriumButtonClick = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

        setAccount(accounts[0])
    }

    return (
        <div>
            <h2>Metamask wallet</h2>
            <p>networkVersion: {window.ethereum.networkVersion}</p>
            <p>selectedAddress: {window.ethereum.selectedAddress}</p>
            <button onClick={onEnableEtheriumButtonClick}>Enable Etherium</button>
            <p>account: {account}</p>
        </div>
    )
}
