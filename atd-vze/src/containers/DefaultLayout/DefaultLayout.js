import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import * as router from "react-router-dom";
import { Container } from "reactstrap";
import { useAuth0 } from "../../auth/authContext";

import {
  AppAside,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from "@coreui/react";
// sidebar nav config
import { navigation } from "../../_nav";
// routes config
import routes from "../../routes";

const DefaultAside = React.lazy(() => import("./DefaultAside"));
const DefaultFooter = React.lazy(() => import("./DefaultFooter"));
const DefaultHeader = React.lazy(() => import("./DefaultHeader"));

/**
 * Custom hook to observe the body element for changes in the class attribute and update the state.
 * See /public/index.html for the ID added to the body element that is used in this hook.
 * See https://github.com/coreui/coreui-react/blob/2dc4521d7e43dd5cc48d0ed184dfb03ca765207a/src/SidebarToggler.js#L34-L41
 */
const useIsAppSideBarOpen = () => {
  const openSideBarClassName = "sidebar-lg-show";
  const sideBarLocalStorageKey = "isAppSideBarOpen";
  const appBodyId = "body-outside-app";

  const initialIsAppSideBarOpen = localStorage.getItem(sideBarLocalStorageKey);
  const doesLocalStorageExist = initialIsAppSideBarOpen !== null;

  const [isAppSideBarOpen, setIsAppSideBarOpen] = React.useState(
    doesLocalStorageExist ? JSON.parse(initialIsAppSideBarOpen) : true
  );

  // On mount, set an observer that watches the body element for changes in the class attribute
  // and updates the state and local storage to match the classes used by CoreUI to show/hide the sidebar
  React.useEffect(() => {
    const elemToObserve = document.getElementById(appBodyId);

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "class") {
          const isAppSideBarOpenClassPresent = mutation.target.classList.contains(
            openSideBarClassName
          );

          setIsAppSideBarOpen(isAppSideBarOpenClassPresent);
          localStorage.setItem(
            sideBarLocalStorageKey,
            isAppSideBarOpenClassPresent
          );
        }
      });
    });
    observer.observe(elemToObserve, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Sync the body class with the state of the sidebar
  React.useEffect(() => {
    const elemToUpdate = document.getElementById(appBodyId);
    const isOpenClassPresent = elemToUpdate.classList.contains(
      openSideBarClassName
    );

    if (isAppSideBarOpen && !isOpenClassPresent) {
      elemToUpdate.classList.add(openSideBarClassName);
    } else if (!isAppSideBarOpen && isOpenClassPresent) {
      elemToUpdate.classList.remove(openSideBarClassName);
    }
  }, [isAppSideBarOpen]);
};

const DefaultLayout = props => {
  const { getRoles } = useAuth0();
  const roles = getRoles();

  useIsAppSideBarOpen();

  const loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  );

  const signOut = e => {
    e.preventDefault();
    props.history.push("/login");
  };

  return (
    <div className="app">
      <AppHeader fixed>
        <Suspense fallback={loading()}>
          <DefaultHeader onLogout={e => signOut(e)} />
        </Suspense>
      </AppHeader>
      <div className="app-body">
        <AppSidebar fixed display="lg">
          <AppSidebarHeader />
          <AppSidebarForm />
          <Suspense>
            <AppSidebarNav
              // Render nav links based on roles
              navConfig={navigation(roles)}
              {...props}
              router={router}
            />
          </Suspense>
          <AppSidebarFooter />
          <AppSidebarMinimizer />
        </AppSidebar>
        <main className="main">
          <AppBreadcrumb appRoutes={routes(roles)} router={router} />
          <Container fluid>
            <Suspense fallback={loading()}>
              <Switch>
                {/* Render routes based on roles */}
                {routes(roles).map((route, idx) => {
                  return route.component ? (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={props => <route.component {...props} />}
                    />
                  ) : null;
                })}
                <Redirect from="/" to="/crashes" />
              </Switch>
            </Suspense>
          </Container>
        </main>
        <AppAside fixed>
          <Suspense fallback={loading()}>
            <DefaultAside />
          </Suspense>
        </AppAside>
      </div>
      <AppFooter>
        <Suspense fallback={loading()}>
          <DefaultFooter />
        </Suspense>
      </AppFooter>
    </div>
  );
};

export default DefaultLayout;
