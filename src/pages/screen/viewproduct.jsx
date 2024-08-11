import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './../../../firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCreditCard } from '@fortawesome/free-solid-svg-icons';

export function ViewProduct() {
  const { documentId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = docSnap.data();
          setProduct(productData);
          setQuantity(Math.min(1, productData.quantity)); // Set quantity to 1 or available quantity
        } else {
          setError('No such document!');
        }
      } catch (error) {
        setError('Error fetching product data.');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [documentId]);

  const handleBuyNow = () => {
    console.log(`Buy Now clicked with quantity: ${quantity}`);
  };

  const handleAddToCart = async () => {
    try {
      if (product) {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
          alert('User is not logged in.');
          return;
        }
        
        const cartRef = collection(db, 'cart');
        const cartItemQuery = query(cartRef, where('pid', '==', documentId), where('email', '==', user.email));
        const querySnapshot = await getDocs(cartItemQuery);
  
        if (!querySnapshot.empty) {
          // Product already exists in the cart, update the existing document
          const cartDocId = querySnapshot.docs[0].id;
          const cartDocRef = doc(db, 'cart', cartDocId);
          
          await updateDoc(cartDocRef, {
            quantity: quantity,
            price: product.price,
            // Update any other fields as necessary
          });
  
          alert(`Updated cart with quantity: ${quantity}`);
        } else {
          // Product not in cart, add a new document
          const cartItem = {
            pid: documentId, // Product ID
            ...product,
            quantity: quantity, // Add quantity to the cart item
            email: user.email, // Add user email to the cart item
            addedAt: new Date().toISOString(), // Optionally, add timestamp
          };
          await addDoc(cartRef, cartItem); // Add a new document to the cart collection
          alert(`Added to Cart with quantity: ${quantity}`);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);

    // Ensure the value is within range and is a positive integer
    if (value > 0 && value <= (product?.quantity || 0)) {
      setQuantity(value);
    }
  };

  const handleQuantityBlur = () => {
    // Reset quantity to 1 if it's invalid or empty
    if (quantity < 1 || quantity > (product?.quantity || 0)) {
      setQuantity(1);
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
      {product ? (
        <div className="flex flex-wrap lg:flex-nowrap bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="lg:w-1/2 p-4">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="w-full h-auto"
            />
          </div>
          <div className="lg:w-1/2 p-6 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4 capitalize">{product.productName}</h2>
            <div className="flex items-center mb-2">
              <p className="text-gray-700 text-lg font-semibold mr-4">₹{Number(product.price).toFixed(2)}</p>
              {product.discount && <span className="bg-red-500 text-white px-2 py-1 text-xs rounded">{product.discount}% OFF</span>}
            </div>
            <p className="text-gray-700 mb-4"><strong>Quantity Available:</strong> {product.quantity}</p>
            <div className="flex items-center mb-4">
              <label htmlFor="quantity" className="mr-2">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className="border border-black rounded px-2 py-1 w-24"
              />
            </div>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleAddToCart}
                className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-green-700"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-[#fb641b] text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#e52d1f]"
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Place Order</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">Product not found</div>
      )}
    </div>
  );
}

export default ViewProduct;
