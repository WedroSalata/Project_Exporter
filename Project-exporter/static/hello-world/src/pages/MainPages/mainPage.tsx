import React from "react";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import ReportBrowser from "../ReportBrowser/reportBrowser";

function MainPage() {
  return (
    <Tabs
      // onChange={(index) => console.log("Selected Tab", index + 1)}
      id="default"
    >
      <TabList>
        <Tab>Reports</Tab>
      </TabList>
      <TabPanel>
        <div
          style={{ margin: "0px auto", minWidth: "500px", minHeight: "300px" }}
        >
          <ReportBrowser />
        </div>
      </TabPanel>
    </Tabs>
  );
}

export default MainPage;
