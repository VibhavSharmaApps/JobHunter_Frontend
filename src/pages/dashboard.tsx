import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import UserPreferences from "@/components/dashboard/user-preferences";
import UserProfile from "@/components/dashboard/user-profile";
import RecentApplications from "@/components/dashboard/recent-applications";
import UrlManagement from "@/components/job-urls/url-management";
import ApplicationsList from "@/components/applications/applications-list";
import CVBuilderPlaceholder from "@/components/cv-builder/cv-builder-placeholder";
import SettingsPanel from "@/components/settings/settings-panel";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-600">Manage your job applications and preferences</p>
            </div>
            <StatsCards />
            <UserProfile />
            <UserPreferences />
            <RecentApplications />
          </div>
        );
      case "urls":
        return <UrlManagement />;
      case "applications":
        return <ApplicationsList />;
      case "cv-builder":
        return <CVBuilderPlaceholder />;
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold text-slate-900">JobFlow</span>
            <div className="w-10"></div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
