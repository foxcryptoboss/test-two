import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      getBalance();
    }
  }, [publicKey, connection]);

  const getBalance = async () => {
    if (publicKey) {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    }
  };

  const sendSol = async () => {
    if (!publicKey || !recipient || !amount) return;
    
    setLoading(true);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction signature:', signature);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Refresh balance
      await getBalance();
      
      // Clear form
      setRecipient('');
      setAmount('');
      
      alert('Transaction successful!');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Solana App Kit Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <WalletMultiButton />
      </div>

      {publicKey && (
        <div>
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3>Your Wallet</h3>
            <p><strong>Address:</strong> {publicKey.toString()}</p>
            <p><strong>Balance:</strong> {balance.toFixed(4)} SOL</p>
            <button onClick={getBalance} style={{ padding: '8px 16px', marginTop: '10px' }}>
              Refresh Balance
            </button>
          </div>

          <div style={{ padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
            <h3>Send SOL</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                placeholder="Amount (SOL)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
            </div>
            <button 
              onClick={sendSol} 
              disabled={loading || !recipient || !amount}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending...' : 'Send SOL'}
            </button>
          </div>
        </div>
      )}
      
      {!publicKey && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>Connect your wallet to get started!</p>
        </div>
      )}
    </div>
  );
}
