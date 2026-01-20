
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import GoogleCallback from "./pages/GoogleCallback";
import TestAPI from "./pages/TestAPI";
import ApiTest from "./pages/ApiTest";
import AuthTest from "./pages/AuthTest";
import DatabaseViewer from "./pages/DatabaseViewer";
import ChallengesInfoPage from "./pages/ChallengesInfoPage";
import MoodPage from "./pages/MoodPage";
import MeditationPage from "./pages/MeditationPage";
import MeditationDemo from "./pages/MeditationDemo";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import WelcomeIntro from "@/pages/WelcomeIntro";
import MoodCheckPage from "@/pages/MoodCheckPage";
import MoodEncouragementPage from "@/pages/MoodEncouragementPage";
import PositiveMoodCelebratePage from "@/pages/PositiveMoodCelebratePage";
import PositiveMoodMotivationPage from "@/pages/PositiveMoodMotivationPage";
import PositiveMoodReflectionPage from "@/pages/PositiveMoodReflectionPage";
import PositiveMoodAffirmationsPage from "@/pages/PositiveMoodAffirmationsPage";
import PositiveMoodHappinessPromptPage from "@/pages/PositiveMoodHappinessPromptPage";
import NegativeMoodIntroPage from "@/pages/NegativeMoodIntroPage";
import NegativeMoodFactorsPage from "@/pages/NegativeMoodFactorsPage";
import NegativeMoodDetailsPage from "@/pages/NegativeMoodDetailsPage";
import NegativeMoodSupportMessagesPage from "@/pages/NegativeMoodSupportMessagesPage";
import NegativeMoodInspirationPromptPage from "@/pages/NegativeMoodInspirationPromptPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <PWAInstallBanner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Onboarding / dashboard gating */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/welcome" element={
                <ProtectedRoute>
                  <WelcomeIntro />
                </ProtectedRoute>
              } />
              <Route path="/mood-check" element={
                <ProtectedRoute>
                  <MoodCheckPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-positive" element={
                <ProtectedRoute>
                  <PositiveMoodCelebratePage />
                </ProtectedRoute>
              } />
              <Route path="/mood-positive-motivation" element={
                <ProtectedRoute>
                  <PositiveMoodMotivationPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-positive-reflection" element={
                <ProtectedRoute>
                  <PositiveMoodReflectionPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-positive-affirmations" element={
                <ProtectedRoute>
                  <PositiveMoodAffirmationsPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-positive-happiness" element={
                <ProtectedRoute>
                  <PositiveMoodHappinessPromptPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-negative" element={
                <ProtectedRoute>
                  <NegativeMoodIntroPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-negative-factors" element={
                <ProtectedRoute>
                  <NegativeMoodFactorsPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-negative-details" element={
                <ProtectedRoute>
                  <NegativeMoodDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-negative-support" element={
                <ProtectedRoute>
                  <NegativeMoodSupportMessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-negative-inspiration" element={
                <ProtectedRoute>
                  <NegativeMoodInspirationPromptPage />
                </ProtectedRoute>
              } />
              <Route path="/mood-encouragement" element={
                <ProtectedRoute>
                  <MoodEncouragementPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/test-api" element={
                <ProtectedRoute>
                  <TestAPI />
                </ProtectedRoute>
              } />
              <Route path="/api-test" element={
                <ProtectedRoute>
                  <ApiTest />
                </ProtectedRoute>
              } />
              <Route path="/auth-test" element={<AuthTest />} />
              <Route path="/database" element={
                <ProtectedRoute>
                  <DatabaseViewer />
                </ProtectedRoute>
              } />
              <Route path="/challenges-info" element={
                <ProtectedRoute>
                  <ChallengesInfoPage />
                </ProtectedRoute>
              } />
              <Route path="/mood" element={
                <ProtectedRoute>
                  <MoodPage />
                </ProtectedRoute>
              } />
              <Route path="/meditation" element={
                <ProtectedRoute>
                  <MeditationPage />
                </ProtectedRoute>
              } />
              {/* Unprotected demo route for quick testing */}
              <Route path="/meditation-demo" element={<MeditationDemo />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
