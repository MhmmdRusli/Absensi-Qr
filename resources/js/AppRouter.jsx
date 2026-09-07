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
import TeacherIndex from './Pages/Admin/Teacher/Index';
import SessionCreate from './Pages/Teacher/Session/Create';
import SessionShow from './Pages/Teacher/Session/Show';
import ClassRoomIndex from './Pages/Admin/ClassRoom/Index';
import SubjectIndex from './Pages/Admin/Subject/Index';

import Scan from './Pages/Student/Scan';
import History from './Pages/Student/History';

import ReportIndex from './Pages/Admin/Report/Index';
import SessionIndex from './Pages/Teacher/Session/Index';


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
                        <Route path="teachers" element={<TeacherIndex />} />
                        <Route path="classes" element={<ClassRoomIndex />} />
                        <Route path="subjects" element={<SubjectIndex />} />
                        <Route path="reports" element={<ReportIndex />} />
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
                        <Route path="sessions/create" element={<SessionCreate />} />
                        <Route path="sessions/:id" element={<SessionShow />} />
                        <Route path="sessions" element={<SessionIndex />} />
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
                        <Route path="scan" element={<Scan />} />
                        <Route path="history" element={<History />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}