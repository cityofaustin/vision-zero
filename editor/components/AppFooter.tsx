import pckg from "../package.json";

/**
 * The app footer component
 */
export default function AppFooter() {
  return (
    <div className="app-footer text-secondary text-center py-2 px-3 border-top d-flex justify-content-between">
      <span>Vision Zero Editor v{pckg.version}</span>
      <span>
        Built by{" "}
        <a href="https://austinmobility.io">Data & Technology Services</a>
      </span>
    </div>
  );
}
