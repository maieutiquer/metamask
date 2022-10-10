import { useCallback, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { ethers } from 'ethers'
import genericErc20Abi from '../erc20.json'

const NEXO_CONTRACT_ADDRESS = '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206'

export const Metamask = () => {
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [balance, setBalance] = useState('')
    const [nexoTokens, setNexoTokens] = useState('')

    const onConnectButtonClick = useCallback(async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const account =
            process.env.REACT_APP_IMPERSONATION_ADDRESS ?? (await provider.send('eth_requestAccounts', []))[0]
        setSelectedAddress(account)

        const accountBalance = await provider.getBalance(account)
        const balanceInEther = ethers.utils.formatEther(accountBalance)
        setBalance(balanceInEther)

        const nexoContract = new ethers.Contract(NEXO_CONTRACT_ADDRESS, genericErc20Abi, provider)
        const nexoBalance = (await nexoContract.balanceOf(account)).toString()
        const balanceAsBigNumber = ethers.utils.parseUnits(nexoBalance, 0)
        setNexoTokens(ethers.utils.formatUnits(balanceAsBigNumber, 18))
    }, [])

    const handleAccountsChanged = (accounts: any) => {
        // TODO: decide what to do with that info, add error handling
        console.info(accounts)
    }

    useEffect(() => {
        window.ethereum.on('accountsChanged', handleAccountsChanged)

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
    }, [])

    return (
        <div>
            <h2>Metamask wallet</h2>
            <p>
                Network Version: <strong>{window.ethereum.networkVersion}</strong>
            </p>
            {/* <p>Selected Address: {window.ethereum.selectedAddress}</p> */}
            {selectedAddress === null ? (
                <Button variant="contained" onClick={onConnectButtonClick}>
                    Connect to Metamask
                </Button>
            ) : (
                <div>
                    <h3>
                        {Boolean(process.env.REACT_APP_IMPERSONATION_ADDRESS) ? 'Impersonating:' : 'Welcome,'}{' '}
                        {selectedAddress}
                    </h3>
                    <p>
                        {/* TODO: logos */}
                        {/* TODO: format thousands with commas */}
                        {/* TODO: loaders */}
                        Your ETH Balance: <strong>{balance}</strong>
                    </p>
                    <p>
                        Your NEXO tokens: <strong>{nexoTokens}</strong>
                    </p>
                </div>
            )}
        </div>
    )
}
