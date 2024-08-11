import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './../../../firebase';

export function InvoiceDetails() {
  const { invoiceNumber } = useParams(); // Get the invoice number from the URL
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const q = query(
          collection(db, 'invoice'),
          where('invoiceNumber', '==', Number(invoiceNumber))
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setInvoice(querySnapshot.docs[0].data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching invoice: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No invoice found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4 text-red-500">Invoice Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <p className="text-lg"><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>   
          <p className="text-lg"><strong>Issued:</strong> {invoice.dateIssued}</p>
          <p className="text-lg"><strong>Customer:</strong> {invoice.invoiceTo}</p>
          <p className="text-lg"><strong>Sales Person:</strong> {invoice.salesPerson}</p>
          <p className="text-lg"><strong>Customer Address:</strong> {invoice.customerAddress}</p>
          <p className="text-lg"><strong>Factory Phone Number:</strong> {invoice.factoryPhoneNumber}</p> 
          <p className="text-lg"><strong>Total:</strong> ₹{invoice.total}</p>
          <p className="text-lg"><strong>Factory Details:</strong> {invoice.factoryDetails}</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoice.items && invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.item}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{item.cost}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoiceDetails;
