import { getProducts } from '@/modules/products/service';
import { ProductsTable } from './components/products-table';

export default async function ProductsPage() {
  const products = await getProducts();
  console.log('products', products);
  return (
    <div className='p-6'>
      <h1 className='text-xl font-semibold mb-4'>商品</h1>

      <ProductsTable data={products} />
    </div>
  );
}
