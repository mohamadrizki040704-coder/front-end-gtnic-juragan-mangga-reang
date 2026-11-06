import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Memuat checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}