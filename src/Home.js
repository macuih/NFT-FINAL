import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';

const Home = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // Converts ipfs://... to https://gateway.pinata.cloud/ipfs/...
  const resolveIPFS = (uri) =>
    uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") : uri;

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.getItemCount();
    let items = [];

    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);

      if (!item.sold) {
        try {
          const uri = await nft.tokenURI(item.tokenId);
          const resolvedUri = resolveIPFS(uri);

          const response = await fetch(resolvedUri);
          const metadata = await response.json();

          const totalPrice = await marketplace.getTotalPrice(item.itemId);

          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: resolveIPFS(metadata.image)  // Convert image URI too
          });
        } catch (err) {
          console.error(`Failed to fetch metadata for item ${i}:`, err);
        }
      }
    }

    setItems(items);
    setLoading(false);
  };

  const buyMarketItem = async (item) => {
    try {
      await marketplace.purchaseItem(item.itemId, {
        value: item.totalPrice,
        gasLimit: 3000000
      });
      await loadMarketplaceItems();
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <Spinner animation="border" />
      <h2>Loading Marketplace...</h2>
    </main>
  );

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => buyMarketItem(item)}
                      >
                        Buy for {ethers.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No NFTs currently listed</h2>
        </main>
      )}
    </div>
  );
};

export default Home;

