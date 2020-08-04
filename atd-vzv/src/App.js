import React from "react";
import SideDrawer from "./views/nav/SideDrawer";
import Content from "./views/content/Content";
import Helmet from "react-helmet";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Helmet>
        {/* <!-- HTML Meta Tags --> */}
        <title>Vision Zero Viewer</title>
        <meta
          name="description"
          content="Austin, Texas Vision Zero Crash Data. View crash data by month, year, transportation mode, demographic groups impacted, time of day, and geographic location."
        />

        {/* <!-- Google / Search Engine Tags --> */}
        <meta itemprop="name" content="Vision Zero Viewer" />
        <meta
          itemprop="description"
          content="Austin, Texas Vision Zero Crash Data. View crash data by month, year, transportation mode, demographic groups impacted, time of day, and geographic location."
        />
        <meta
          itemprop="image"
          content="https://images.zenhubusercontent.com/5dc05535495c1e0001182c16/cea5fd2f-ffd2-4369-82b2-2746de5230f1"
        />

        {/* <!-- Facebook Meta Tags --> */}
        <meta
          property="og:url"
          content="https://visionzero.austin.gov/viewer"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Vision Zero Viewer" />
        <meta
          property="og:description"
          content="Austin, Texas Vision Zero Crash Data. View crash data by month, year, transportation mode, demographic groups impacted, time of day, and geographic location."
        />
        <meta
          property="og:image"
          content="https://images.zenhubusercontent.com/5dc05535495c1e0001182c16/cea5fd2f-ffd2-4369-82b2-2746de5230f1"
        />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vision Zero Viewer" />
        <meta
          name="twitter:description"
          content="Austin, Texas Vision Zero Crash Data. View crash data by month, year, transportation mode, demographic groups impacted, time of day, and geographic location."
        />
        <meta
          name="twitter:image"
          content="https://images.zenhubusercontent.com/5dc05535495c1e0001182c16/cea5fd2f-ffd2-4369-82b2-2746de5230f1"
        />

        {/* <!-- Meta Tags Generated via http://heymeta.com --> */}
      </Helmet>
      <SideDrawer />
      <Content />
    </div>
  );
};

export default App;
