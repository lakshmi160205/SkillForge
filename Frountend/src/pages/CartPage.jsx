import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "../components/CheckoutForm.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../services/api.js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CartPage = () => {
  const { cart, removeFromCart } = useCart();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBuyAllConfirmOpen, setIsBuyAllConfirmOpen] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [isEnrollingFree, setIsEnrollingFree] = useState(false);
  const [isBuyingAll, setIsBuyingAll] = useState(false);

  const cartItems = cart || [];
  const totalPrice = cartItems.reduce((sum, item) => {
    const coursePrice = item.course?.price || 0;
    return sum + coursePrice;
  }, 0);
  const paidCourses = cartItems.filter((item) => (item.course?.price || 0) > 0);
  const freeCourses = cartItems.filter((item) => (item.course?.price || 0) === 0);

  const openCheckout = (course) => {
    setPurchaseError("");
    setPurchaseMessage("");
    setSelectedCourse(course);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedCourse(null);
  };

  const openBuyAllConfirm = () => {
    setPurchaseError("");
    setPurchaseMessage("");
    setIsBuyAllConfirmOpen(true);
  };

  const closeBuyAllConfirm = () => {
    setIsBuyAllConfirmOpen(false);
  };

  const handlePurchaseSuccess = async (successMessage) => {
    setPurchaseMessage(successMessage);
    
    if (selectedCourse?._id === "batch-purchase") {
      // Remove all paid courses from cart
      try {
        for (const item of paidCourses) {
          if (item.course?._id) {
            await removeFromCart(item.course._id);
          }
        }
      } catch {
        // ignore removal failures after successful purchase
      }
    } else if (selectedCourse) {
      // Remove single course from cart
      try {
        await removeFromCart(selectedCourse._id);
      } catch {
        // ignore removal failure after successful purchase
      }
    }
    
    closeCheckout();
  };

  const handleEnrollFree = async (courseId) => {
    setPurchaseError("");
    setPurchaseMessage("");
    setIsEnrollingFree(true);

    try {
      await api.enrollCourse(courseId);
      setPurchaseMessage("You are now enrolled in the free course.");
      await removeFromCart(courseId);
    } catch (err) {
      setPurchaseError(err.response?.data?.message || "Enrollment failed");
    } finally {
      setIsEnrollingFree(false);
    }
  };

  const handleBuyAllCourses = async () => {
    setPurchaseError("");
    setPurchaseMessage("");
    setIsBuyingAll(true);

    try {
      // Enroll in all free courses
      for (const item of freeCourses) {
        if (item.course?._id) {
          try {
            await api.enrollCourse(item.course._id);
            await removeFromCart(item.course._id);
          } catch (err) {
            console.error(`Failed to enroll in free course ${item.course._id}:`, err);
          }
        }
      }

      // If there are paid courses, open checkout with total amount
      if (paidCourses.length > 0) {
        const paidTotal = paidCourses.reduce((sum, item) => sum + (item.course?.price || 0), 0);
        setSelectedCourse({
          _id: "batch-purchase",
          title: `All Paid Courses (${paidCourses.length})`,
          price: paidTotal,
          courses: paidCourses.map((item) => item.course._id),
        });
        setIsCheckoutOpen(true);
        closeBuyAllConfirm();
      } else {
        // All courses are free
        setPurchaseMessage("Successfully enrolled in all free courses!");
        closeBuyAllConfirm();
      }
    } catch (err) {
      setPurchaseError(err.response?.data?.message || "Purchase failed");
    } finally {
      setIsBuyingAll(false);
    }
  };

  return (
    <section className="space-y-6 py-4">
      <div className="grid gap-4 rounded-4xl border border-emerald-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Cart Summary</p>
          <h1 className="text-3xl font-bold text-slate-900">Ready to complete your learning bundle</h1>
          <p className="text-sm text-slate-500">Review your selected courses and check out securely.</p>
        </div>
        <div className="grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700">
            Total: Rs.{totalPrice}
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={openBuyAllConfirm}
              disabled={isBuyingAll}
              className="sf-btn-primary rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isBuyingAll ? "Processing..." : "Buy All Courses"}
            </button>
          )}
        </div>
      </div>

      {purchaseMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {purchaseMessage}
        </div>
      )}
      {purchaseError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {purchaseError}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 px-6 py-10 text-center text-slate-600">
          Your cart is empty. Add a course to cart and come back to complete purchase.
        </div>
      ) : (
        <div className="grid gap-4">
          {cartItems.map((item) => (
            <div key={item.course?._id || item._id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{item.course?.title || "Course"}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {item.course?.category || "Course"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{item.course?.subtitle || "No subtitle available."}</p>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span>By {item.course?.instructorId?.firstName || "Instructor"}</span>
                  <span>• {item.course?.lectures?.length || 0} lectures</span>
                  <span>• Rs.{item.course?.price || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {(item.course?.price || 0) > 0 ? (
                    <button
                      type="button"
                      onClick={() => openCheckout(item.course)}
                      className="sf-btn-primary rounded-2xl px-4 py-2 text-sm font-semibold transition"
                    >
                      Purchase now
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEnrollFree(item.course?._id || item._id)}
                      disabled={isEnrollingFree}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isEnrollingFree ? "Enrolling..." : "Enroll free"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.course?._id || item._id)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy All Confirmation Dialog */}
      {isBuyAllConfirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl">
            <div className="mb-6 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">Confirm Purchase</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to buy all {cartItems.length} course{cartItems.length !== 1 ? "s" : ""} in your cart?
              </p>
              {freeCourses.length > 0 && (
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-800">
                    {freeCourses.length} free course{freeCourses.length !== 1 ? "s" : ""} will be enrolled automatically.
                  </p>
                </div>
              )}
              {paidCourses.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-800">
                    Total amount to pay: Rs.{totalPrice} for {paidCourses.length} paid course{paidCourses.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeBuyAllConfirm}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuyAllCourses}
                disabled={isBuyingAll}
                className="sf-btn-primary flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isBuyingAll ? "Processing..." : "Yes, Buy All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Course Checkout */}
      {isCheckoutOpen && selectedCourse ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-4xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Checkout</h3>
                <p className="text-sm text-slate-500">
                  {selectedCourse._id === "batch-purchase"
                    ? "Complete your purchase for all paid courses in your cart."
                    : "Complete your purchase for the selected course."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  courseId={selectedCourse._id}
                  courseIds={selectedCourse.courses}
                  amount={selectedCourse.price}
                  courseName={selectedCourse.title}
                  onSuccess={handlePurchaseSuccess}
                  onCancel={closeCheckout}
                />
              </Elements>
            ) : (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-slate-700">
                Stripe is not configured. Set `VITE_STRIPE_PUBLISHABLE_KEY` to enable card payments.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CartPage;