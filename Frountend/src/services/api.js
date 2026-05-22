import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

const storedToken = localStorage.getItem("token");
if (storedToken) {
  setAuthToken(storedToken);
}

export const api = {
  register: (payload) => apiClient.post("/common-api/register", payload),
  login: (payload) => apiClient.post("/common-api/authenticate", payload),
  logout: () => apiClient.post("/common-api/logout"),

  getCourses: (params) => apiClient.get("/common-api/courses", { params }),
  getCourseById: (courseId) => apiClient.get(`/common-api/courses/${courseId}`),

  getStudentDashboard: () => apiClient.get("/student-api/dashboard"),
  getStudentCourseProgress: (courseId) => apiClient.get(`/student-api/courses/${courseId}/progress`),
  enrollCourse: (courseId) => apiClient.post(`/student-api/courses/${courseId}/enroll`),
  createPaymentOrder: (courseId, courseIds) =>
    apiClient.post("/payment-api/create-order", { courseId, courseIds }),
  verifyPayment: (paymentIntentId, courseId, courseIds) =>
    apiClient.post("/payment-api/verify", { paymentIntentId, courseId, courseIds }),
  retryVerifyPayment: (courseId, courseIds) =>
    apiClient.post("/payment-api/retry-verify", { courseId, courseIds }),
  getMyPayments: () => apiClient.get("/payment-api/my-payments"),
  submitCourseReview: (courseId, payload) =>
    apiClient.post(`/student-api/courses/${courseId}/reviews`, payload),
  updateProgress: (courseId, payload) =>
    apiClient.patch(`/student-api/courses/${courseId}/progress`, payload),

  getInstructorDashboard: () => apiClient.get("/instructor-api/dashboard"),
  getInstructorCourses: () => apiClient.get("/instructor-api/courses"),
  getInstructorCourseById: (courseId) => apiClient.get(`/instructor-api/courses/${courseId}`),
  getInstructorCourseReviews: (courseId) => apiClient.get(`/instructor-api/courses/${courseId}/reviews`),
  createCourse: (payload) => apiClient.post("/instructor-api/courses", payload),
  updateCourse: (courseId, payload) => apiClient.patch(`/instructor-api/courses/${courseId}`, payload),
  addLectureToCourse: (courseId, payload) =>
    apiClient.post(`/instructor-api/courses/${courseId}/lectures`, payload),
  updateLecture: (courseId, lectureId, payload) =>
    apiClient.patch(`/instructor-api/courses/${courseId}/lectures/${lectureId}`, payload),
  deleteLectureFromCourse: (courseId, lectureId) =>
    apiClient.delete(`/instructor-api/courses/${courseId}/lectures/${lectureId}`),
  uploadCourseThumbnail: (file) => {
    const formData = new FormData();
    formData.append("thumbnail", file);
    return apiClient.post("/instructor-api/uploads/thumbnail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadVideo: (formData) => apiClient.post("/video-api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  uploadTempLectureVideo: (formData) => apiClient.post("/video-api/upload-temp", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getVideosByCourse: (courseId) => apiClient.get(`/video-api/course/${courseId}`),
  deleteVideo: (videoId) => apiClient.delete(`/video-api/${videoId}`),

  getAdminDashboard: () => apiClient.get("/admin-api/dashboard"),
  getUsers: () => apiClient.get("/admin-api/users"),
  updateUserStatus: (userId, isActive) =>
    apiClient.patch(`/admin-api/users/${userId}/status`, { isActive }),
  getStudentDetails: (studentId) => apiClient.get(`/admin-api/students/${studentId}/details`),
  getInstructorDetails: (instructorId) => apiClient.get(`/admin-api/instructors/${instructorId}/details`),
};
