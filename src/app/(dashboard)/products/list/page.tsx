import { Suspense } from "react";
import { ProductsPageContent } from "../components/products-page-content";

export default function ProductsListPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}
