import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";


export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in as admin");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/reports?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(response.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in as admin");
        return;
      }

      setDeletingReviewId(reviewId);

      await axios.delete(`http://localhost:5000/api/reports/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Review and all reports deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedReport(null);
      
      // Refresh reports list
      fetchReports();
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(err.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDismissReports = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in as admin");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/reports/dismiss/${reviewId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Reports dismissed successfully");
      
      // Refresh reports list
      fetchReports();
    } catch (err) {
      console.error("Error dismissing reports:", err);
      toast.error(err.response?.data?.message || "Failed to dismiss reports");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const groupReasonsByType = (reasons) => {
    const counts = {};
    reasons.forEach((reason) => {
      counts[reason] = (counts[reason] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />

        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Reported Comments
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review and moderate reported course reviews
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Reports</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{reports.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Report Count</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  {reports.reduce((sum, r) => sum + r.reportCount, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Highest Reports</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                  {reports.length > 0 ? Math.max(...reports.map(r => r.reportCount)) : 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
          </motion.div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <AlertTriangle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Reports
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              All reports have been resolved or there are no reports to review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.reviewId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={
                          report.student?.profileImage ||
                          "https://via.placeholder.com/48"
                        }
                        alt={report.student?.name || "Student"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {report.student?.name || "Anonymous"}
                          </h3>
                          {renderStars(report.rating)}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          Course: <span className="font-medium">{report.course?.title || "Unknown"}</span>
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">
                          Posted: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Report Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      {report.reportCount} {report.reportCount === 1 ? "Report" : "Reports"}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {report.comment && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 dark:text-gray-200">{report.comment}</p>
                    </div>
                  )}

                  {/* Report Reasons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Report Reasons:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(groupReasonsByType(report.reasons)).map(
                        ([reason, count]) => (
                          <span
                            key={reason}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                          >
                            {reason} ({count})
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Latest Report Date */}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Latest report: {new Date(report.latestReportDate).toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDeleteConfirm(true);
                      }}
                      disabled={deletingReviewId === report.reviewId}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingReviewId === report.reviewId
                        ? "Deleting..."
                        : "Delete Review"}
                    </button>
                    <button
                      onClick={() => handleDismissReports(report.reviewId)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Dismiss Reports
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-4 border border-gray-200/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Review?
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              This will permanently delete the review and all {selectedReport.reportCount}{" "}
              associated report(s). This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(selectedReport.reviewId)}
                disabled={deletingReviewId === selectedReport.reviewId}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
              >
                {deletingReviewId === selectedReport.reviewId
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
