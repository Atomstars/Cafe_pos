"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number; // paise
};

type PaymentType = "CASH" | "UPI" | "CARD";
type OrderType = "DINE_IN" | "TAKEAWAY";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [paymentType, setPaymentType] = useState<PaymentType>("CASH");
  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setErrorMsg("Failed to load products"));
  }, []);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return Array.from(map.entries());
  }, [products]);

  const add = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const remove = (id: string) => {
    setCart((prev) => {
      const qty = prev[id] || 0;
      if (qty <= 1) {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      }
      return { ...prev, [id]: qty - 1 };
    });
  };

  const subtotal = useMemo(() => {
    return products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  }, [products, cart]);

  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return product
          ? { product, quantity, notes: notes[productId] ?? "" }
          : null;
      })
      .filter(Boolean) as { product: Product; quantity: number; notes: string }[];
  }, [cart, products, notes]);

  const placeOrder = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (cartItems.length === 0) {
      setErrorMsg("Cart is empty. Add items first.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        paymentType,
        orderType,
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          quantity: ci.quantity,
          notes: ci.notes?.trim() ? ci.notes.trim() : undefined,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to place order");
      }

      const data = await res.json();
      setSuccessMsg(`✅ Order placed successfully (ID: ${data.id})`);

      // clear cart
      setCart({});
      setNotes({});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* LEFT: MENU */}
      <div className="col-span-7">
        <h1 className="text-2xl font-bold mb-4">Cafe POS</h1>

        {groupedByCategory.map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{category}</h2>

            <div className="grid grid-cols-2 gap-3">
              {items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => add(p.id)}
                  className="w-full border rounded-lg p-3 text-left hover:bg-gray-50"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">
                    ₹{(p.price / 100).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: BILL */}
      <div className="col-span-5">
        <div className="border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Bill</h2>
            <span className="text-sm text-gray-600">
              Items: {cartItems.length}
            </span>
          </div>

          {/* Order Type */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Order Type</label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded border ${
                  orderType === "TAKEAWAY" ? "bg-gray-100 font-semibold" : ""
                }`}
                onClick={() => setOrderType("TAKEAWAY")}
                type="button"
              >
                Takeaway
              </button>
              <button
                className={`px-3 py-2 rounded border ${
                  orderType === "DINE_IN" ? "bg-gray-100 font-semibold" : ""
                }`}
                onClick={() => setOrderType("DINE_IN")}
                type="button"
              >
                Dine-in
              </button>
            </div>
          </div>

          {/* Payment Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Payment Type
            </label>
            <div className="flex gap-2">
              {(["CASH", "UPI", "CARD"] as PaymentType[]).map((pt) => (
                <button
                  key={pt}
                  className={`px-3 py-2 rounded border ${
                    paymentType === pt ? "bg-gray-100 font-semibold" : ""
                  }`}
                  onClick={() => setPaymentType(pt)}
                  type="button"
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Cart items */}
          <div className="space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500">No items added yet.</p>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        ₹{(product.price / 100).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => remove(product.id)}
                        className="px-2 py-1 border rounded"
                        type="button"
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => add(product.id)}
                        className="px-2 py-1 border rounded"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <input
                      value={notes[product.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                      placeholder="Notes (eg: no onion, extra cheese)"
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%)</span>
              <span>₹{(tax / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>₹{(total / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mt-3 text-sm text-red-600">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="mt-3 text-sm text-green-700">{successMsg}</div>
          )}

          {/* Place order */}
          <button
            onClick={placeOrder}
            disabled={loading}
            className="mt-4 w-full bg-black text-white rounded-lg py-3 font-medium disabled:opacity-60"
            type="button"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
