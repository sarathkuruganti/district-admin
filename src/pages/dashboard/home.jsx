import React, { useState, useEffect } from 'react';
import { Typography } from '@material-tailwind/react';
import { StatisticsCard } from '@/widgets/cards';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { BanknotesIcon, UserPlusIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import StatisticsChart from '@/widgets/charts/statistics-chart'; // Import the StatisticsChart component

export function Home() {
  const [statisticsCardsData, setStatisticsCardsData] = useState([
    {
      color: "orange",
      icon: BanknotesIcon,
      title: "Total Expenses",
      value: "₹0.00",
      footer: {
        color: "text-red-500",
        value: "",
        label: "Spent on raw materials",
      },
    },
    {
      color: "green",
      icon: UsersIcon,
      title: "Total Earnings",
      value: "₹0.00",
      footer: {
        color: "text-green-500",
        value: "",
        label: "Total earnings from orders",
      },
    },
    {
      color: "blue",
      icon: UserPlusIcon,
      title: "Profit or Loss",
      value: "₹0.00",
      footer: {
        color: "text-blue-500",
        value: "",
        label: "Profit or Loss",
      },
    },
    {
      color: "purple",
      icon: ChartBarIcon,
      title: "Finished Orders",
      value: 0,
      footer: {
        color: "text-blue-500",
        value: "",
        label: "Total finished orders",
      },
    },
  ]);

  const [expensesChartData, setExpensesChartData] = useState({
    series: [{ name: 'Expenses', data: [] }],
    options: {
      chart: {
        type: 'line',
      },
      xaxis: {
        categories: [],
      },
    },
  });

  const [ordersChartData, setOrdersChartData] = useState({
    series: [{ name: 'Orders Count', data: [] }],
    options: {
      chart: {
        type: 'line',
      },
      xaxis: {
        categories: [],
      },
    },
  });
   const [profitChartData, setProfitChartData] = useState({
    series: [{ name: 'Profit', data: [] }],
    options: {
      chart: {
        type: 'line',
      },
      xaxis: {
        categories: [],
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const rawMaterialsSnapshot = await getDocs(collection(db, 'rawMaterials'));
      const invoicesQuery = query(
        collection(db, 'invoice'),
        where('generatedby', '==', 'factory')
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);

      const rawMaterialsData = rawMaterialsSnapshot.docs.map(doc => doc.data());
      const invoicesData = invoicesSnapshot.docs.map(doc => doc.data());

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Filter data for the current month
      const currentMonthExpenses = rawMaterialsData.filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const currentMonthInvoices = invoicesData.filter(invoice => {
        const date = new Date(invoice.dateIssued);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, item) => sum + parseFloat(item.price), 0);
      const totalEarningsThisMonth = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const totalProfitOrLossThisMonth = totalEarningsThisMonth - totalExpensesThisMonth;

      // Prepare data for Expenses Chart
      const expenseMonthlyData = rawMaterialsData.reduce((acc, item) => {
        const date = new Date(item.date);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;
        acc[monthYear] = (acc[monthYear] || 0) + parseFloat(item.price);
        return acc;
      }, {});

      const expenseCategories = Object.keys(expenseMonthlyData).sort((a, b) => new Date(a) - new Date(b));
      const expenseValues = expenseCategories.map(category => expenseMonthlyData[category]);

      // Prepare data for Orders by Month Chart
      const orderCounts = invoicesData.reduce((acc, invoice) => {
        const date = new Date(invoice.dateIssued);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});

      const orderCategories = Object.keys(orderCounts).sort((a, b) => new Date(a) - new Date(b));
      const orderValues = orderCategories.map(category => orderCounts[category]);

      // Calculate profit/loss for each month
      const profitMonthlyData = invoicesData.reduce((acc, invoice) => {
        const date = new Date(invoice.dateIssued);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;

        const monthlyExpense = rawMaterialsData
          .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === year;
          })
          .reduce((sum, item) => sum + parseFloat(item.price), 0);

        const monthlyEarnings = invoicesData
          .filter(item => {
            const itemDate = new Date(item.dateIssued);
            return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === year;
          })
          .reduce((sum, item) => sum + item.total, 0);

        const monthlyProfit = monthlyEarnings - monthlyExpense;
        acc[monthYear] = monthlyProfit;

        return acc;
      }, {});

      const profitCategories = Object.keys(profitMonthlyData).sort((a, b) => new Date(a) - new Date(b));
      const profitValues = profitCategories.map(category => profitMonthlyData[category]);


      setStatisticsCardsData([
        {
          color: 'orange',
          icon: BanknotesIcon,
          title: "Month's Expenses",
          value: `₹${totalExpensesThisMonth.toFixed(2)}`,
          footer: {
            color: 'text-red-500',
            value: '',
            label: 'Spent on raw materials',
          },
        },
        {
          color: 'green',
          icon: UsersIcon,
          title: "Month's Earnings",
          value: `₹${totalEarningsThisMonth.toFixed(2)}`,
          footer: {
            color: 'text-green-500',
            value: '',
            label: 'Total earnings from orders',
          },
        },
        {
          color: 'blue',
          icon: UserPlusIcon,
          title: "Month's Profit or Loss",
          value: `₹${totalProfitOrLossThisMonth.toFixed(2)}`,
          footer: {
            color: totalProfitOrLossThisMonth >= 0 ? 'text-green-500' : 'text-red-500',
            value: '',
            label: totalProfitOrLossThisMonth >= 0 ? 'Profit from orders' : 'Loss from orders',
          },
        },
        {
          color: 'purple',
          icon: ChartBarIcon,
          title: "Finished Orders",
          value: currentMonthInvoices.length,
          footer: {
            color: 'text-blue-500',
            value: '',
            label: 'Total finished orders',
          },
        },
      ]);

      setExpensesChartData({
        series: [{ name: 'Expenses', data: expenseValues }],
        options: {
          chart: {
            type: 'line',
          },
          xaxis: {
            categories: expenseCategories,
            labels: {
              rotate: -45,
              style: {
                colors: '#333',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
              },
            },
          },
        },
      });

      setOrdersChartData({
        series: [{ name: 'Orders Count', data: orderValues }],
        options: {
          chart: {
            type: 'line',
          },
          xaxis: {
            categories: orderCategories,
            labels: {
              rotate: -45,
              style: {
                colors: '#333',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
              },
            },
          },
        },
      });

      setProfitChartData({
        series: [{ name: 'Profit', data: profitValues }],
        options: {
          chart: {
            type: 'line',
          },
          xaxis: {
            categories: profitCategories,
            labels: {
              rotate: -45,
              style: {
                colors: '#333',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
              },
            },
          },
        },
      });
    };

    fetchData();
  }, []);

  return (
    <div className="">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: 'w-6 h-6 text-white',
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-2">
        <StatisticsChart
          color="white"
          chart={expensesChartData}
          title="Expenses Over Months"
        />
        <StatisticsChart
          color="white"
          chart={ordersChartData}
          title="Orders Over Months"
        />
        <StatisticsChart
          color="white"
          chart={profitChartData}
          title="Profit Over Months"
        />
      </div>
    </div>
  );
}

export default Home;
