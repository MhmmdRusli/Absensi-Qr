import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';

import Login from './Pages/Login';

import AdminLayout from './Layouts/AdminLayouts';
import TeacherLayout from './Layouts/TeacherLayouts';
import StudentLayout from './Layouts/StudentLayouts';

import AdminDashboard from './Pages/Admin/Dashboard';
import TeacherDashboard from './Pages/Teacher/Dashboard';
import StudentDashboard from './Pages/Student/Dashboard';

import StudentIndex from './Pages/Admin/Student/Index';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="students" element={<StudentIndex />} />
                    </Route>

                    <Route
                        path="/teacher"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<TeacherDashboard />} />
                    </Route>

                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<StudentDashboard />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}