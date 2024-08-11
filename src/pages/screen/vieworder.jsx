import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './../../../firebase';

export function ViewOrder() {
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const date = searchParams.get('date');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const registrationsQuery = query(collection(db, 'registrations'), where('email', '==', email));
        const registrationsSnapshot = await getDocs(registrationsQuery);

        let registrationData = {};
        registrationsSnapshot.forEach(doc => {
          registrationData = doc.data();
        });

        const ordersQuery = query(
          collection(db, 'DOrders'),
          where('email', '==', email),
          where('date', '==', date)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        let combinedOrder = {
          email: registrationData.email,
          name: registrationData.name,
          phone: registrationData.phone,
          address: `${registrationData.district}, ${registrationData.state}`,
          products: [],
          totalAmount: 0,
          totalOrders: 0,
        };

        ordersSnapshot.forEach(doc => {
          const data = doc.data();
          data.items.forEach(item => {
            combinedOrder.products.push({
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              totalAmount: item.totalAmount,
              date: data.date,
            });
            combinedOrder.totalAmount += item.totalAmount;
          });
          combinedOrder.totalOrders += 1;
        });

        setOrderSummary(combinedOrder);
      } catch (error) {
        console.error('Error fetching order details: ', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (email && date) {
      fetchOrderDetails();
    }
  }, [email, date]);

  const handleSaveOrder = async () => {
    if (!orderSummary) return;

    const factoryInvoiceData = {
      customerAddress: orderSummary.address,
      dateIssued: date,
      factoryDetails: "Guntur, Nallapadu",
      factoryPhoneNumber: "1324563678",
      invoiceNumber: Math.floor(100000 + Math.random() * 900000),
      invoiceTo: orderSummary.name,
      items: orderSummary.products.map(product => ({
        item: product.productName,
        price: product.price,
        quantity: product.quantity,
        cost: product.totalAmount,
      })),
      salesPerson: "Sarath Kuruganti",
      generatedby: "factory",
      total: orderSummary.totalAmount,
    };

    try {
      // Save the order as an invoice
      await addDoc(collection(db, 'invoice'), factoryInvoiceData);

      // Fetch all orders to delete
      const ordersQuery = query(
        collection(db, 'DOrders'),
        where('email', '==', email),
        where('date', '==', date)
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      // Delete each order document
      const deletePromises = [];
      ordersSnapshot.forEach(docSnapshot => {
        const orderDocRef = doc(db, 'DOrders', docSnapshot.id);
        deletePromises.push(deleteDoc(orderDocRef));
      });

      await Promise.all(deletePromises);

      alert('Order saved and deleted successfully!');
    } catch (error) {
      console.error('Error saving order or deleting details: ', error);
      alert('Failed to save order or delete order details. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!orderSummary || orderSummary.products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">No orders found for this email and date.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold">
            Customer: {orderSummary.name} ({orderSummary.email})
          </h3>
          <p>
            <strong>Phone:</strong> {orderSummary.phone} | <strong>Address:</strong> {orderSummary.address}
          </p>
        </div>

        <div className="mb-6 text-center">
          <p>
            <strong>Date:</strong> {date} | <strong>Total Orders:</strong> {orderSummary.totalOrders} | <strong>Total Amount:</strong> ₹{orderSummary.totalAmount}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">PRODUCT</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">PRICE</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">QUANTITY</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-white">TOTAL AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {orderSummary.products.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">{product.productName}</td>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">₹{product.price}</td>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">{product.quantity}</td>
                  <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">₹{product.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSaveOrder}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 focus:outline-none"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewOrder;
