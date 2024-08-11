import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './../../../firebase';
import { collection, getDocs, query, where, doc, deleteDoc, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Hook for navigating

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
          setError('User is not logged in.');
          setLoading(false);
          return;
        }

        const cartRef = collection(db, 'cart');
        const q = query(cartRef, where('email', '==', user.email)); // Filter by user's email
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCartItems(items);
      } catch (error) {
        setError('Error fetching cart data.');
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveFromCart = async (id) => {
    try {
      const cartRef = doc(db, 'cart', id);
      await deleteDoc(cartRef); // Remove the cart item from Firestore
      setCartItems(cartItems.filter(item => item.id !== id)); // Update the state
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleImageClick = (pid) => {
    navigate(`/screen/viewproduct/${pid}`);
  };

  const handleCheckout = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        alert('User is not logged in.');
        return;
      }
  
      if (cartItems.length === 0) {
        alert('Your cart is empty.');
        return;
      }
  
      // Create updated items array with only necessary fields
      const updatedItems = cartItems.map(item => ({
        productName: item.productName,
        price: item.price,
        pid: item.pid,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        totalAmount: item.price * item.quantity,  // Calculate total amount as a number
      }));
  
      const totalOrderAmount = updatedItems.reduce((acc, item) => acc + item.totalAmount, 0);
  
      const orderData = {
        date: new Date().toISOString().split('T')[0], // Store only the date
        email: user.email,
        items: updatedItems, // Items now exclude unwanted fields
        total: totalOrderAmount  // Total amount for the entire order as a number
      };
  
      const ordersRef = collection(db, 'DOrders');
      await addDoc(ordersRef, orderData);
  
      // Update the quantity of each product in the products collection
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.pid); // Reference to the product
        const productDoc = await getDoc(productRef);
  
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const newQuantity = productData.quantity - item.quantity;
  
          if (newQuantity < 0) {
            alert(`Insufficient stock for ${item.productName}.`);
            return;
          }
  
          await updateDoc(productRef, { quantity: newQuantity });
        }
      }
  
      // Clear the cart after checkout
      for (const item of cartItems) {
        const cartRef = doc(db, 'cart', item.id);
        await deleteDoc(cartRef);
      }
  
      setCartItems([]); // Clear the cart items in state
      alert('Order placed successfully!');
      navigate('/dashboard/myorders'); // Navigate to the orders page or another relevant page
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  };
  
  
  

  if (loading) {
    return <div className="container mx-auto text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">Your cart is empty.</div>
      ) : (
        <div className="mx-auto max-w-lg">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white shadow-lg rounded-lg p-4 mb-4 flex items-center">
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-24 h-24 object-cover mr-4 cursor-pointer"
                onClick={() => handleImageClick(item.pid)}  // Navigate using pid
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold capitalize">{item.productName}</h2>
                <p className="text-gray-700">₹{Number(item.price).toFixed(2)}</p>
                <p className="text-gray-700">Quantity: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FontAwesomeIcon icon={faTrash} /> Remove
              </button>
            </div>
          ))}
          <div className="text-right mt-6">
            <button 
              className="bg-[#fb641b] text-white px-6 py-3 rounded-lg hover:bg-[#e52d1f]"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
