// App.tsx - Add React.lazy for code splitting
import React, { Suspense } from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import JobCard from "@/components/job-card";

// Lazy load heavy components
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const CVBuilder = React.lazy(() => import("@/pages/cv-builder"));
const Applications = React.lazy(() => import("@/pages/applications"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/cv-builder" component={CVBuilder} />
        <Route path="/applications" component={Applications} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

// =====================================
// Virtual scrolling for large lists
// Use this for job applications list

import { FixedSizeList as List } from 'react-window';

export function VirtualizedJobList({ jobs }: { jobs: Array<any> }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <JobCard job={jobs[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={jobs.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
}