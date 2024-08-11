import {
  HomeIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Home, MyOrders, Orders, Products, Invoice, Cart } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { InvoiceDetails, ViewOrder, ViewProduct } from "@/pages/screen";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "products",
        path: "/products",
        element: <Products />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "mandal orders",
        path: "/orders",
        element: <Orders />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "my orders",
        path: "/myorders",
        element: <MyOrders />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "cart",
        path: "/cart",
        element: <Cart />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "invoice",
        path: "/invoice",
        element: <Invoice />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
  {
    layout: "screen",
    pages: [
      {
        name: "invoicedetails",
        path: "/invoicedetails/:invoiceNumber",
        element: <InvoiceDetails />,
      },
      {
        name: "vieworder",
        path: "/vieworder",
        element: <ViewOrder />,
      },
      {
        name: "viewproduct",
        path: "/viewproduct/:documentId",
        element: <ViewProduct />,
      },
    ],
  },
];

export default routes;
