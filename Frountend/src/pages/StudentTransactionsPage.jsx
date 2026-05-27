import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { mediaUrl } from "../services/media.js";

export function StudentTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.getMyPayments();
        setTransactions(response.data.payload || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalSpent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  if (loading) {
    return <p className="py-8 text-center">Loading transactions...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
          <p className="text-sm text-slate-500">Here u can view all your course purchases and payments</p>
        </div>
        <Link
          to="/student/dashboard"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="font-semibold text-red-700">{error}</p>
        </div>
      )}

      {!error && transactions.length > 0 && (
        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(6,95,70,0.06)]">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Spent</p>
              <p className="mt-2 text-3xl font-bold text-emerald-800">Rs.{totalSpent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transactions</p>
              <p className="mt-2 text-3xl font-bold text-emerald-800">{transactions.length}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="font-semibold text-green-700">All Successful</span>
              </p>
            </div>
          </div>
        </article>
      )}

      {transactions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">All Transactions</h2>

          <div className="overflow-x-auto rounded-3xl border border-emerald-100 bg-white shadow-[0_18px_40px_rgba(6,95,70,0.06)]">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Course Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Date & Time
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Order ID
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction._id || index}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                          {transaction.courseId?.thumbnailUrl ? (
                          <img
                            src={mediaUrl(transaction.courseId.thumbnailUrl)}
                            alt={transaction.courseId.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                            C
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {transaction.courseId?.title || "Unknown Course"}
                          </p>
                          <p className="text-xs text-slate-500">Course Purchase</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-emerald-800">Rs.{transaction.amount?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{transaction.currency}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{formatDate(transaction.paidAt)}</p>
                      <p className="text-xs text-slate-500">{formatTime(transaction.paidAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-slate-600">
                        {transaction.orderId?.substring(0, 12)}...
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link
                        to={`/courses/${transaction.courseId?._id}`}
                        className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        View Course
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-slate-100 grid place-items-center">
            <span className="text-xl">💳</span>
          </div>
          <p className="text-base font-semibold text-slate-700">No transactions yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Enroll in a paid course to see your transaction history here.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </section>
  );
}
