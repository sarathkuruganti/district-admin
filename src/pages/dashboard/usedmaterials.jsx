import React, { useEffect, useState } from 'react';
import { db } from './../../../firebase'; // Ensure the path is correct
import { collection, getDocs } from 'firebase/firestore';
export function UsedMaterials() {
  const [consumedMaterials, setConsumedMaterials] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchConsumedMaterials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'consumedRawMaterials'));
        const materials = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setConsumedMaterials(materials);
      } catch (error) {
        console.error("Error fetching consumed materials: ", error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    fetchConsumedMaterials();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Consumed Raw Materials</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Consumed Quantity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consumedMaterials.map((material) => (
              <tr key={material.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.material}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.consumed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsedMaterials;
