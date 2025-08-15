import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Upload from "@/pages/Upload";
import Workers from "@/pages/Workers";
import Projects from "@/pages/Projects";
import Employers from "@/pages/Employers";
import EbaTracking from "@/pages/EbaTracking";
import EbaDetail from "@/pages/EbaDetail";
import Admin from "@/pages/Admin";
import Activities from "@/pages/Activities";
import { UnallocatedWorkspace } from "@/pages/UnallocatedWorkspace";
import NotFound from "./pages/NotFound";
import MyPatch from "@/pages/MyPatch";
import ProjectDetail from "@/pages/ProjectDetail";
import Delegations from "@/pages/Delegations";
import PatchWall from "@/pages/PatchWall";
import PasswordReset from "@/pages/PasswordReset";
import SiteVisitNew from "@/pages/SiteVisitNew";
import SiteVisitDetail from "@/pages/SiteVisitDetail";
import SiteVisitMobile from "@/pages/SiteVisitMobile";
import SiteVisitReports from "@/pages/SiteVisitReports";
 
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset" element={<PasswordReset />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/workers" element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/employers" element={
              <ProtectedRoute>
                <Employers />
              </ProtectedRoute>
            } />
            <Route path="/eba" element={
              <ProtectedRoute>
                <EbaTracking />
              </ProtectedRoute>
            } />
            <Route path="/eba/:id" element={
              <ProtectedRoute>
                <EbaDetail />
              </ProtectedRoute>
            } />
            <Route path="/activities" element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            } />
            <Route path="/workspace/unallocated" element={
              <ProtectedRoute>
                <UnallocatedWorkspace />
              </ProtectedRoute>
            } />
            <Route path="/patch" element={
              <ProtectedRoute>
                <MyPatch />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />
            <Route path="/delegations" element={
              <ProtectedRoute>
                <Delegations />
              </ProtectedRoute>
            } />
            <Route path="/patch/walls" element={
              <ProtectedRoute>
                <PatchWall />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/site-visits/new" element={
              <ProtectedRoute>
                <SiteVisitNew />
              </ProtectedRoute>
            } />
            <Route path="/site-visits/:svCode" element={
              <ProtectedRoute>
                <SiteVisitDetail />
              </ProtectedRoute>
            } />
            <Route path="/m/visit/:svCode" element={
              <ProtectedRoute>
                <SiteVisitMobile />
              </ProtectedRoute>
            } />
            <Route path="/site-visits/reports" element={
              <ProtectedRoute>
                <SiteVisitReports />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
