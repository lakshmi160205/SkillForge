import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { api } from "../services/api.js";

export function CheckoutForm({ courseId, amount, courseName, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.createPaymentOrder(courseId);

      // If the API indicates the student is already enrolled, close modal and refresh state.
      if (data?.payload) {
        onSuccess("Student already enrolled in this course");
        return;
      }

      const { clientSecret, paymentIntentId } = data;

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || "Card payment failed");
        return;
      }

      let verifyResponse;
      try {
        verifyResponse = await api.verifyPayment(paymentIntentId, courseId);
      } catch {
        // A short retry avoids leaving users stuck in pending due to transient failures.
        await new Promise((resolve) => setTimeout(resolve, 1200));
        try {
          verifyResponse = await api.verifyPayment(paymentIntentId, courseId);
        } catch {
          // Final fallback sync checks latest payment state and updates enrollment if possible.
          verifyResponse = await api.retryVerifyPayment(courseId);
        }
      }

      if (verifyResponse.data?.success) {
        onSuccess(verifyResponse.data?.message || "Payment successful");
      } else {
        setError(verifyResponse.data?.message || "Payment verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Course</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{courseName}</p>
        <p className="mt-2 text-2xl font-bold text-emerald-800">Rs.{amount}</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Card details</label>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-4 shadow-sm">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#0f172a",
                  fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
                  "::placeholder": {
                    color: "#94a3b8",
                  },
                },
                invalid: {
                  color: "#dc2626",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Test card: 4242 4242 4242 4242, any future expiry, any CVC.
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="submit"
          className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          disabled={!stripe || loading}
        >
          {loading ? "Processing..." : `Pay Rs.${amount}`}
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
