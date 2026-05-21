"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { createTopUp } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

export default function TopUpPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("10");
  const [email, setEmail] = useState("");
  const [payMethod, setPayMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ reference: string; amountIdr: number } | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const amountIdr = amountNum * 10000;
  const tax = Math.round(amountIdr * 0.11);
  const subtotal = amountIdr - tax;
  const total = amountIdr;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    const authUser = getAuthUser();
    if (!authUser) return;

    setLoading(true);
    setError(null);
    try {
      const result = await createTopUp(authUser.sub, amountNum);
      setSuccess({ reference: result.reference, amountIdr: result.amountIdr ?? total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthGuard allowedRoles={["ADMIN"]}>
        <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
          <Navbar />
          <main className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full items-center">
              {/* Left */}
              <div className="text-center">
                <div className="w-64 h-64 mx-auto rounded-xl bg-[var(--color-border-light)] mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--color-primary)]">Palmery</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Your plantation ecosystem, managed with precision and clarity.</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Secured By</p>
                <div className="flex justify-center gap-3 mt-2">
                  <div className="w-8 h-5 rounded bg-blue-200" />
                  <div className="w-8 h-5 rounded bg-gray-300" />
                  <div className="w-8 h-5 rounded bg-gray-400" />
                  <div className="w-8 h-5 rounded bg-pink-200" />
                </div>
              </div>

              {/* Right - Success */}
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Thank you for your purchase!</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">
                  The invoice has been sent to your email. Your transaction for <strong>Palmery Plantation Services</strong> is complete.
                </p>
                <div className="border border-[var(--color-border)] rounded-lg p-4 mb-6 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-muted)]">Transaction ID</span>
                    <span className="font-mono font-medium">#{success.reference}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-muted)]">Date</span>
                    <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-muted)]">Total Paid</span>
                    <span className="font-medium text-[var(--color-primary)]">Rp {success.amountIdr.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/payroll")}
                  className="w-full rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] mb-3"
                >
                  Return Home
                </button>
                <button className="text-sm text-[var(--color-text-muted)] hover:underline">
                  📥 Download Receipt (PDF)
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <Navbar />
        <main className="flex-1 px-6 py-12">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left - Branding */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 flex flex-col items-center justify-center">
              <div className="w-48 h-48 rounded-xl bg-[var(--color-border-light)] mb-6 flex items-center justify-center">
                <span className="text-4xl">🌴</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-primary)] mb-2">Complete Your Transaction</h2>
              <p className="text-sm text-[var(--color-text-muted)] text-center mb-6">
                Securely finalize your plantation service fees. All transactions are encrypted and processed through our enterprise-grade financial gateway.
              </p>
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-light)]">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enterprise Security</p>
                    <p className="text-xs text-[var(--color-text-muted)]">256-bit SSL encryption protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-light)]">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">24/7 Field Support</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Direct access to plantation managers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Payment Form */}
            <div>
              {/* Order Summary */}
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Order Summary</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">One-time Payment</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border-light)] mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Top Up SawitDollar</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{amountNum} SawitDollar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-primary)]">{total.toLocaleString("id-ID")} IDR</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Inc. 11% PPN</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Subtotal</span><span>{subtotal.toLocaleString("id-ID")} IDR</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Tax (VAT)</span><span>{tax.toLocaleString("id-ID")} IDR</span></div>
                  <div className="flex justify-between font-bold pt-2 border-t border-[var(--color-border-light)]"><span>Total Due</span><span>{total.toLocaleString("id-ID")} IDR</span></div>
                </div>
              </div>

              {/* Payment Details */}
              <form onSubmit={handleCheckout} className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-bold mb-4">Payment Details</h3>

                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">{error}</div>}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5">Jumlah SawitDollar</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm"
                    required
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">1 SawitDollar = Rp 10.000</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5">Enter Email for Receipt</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@palmery.com"
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Pay using</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "card", label: "Credit/Debit", icon: "💳" },
                      { id: "bank", label: "Bank Transfer", icon: "🏦" },
                      { id: "ewallet", label: "E-Wallet", icon: "📱" },
                      { id: "qris", label: "QRIS", icon: "📷" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayMethod(m.id)}
                        className={`p-3 rounded-lg border text-center text-xs transition-colors ${
                          payMethod === m.id
                            ? "border-[var(--color-primary)] bg-[var(--color-accent)]/10"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                        }`}
                      >
                        <div className="text-lg mb-1">{m.icon}</div>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  🔒 {loading ? "Processing..." : "Checkout Securely"}
                </button>

                <p className="text-xs text-center text-[var(--color-text-muted)] mt-3">
                  By clicking &ldquo;Checkout Securely&rdquo;, you agree to the Palmery Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
