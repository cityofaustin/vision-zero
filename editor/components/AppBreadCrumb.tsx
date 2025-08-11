import { useMemo, Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Col from "react-bootstrap/Col";
import { routes } from "@/configs/routes";

interface Crumb {
  path: string;
  label: string;
  type: "page" | "id";
}

/**
 * Hook that parses the current path into an array of usable crumbs
 */
const useCrumbs = (path: string): Crumb[] =>
  useMemo(() => {
    const [, ...parts] = path.split("/");
    const crumbs: Crumb[] = [];
    if (parts.length === 0) {
      // we are at root
      return crumbs;
    }
    // find the formatted route label
    const pathPart = parts[0];
    const route = routes.find((route) => route.path === pathPart.toLowerCase());
    crumbs.push({
      label: route ? route.label : pathPart,
      type: "page",
      path: pathPart,
    });
    if (parts.length > 1) {
      crumbs.push({
        label: decodeURI(parts[1]),
        type: "id",
        path: pathPart,
      });
    }
    // only two levels deep supported
    return crumbs;
  }, [path]);

/**
 * Bread crumb component - this is a proof of concept
 * and needs more attention
 */
export default function AppBreadCrumb() {
  const pathName = usePathname();
  const crumbs = useCrumbs(pathName);
  const isDetailsPage = crumbs?.length > 1;

  if (!isDetailsPage) {
    return null;
  }

  return (
    <div className="pb-2">
      <Col>
        {isDetailsPage &&
          crumbs?.map((crumb, i) => {
            if (i < crumbs.length - 1) {
              return (
                <Fragment key={crumb.label}>
                  <span>
                    <Link
                      className="text-decoration-none"
                      href={`/${crumb.path}`}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                  <span className="mx-2 fw-light text-secondary">{"/"}</span>
                </Fragment>
              );
            } else {
              return (
                <span key={crumb.label} className="text-secondary">
                  {crumb.label}
                </span>
              );
            }
          })}
      </Col>
    </div>
  );
}
