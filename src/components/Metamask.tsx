import { useState } from 'react'
import { Button } from '@mui/material'

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
            <Button variant="contained" onClick={onEnableEtheriumButtonClick}>
                Enable Etherium
            </Button>
            <p>account: {account}</p>
        </div>
    )
}
