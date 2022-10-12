import { useCallback, useEffect, useState } from 'react'
import type { FC } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Typography } from '@mui/material'
import { ethers } from 'ethers'
import type { providers } from 'ethers'

import genericErc20Abi from '../erc20.json'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

const NEXO_CONTRACT_ADDRESS = '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206'

type tokenDescription = {
    address: string
    decimals: number
    name: string
    symbol: string
}

type tokenWithDetails = tokenDescription & {
    balance: string
    totalSupply: string
}

const getBalanceByTokenContract = async ({
    contractAddress,
    decimals,
    provider,
    account,
}: {
    contractAddress: string
    decimals: number
    provider: providers.Web3Provider
    account?: string
}) => {
    const nexoContract = new ethers.Contract(contractAddress, genericErc20Abi, provider)
    const nexoBalance = (
        account != null ? await nexoContract.balanceOf(account) : await nexoContract.totalSupply()
    ).toString()
    const balanceAsBigNumber = ethers.utils.parseUnits(nexoBalance, 0)

    return ethers.utils.formatUnits(balanceAsBigNumber, decimals)
}

export const Metamask: FC = () => {
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [ethBalance, setEthBalance] = useState('')
    const [nexoTokens, setNexoTokens] = useState('')
    const [allTokens, setAllTokens] = useState([])
    const [provider, setProvider] = useState<providers.Web3Provider>()

    const onConnectButtonClick = useCallback(async () => {
        setProvider(new ethers.providers.Web3Provider(window.ethereum ?? {}, 'any'))
    }, [])

    const handleAccountsChanged = (accounts: any) => {
        // TODO: decide what to do with that info, add error handling
        // eslint-disable-next-line no-console
        console.info(accounts)
    }

    useEffect(() => {
        if (typeof provider !== 'undefined') {
            const onConnected = async () => {
                // https://docs.ethers.io/v5/single-page/#/v5/concepts/best-practices/-%23-best-practices--network-changes
                provider.on('network', (newNetwork, oldNetwork) => {
                    // When a Provider makes its initial connection, it emits a "network"
                    // event with a null oldNetwork along with the newNetwork. So, if the
                    // oldNetwork exists, it represents a changing network
                    if (oldNetwork) {
                        window.location.reload()
                    }
                })

                const account =
                    process.env.REACT_APP_IMPERSONATION_ADDRESS ?? (await provider.send('eth_requestAccounts', []))[0]
                setSelectedAddress(account)

                const accountBalance = await provider.getBalance(account)
                const balanceInEther = ethers.utils.formatEther(accountBalance)
                setEthBalance(balanceInEther)

                setNexoTokens(
                    await getBalanceByTokenContract({
                        contractAddress: NEXO_CONTRACT_ADDRESS,
                        decimals: 18,
                        provider,
                        account,
                    })
                )

                const allTokenDescriptions = await fetch(
                    'https://gateway.ipfs.io/ipfs/QmdvdRrtqxbBKmCpxFyraXEvHPGKkenkZKWGBD4KkLwXCw'
                )
                // nexo: 1791
                const allTokenDescriptionsJson: tokenDescription[] = await allTokenDescriptions.json()

                const tokensToCheck = allTokenDescriptionsJson.map(({ address, decimals, name, symbol }) =>
                    (async () => {
                        try {
                            return {
                                name,
                                symbol,
                                decimals,
                                address,
                                balance: await getBalanceByTokenContract({
                                    contractAddress: address,
                                    decimals,
                                    provider,
                                    account,
                                }),
                                totalSupply: await getBalanceByTokenContract({
                                    contractAddress: address,
                                    decimals,
                                    provider,
                                }),
                            }
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.error(error)
                        }
                    })()
                )

                const allTokensChecked = await Promise.allSettled(tokensToCheck)

                // TODO: check ts error: Type 'any' is not assignable to type 'never'.
                setAllTokens(
                    // @ts-ignore
                    allTokensChecked
                        .filter((x): x is PromiseFulfilledResult<tokenWithDetails> => x.status === 'fulfilled')
                        .map(({ value }) => value)
                        .filter(Boolean)
                        .filter(
                            ({ balance: retrievedBalance }) => retrievedBalance !== '0.0' && retrievedBalance !== '0'
                        )
                )
            }

            onConnected()
        }
    }, [provider])

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
            {window.ethereum.networkVersion !== '1' && (
                <Alert severity="warning">The currently selected network is not "Mainnet"!</Alert>
            )}
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
                        Your ETH Balance: <strong>{ethBalance}</strong>
                    </p>
                    <p>
                        Your NEXO tokens: <strong>{nexoTokens}</strong>
                    </p>
                    <p>
                        All tokens that you have:{' '}
                        {allTokens.map(({ name, balance, symbol, decimals, totalSupply }) => (
                            // TODO: use mui accordion
                            <Accordion key={symbol}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>
                                        {name}: {balance}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        <dl>
                                            <dt>
                                                <strong>Symbol:</strong>
                                            </dt>
                                            <dd>{symbol}</dd>
                                            <dt>
                                                <strong>Decimals:</strong>
                                            </dt>
                                            <dd>{decimals}</dd>
                                            <dt>
                                                <strong>Total Supply:</strong>
                                            </dt>
                                            <dd>{totalSupply}</dd>
                                        </dl>
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </p>
                </div>
            )}
        </div>
    )
}
