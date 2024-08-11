import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './../../../firebase';
import { useNavigate } from 'react-router-dom';

export function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
          console.error('User is not logged in.');
          setLoading(false);
          return;
        }

        const invoicesQuery = query(
          collection(db, 'invoice'),
          where('customerEmail', '==', user.email) // Filter invoices by customer email matching the logged-in user
        );

        const querySnapshot = await getDocs(invoicesQuery);
        const invoicesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error fetching invoices: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  const handleViewClick = (invoiceNumber) => {
    navigate(`/screen/invoicedetails/${invoiceNumber}`);
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Invoices</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ref-No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sales Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Factory Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">PhoneNumber</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(invoice.dateIssued).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{invoice.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.salesPerson}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.factoryDetails}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{invoice.factoryPhoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleViewClick(invoice.invoiceNumber)}
                  >
                    <h5>View</h5>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Invoice;
