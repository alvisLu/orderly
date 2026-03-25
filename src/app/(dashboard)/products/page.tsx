import { getProducts } from '@/modules/products/service';
import { ProductsTable } from './components/products-table';
import { CreateProductDialog } from './components/create-product-dialog';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className='p-6'>
      <h1 className='text-xl font-semibold mb-4'>商品管理</h1>
      <CreateProductDialog />
      <ProductsTable data={products} />
    </div>
  );
}
