import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { CourseDetailsPage } from "./pages/CourseDetailsPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { InstructorCourseDetailsPage } from "./pages/InstructorCourseDetailsPage.jsx";
import { InstructorDashboardPage } from "./pages/InstructorDashboardPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { StudentDashboardPage } from "./pages/StudentDashboardPage.jsx";
import { StudentCourseLecturesPage } from "./pages/StudentCourseLecturesPage.jsx";
import { StudentTransactionsPage } from "./pages/StudentTransactionsPage.jsx";
import CartPage from "./pages/CartPage.jsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />}/>
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses/:courseId/lectures"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentCourseLecturesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/transactions"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentTransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/courses/:courseId"
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <InstructorCourseDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
