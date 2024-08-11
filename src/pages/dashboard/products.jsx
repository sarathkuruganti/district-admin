import React, { useEffect, useState } from 'react';
import { db } from './../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/screen/viewproduct/${id}`);
  };

  return (
    <div className="relative">
      {loading ? (
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill().map((_, index) => (
              <div key={index} className="bg-white animate-pulse shadow-lg rounded-lg overflow-hidden h-64"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => handleCardClick(product.id)}
                className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full h-48"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold capitalize mb-2">{product.productName}</h3>
                  <p className="text-gray-700 mb-2"><strong>Price:</strong> ₹{Number(product.price).toFixed(2)}</p>
                  <p className="text-gray-700 mb-4"><strong>Quantity:</strong> {product.quantity}</p>
                  {/* Other product details */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
