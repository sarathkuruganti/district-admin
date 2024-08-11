import { Routes, Route } from "react-router-dom";
import { Navbar, Footer, Sidenav } from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController } from "@/context";

export function Screen() {
  const [controller] = useMaterialTailwindController();
  const { sidenavType } = controller;

  // Filter routes to include only those with layout "dashboard" or "auth"
  const filteredRoutes = routes.filter(route => route.layout === "dashboard");

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={filteredRoutes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
      <Routes>
        {routes.map(
          ({ layout, pages }) =>
            layout === "screen" &&
            pages.map(({ path, element }) => (
              <Route key={path} exact path={path} element={element} />
            ))
        )}
      </Routes>
      </div>
    </div>
  );
}

Screen.displayName = "/src/layout/Screen.jsx";

export default Screen;
