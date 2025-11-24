"use client";

import { useState } from "react";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { OverviewTab } from "./tabs/OverviewTab";
import { UsersTab } from "./tabs/UsersTab";
import { JobsTab } from "./tabs/JobsTab";
import { ApplicationsTab } from "./tabs/ApplicationsTab";
import { FinanceTab } from "./tabs/FinanceTab";
import { EngagementTab } from "./tabs/EngagementTab";
import { ResumesTab } from "./tabs/ResumesTab";

interface AnalyticsTabsProps {
  data: any;
}

export function AnalyticsTabs({ data }: AnalyticsTabsProps) {
  return (
    <TabGroup>
      <TabList className="mt-4">
        <Tab>Overview</Tab>
        <Tab>Users</Tab>
        <Tab>Jobs</Tab>
        <Tab>Applications</Tab>
        <Tab>Resumes</Tab>
        <Tab>Finance</Tab>
        <Tab>Engagement</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <OverviewTab data={data} />
        </TabPanel>
        <TabPanel>
          <UsersTab data={data} />
        </TabPanel>
        <TabPanel>
          <JobsTab data={data} />
        </TabPanel>
        <TabPanel>
          <ApplicationsTab data={data} />
        </TabPanel>
        <TabPanel>
          <ResumesTab data={data} />
        </TabPanel>
        <TabPanel>
          <FinanceTab data={data} />
        </TabPanel>
        <TabPanel>
          <EngagementTab data={data} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

