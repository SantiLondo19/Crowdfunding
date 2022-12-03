import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Contract from 'web3-eth-contract';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import CrowdfundingContract from '../contracts/contracts.json';
import './crowdfunding.css';
import crowdfunding from './crowdfunding.png';

const APP_NAME = 'Crowdfunding App';
const RPC_URL = process.env.REACT_APP_INFURA_RPC_URL;
const CHAIN_ID = 5; // Goerli Network ID
const CROWDFUNDING_CONTRACT_ADDRESS =
  '0xdEe524666189D00d9d34C386ABd2D5073e6B9E89';

export const Crowdfunding = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState();
  const [walletSDKProvider, setWalletSDKProvider] = useState();
  const [web3, setWeb3] = useState();
  const [crowdfundingContractInstance, setCrowdfundingContractInstance] =
    useState();
  const [responseMessage, setResponseMessage] = useState();

  useEffect(() => {
    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: './crowdfunding.png',
    });

    // Initialize Web3 Provider
    const walletSDKProvider = coinbaseWallet.makeWeb3Provider(
      RPC_URL,
      CHAIN_ID
    );
    setWalletSDKProvider(walletSDKProvider);

    // Initialize Web3 object
    const web3 = new Web3(walletSDKProvider);
    setWeb3(web3);

    // Initialize crowdfunding contract
    const web3ForContract = new Web3(window.ethereum);
    Contract.setProvider(web3ForContract);
    const crowdfundingContractInstance = new Contract(
      CrowdfundingContract,
      CROWDFUNDING_CONTRACT_ADDRESS
    );
    setCrowdfundingContractInstance(crowdfundingContractInstance);
  }, []);
  const checkIfWalletIsConnected = () => {
    if (!window.ethereum) {
      console.log(
        'No ethereum object found. Please install Coinbase Wallet extension or similar.'
      );

      // Enable the provider and cause the Coinbase Onboarding UI to pop up
      web3.setProvider(walletSDKProvider.enable());

      return;
    }

    console.log('Found the ethereum object:', window.ethereum);
    connectWallet();
  };

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts.length) {
      console.log('No authorized account found');
      return;
    }

    if (accounts.length) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setAccount(account);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }],
        });
        console.log('Successfully switched to Goerli Network');
      } catch (error) {
        console.error(error);
      }
    }

    setIsWalletConnected(true);
  };

  const donateETH = async () => {
    if (!account || !window.ethereum) {
      console.log('Wallet is not connected');
      return;
    }

    const donationAmount = document.querySelector('#donationAmount').value;

    const response = await crowdfundingContractInstance.methods
      .fundProject()
      .send({
        from: account,
        value: donationAmount,
      });

    console.log(response);
    setResponseMessage(
      `Thank you for donating! Here's your receipt: ${response.transactionHash}`
    );
  };

  const setGoal = async () => {
    if (!account || !window.ethereum) {
      console.log('Wallet is not connected');
      return;
    }

    const goalAmount = document.querySelector('#goalAmount').value;

    const response = await crowdfundingContractInstance.methods
      .setGoal(goalAmount)
      .send({
        from: account,
      });
    
    setResponseMessage(
      `Goal has been set! Here's your receipt: ${response.transactionHash}`
    );
  };
  const getDonationBalance = async () => {
    const response = await crowdfundingContractInstance.methods
      .getActualFound()
      .call();
    setResponseMessage(
      `Total contribution amount is ${web3.utils.fromWei(response)} ETH.`
    );
  };
  const getGoal = async () => {
    const response = await crowdfundingContractInstance.methods
      .getGoal()
      .call();
    setResponseMessage(
      `The goal of this project is ${web3.utils.fromWei(response)} ETH.`
    );
  };

  const getName = async () => {
    const response = await crowdfundingContractInstance.methods
      .getName()
      .call();
    setResponseMessage(`The name of the project is ${response}`);
  };
  const getProjectStatus = async () => {
    const response = await crowdfundingContractInstance.methods
      .getProjectState()
      .call();
    setResponseMessage(`The project is ${response}`);
  };
  const resetCoinbaseWalletConnection = () => {
    walletSDKProvider.close();
  };
  return (
    <main className="app">
      <header>
        <img className="headerImage" alt="Crowdfunding" src={crowdfunding} />
        <h1>CrowdFunding App</h1>
      </header>

      {isWalletConnected ? (
        <>
          <p>Connected Account: {account}</p>
          <div>
            <input
              type="number"
              id="donationAmount"
              defaultValue={10000000000000000}
            />
            <label htmlFor="donationAmount">WEI</label>
            <button onClick={donateETH} id="donate" type="button">
              Donate
            </button>
          </div>
          <div>
            <input type="number" id="goalAmount" defaultValue={10000000000000000} />
            <label htmlFor="goalAmount">WEI</label>
            <button onClick={setGoal} id="setGoal" type="button">
              Set Goal
            </button>
          </div>
          <div>
            <button
              id="getDonationBalance"
              type="button"
              onClick={getDonationBalance}
            >
              See Total Contribution Amount
            </button>
          </div>
          <div>
            <button id="name" type="button" onClick={getName}>
              See Project Name
            </button>
          </div>
          <div>
            <button id="status" type="button" onClick={getProjectStatus}>
              See Project status
            </button>
          </div>
          <div>
            <button id="goal" type="button" onClick={getGoal}>
              Project Goal
            </button>
          </div>
          <div>
            <button
              id="reset"
              type="button"
              onClick={resetCoinbaseWalletConnection}
            >
              Reset Connection
            </button>
          </div>
        </>
      ) : (
        <button onClick={checkIfWalletIsConnected} id="connect" type="button">
          Connect Wallet
        </button>
      )}
      <p>{responseMessage}</p>
    </main>
  );
};
