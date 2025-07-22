require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const PinataClient = require('@pinata/sdk');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

const pinata = new PinataClient({ pinataJWTKey: process.env.PINATA_JWT });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded');

    // Pin file to IPFS
    const fileStream = fs.createReadStream(req.file.path);
    const fileResult = await pinata.pinFileToIPFS(fileStream, {
      pinataMetadata: {
        name: req.body.name || 'uploaded-nft-file'
      }
    });

    // Clean up the temp file
    fs.unlinkSync(req.file.path);

    // Construct metadata
    const { name, description } = req.body;
    const metadata = {
      name,
      description,
      image: `ipfs://${fileResult.IpfsHash}`
    };

    // Pin metadata to IPFS
    const jsonResult = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `${name || 'metadata'}-meta`
      }
    });

    console.log('✅ File pinned:', fileResult.IpfsHash);
    console.log('✅ Metadata pinned:', jsonResult.IpfsHash);

    // Return token URI
    res.json({ tokenURI: `ipfs://${jsonResult.IpfsHash}` });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

// Bind to all interfaces so React frontend can reach it
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Pinata upload server running on http://0.0.0.0:${port}`);
});

