import { useMemo, Fragment } from "react";
import { useRouter } from "next/router";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface Crumb {
  label: string;
  type: "page" | "id";
}

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
      label: parts[0].split("?")[0],
      type: "page",
    });

    if (parts.length > 1) {
      crumbs.push({
        label: parts[1].split("?")[0],
        type: "id",
      });
    }
    // only two levels deep supported
    return crumbs;
  }, [path]);

export default function AppBreadCrumb() {
  const router = useRouter();
  const crumbs = useCrumbs(router.asPath);
  // todo: this is not thought at much at all
  return (
    <Row className="mt-2 mb-3">
      <Col>
        {crumbs?.map((crumb, i) => {
          if (i < crumbs.length - 1) {
            return (
              <Fragment key={crumb.label}>
                <span className="fw-light">
                  <a href={`/${crumb.label}`}>{crumb.label}</a>
                </span>
                <span className="mx-2 fw-light">{"/"}</span>
              </Fragment>
            );
          } else {
            return (
              <span key={crumb.label} className="fw-bold">
                {crumb.label}
              </span>
            );
          }
        })}
      </Col>
    </Row>
  );
}
