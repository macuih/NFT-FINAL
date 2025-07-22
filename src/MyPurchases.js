import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Card } from 'react-bootstrap';

const MyPurchases = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);

  // IPFS URI to HTTP Gateway
  const resolveIPFS = (uri) =>
    uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;

  const loadPurchasedItems = useCallback(async () => {
    try {
      const itemCount = await marketplace.getItemCount();
      const purchased = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplace.items(i);

        if (
          item.sold &&
          item.buyer &&
          item.buyer.toLowerCase() === account.toLowerCase()
        ) {
          try {
            const uri = await nft.tokenURI(item.tokenId);
            const metadataRes = await fetch(resolveIPFS(uri));
            const metadata = await metadataRes.json();
            const totalPrice = await marketplace.getTotalPrice(item.itemId);

            purchased.push({
              totalPrice,
              name: metadata.name,
              description: metadata.description,
              image: resolveIPFS(metadata.image),
            });
          } catch (err) {
            console.error(`Failed to fetch metadata for item ${i}:`, err);
          }
        }
      }

      setPurchases(purchased);
    } catch (err) {
      console.error("Failed to load purchases:", err);
    } finally {
      setLoading(false);
    }
  }, [marketplace, nft, account]);

  useEffect(() => {
    loadPurchasedItems();
  }, [loadPurchasedItems]);

  if (loading) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading purchases...</h2>
      </main>
    );
  }

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <strong>{ethers.formatEther(item.totalPrice)} ETH</strong>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No purchases found</h2>
        </main>
      )}
    </div>
  );
};

export default MyPurchases;

