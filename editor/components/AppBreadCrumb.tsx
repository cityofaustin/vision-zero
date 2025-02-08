import { useMemo, Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Col from "react-bootstrap/Col";

interface Crumb {
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
    crumbs.push({
      // if we don't remove the query string, nextjs can hit a server/client mismatch on login
      // todo: this can't be the right way to fix this
      // todo: test if still an issue with app router
      label: parts[0].split("?")[0],
      type: "page",
    });
    if (parts.length > 1) {
      crumbs.push({
        label: decodeURI(parts[1].split("?")[0]),
        type: "id",
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
    <div className="px-3 py-2">
      <Col>
        {isDetailsPage &&
          crumbs?.map((crumb, i) => {
            if (i < crumbs.length - 1) {
              return (
                <Fragment key={crumb.label}>
                  <span>
                    <Link
                      className="text-decoration-none text-capitalize"
                      href={`/${crumb.label}`}
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
