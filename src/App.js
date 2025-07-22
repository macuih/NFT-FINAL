import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import './App.css';

import Header from './Header';
import Home from './Home';
import Create from './Create';
import MyListedItems from './MyListedItems';
import MyPurchases from './MyPurchases';

import NFT from './NFT.json';
import Marketplace from './Marketplace.json';
import addresses from './contract-addresses.json';

function App() {
  const [account, setAccount] = useState('');
  const [nftContract, setNFTContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBlockchainData = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install MetaMask to use this DApp.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      const nft = new ethers.Contract(addresses.nft, NFT.abi, signer);
      const marketplace = new ethers.Contract(addresses.marketplace, Marketplace.abi, signer);

      setAccount(account);
      setNFTContract(nft);
      setMarketplaceContract(marketplace);
      setLoading(false);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" />
        <p className="mx-3 my-0">Connecting to blockchain...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header account={account} />
      <Routes>
        <Route path="/" element={<Home marketplace={marketplaceContract} nft={nftContract} account={account} />} />
        <Route path="/create" element={
          <Create
            marketplace={marketplaceContract}
            nft={nftContract}
            account={account}
            pinataUploadUrl="http://ec2-3-21-204-133.us-east-2.compute.amazonaws.com:5000/upload" // 🔗 New backend endpoint
          />
        } />
        <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplaceContract} nft={nftContract} account={account} />} />
        <Route path="/my-purchases" element={<MyPurchases marketplace={marketplaceContract} nft={nftContract} account={account} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
