import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
          setError('User is not logged in.');
          setLoading(false);
          return;
        }

        const ordersRef = collection(db, 'DOrders');
        const q = query(ordersRef, where('email', '==', user.email)); // Filter orders by user email
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
      } catch (error) {
        setError('Error fetching order data.');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="container mx-auto text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Pending Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center">You have no orders.</div>
      ) : (
        <div className="mx-auto max-w-lg">
          {orders.map(order => (
            <div key={order.id} className="bg-white shadow-lg rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold">Order Date: {order.date}</h2>
              <h3 className="text-lg font-semibold mt-4">Items:</h3>
              {order.items.map((item, index) => (
                <div key={index} className="mt-2">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-24 h-24 object-cover"
                  />
                  <p className="text-gray-700">Product Name: {item.productName}</p>
                  <p className="text-gray-700">Price: ₹{Number(item.price).toFixed(2)}</p>
                  <p className="text-gray-700">Quantity: {item.quantity}</p>
                  <p className="text-gray-700">Total Amount: ₹{item.totalAmount.toFixed(2)}</p>
                </div>
              ))}
              <div className="text-right mt-4 font-bold">
                Total: ₹{order.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
