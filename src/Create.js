import React, { useState } from 'react';
import { Spinner, Row, Col, Form, Button } from 'react-bootstrap';
import { ethers } from 'ethers';

const Create = ({ marketplace, nft, account, pinataUploadUrl }) => {
  const [imageFile, setImageFile] = useState(null);
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const createNFT = async () => {
    if (!imageFile || !price || !name || !description) {
      alert('All fields are required.');
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Upload image + metadata to backend
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', name);
      formData.append('description', description);

      const res = await fetch(pinataUploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload to Pinata backend');
      const data = await res.json();
      const tokenURI = data.tokenURI;

      // 2️⃣ Mint NFT with metadata URI
      const mintTx = await nft.mint(tokenURI);
      await mintTx.wait();

      const tokenId = await nft.tokenCount();

      // 3️⃣ Approve marketplace
      const approvalTx = await nft.setApprovalForAll(marketplace.target, true);
      await approvalTx.wait();

      // 4️⃣ List on marketplace
      const listingPrice = ethers.parseEther(price.toString());
      const listTx = await marketplace.makeItem(nft.target, tokenId, listingPrice);
      await listTx.wait();

      alert('NFT created and listed successfully!');
    } catch (err) {
      console.error('NFT creation failed:', err);
      alert('Something went wrong during NFT creation.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container p-4">
      <h2>Create NFT</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" required onChange={handleFileChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="number"
            placeholder="Price in ETH"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" onClick={createNFT} disabled={uploading}>
          {uploading ? 'Uploading & Minting...' : 'Create & List NFT'}
        </Button>
      </Form>
    </div>
  );
};

export default Create;
