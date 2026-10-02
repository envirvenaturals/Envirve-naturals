import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken, setAccessTokenInMemory } from '../firebase/googleAuth';
import { sendOrderEmailViaGmail } from '../services/gmailService';
import { Order } from '../types';

interface GoogleAuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  sendOrderNotification: (order: Order) => Promise<{ success: boolean; message: string }>;
  sendTestNotification: () => Promise<{ success: boolean; message: string }>;
  lastEmailStatus: { orderNumber: string; status: 'sent' | 'failed'; timestamp: string; error?: string } | null;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProviderContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lastEmailStatus, setLastEmailStatus] = useState<{
    orderNumber: string;
    status: 'sent' | 'failed';
    timestamp: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessToken(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setAccessTokenInMemory(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const sendOrderNotification = async (order: Order): Promise<{ success: boolean; message: string }> => {
    const token = accessToken || (await getAccessToken());
    if (!token || !user?.email) {
      return {
        success: false,
        message: 'Google account is not connected yet. Log in with Google to enable automatic order emails.',
      };
    }

    try {
      await sendOrderEmailViaGmail({
        accessToken: token,
        recipientEmail: user.email,
        order,
      });

      setLastEmailStatus({
        orderNumber: order.orderNumber,
        status: 'sent',
        timestamp: new Date().toLocaleTimeString(),
      });

      return {
        success: true,
        message: `Order #${order.orderNumber} details emailed to ${user.email} from your account!`,
      };
    } catch (err: any) {
      console.error('Failed to send order email via Gmail:', err);
      const errorMsg = err?.message || 'Failed to send email via Gmail API';
      setLastEmailStatus({
        orderNumber: order.orderNumber,
        status: 'failed',
        timestamp: new Date().toLocaleTimeString(),
        error: errorMsg,
      });

      // If token expired, clear it
      if (errorMsg.includes('401') || errorMsg.includes('Invalid Credentials') || errorMsg.includes('expired')) {
        setAccessToken(null);
        setAccessTokenInMemory(null);
      }

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const sendTestNotification = async (): Promise<{ success: boolean; message: string }> => {
    const token = accessToken || (await getAccessToken());
    if (!token || !user?.email) {
      return {
        success: false,
        message: 'Please sign in with your Google account first.',
      };
    }

    const testOrder: Order = {
      id: 'test-order-' + Date.now(),
      orderNumber: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString(),
      customerName: 'Ayesha Khan (Sample Customer)',
      customerPhone: '+92 300 1234567',
      customerEmail: user.email,
      shippingAddress: 'House 42, Street 7, Block B, Gulberg III',
      city: 'Lahore',
      postalCode: '54000',
      items: [
        {
          productId: 'prod-shampoo-1',
          productName: 'Hair Balance Herbal Shampoo',
          price: 2450,
          quantity: 2,
          image: '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
          volumeSize: '250ml Glass Bottle',
        },
        {
          productId: 'prod-oil-1',
          productName: 'Root Vitality Botanical Hair Oil',
          price: 1850,
          quantity: 1,
          image: '/src/assets/images/product_botanical_oil_1790696473722.jpg',
          volumeSize: '100ml Infused Dropper',
        },
      ],
      subtotal: 6750,
      deliveryFee: 200,
      discountAmount: 200,
      total: 6750,
      status: 'Pending',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      notes: 'Please ring the doorbell upon arrival. Botanical gift box requested.',
    };

    return await sendOrderNotification(testOrder);
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        accessToken,
        isLoggedIn: !!user,
        isLoggingIn,
        signIn,
        signOut: handleSignOut,
        sendOrderNotification,
        sendTestNotification,
        lastEmailStatus,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProviderContext');
  }
  return context;
};
