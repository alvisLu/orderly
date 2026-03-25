import { Suspense } from 'react';
import { getProducts } from '@/modules/products/service';
import type { ProductQuery } from '@/modules/products/types';
import { ProductsTable } from './components/products-table';
import { CreateProductDialog } from './components/create-product-dialog';
import { SearchProduct } from './components/searech-product';

export default async function ProductsPage(props: PageProps<'/products'>) {
  const sp = await props.searchParams;

  const query: ProductQuery = {
    search: typeof sp.search === 'string' ? sp.search : undefined,
    is_favorite: sp.is_favorite === 'true' ? true : undefined,
    sort_by: (sp.sort_by === 'name' ? 'name' : 'created_at') as ProductQuery['sort_by'],
    sort_order: (sp.sort_order === 'desc' ? 'desc' : 'asc') as ProductQuery['sort_order'],
  };

  const products = await getProducts(query);

  return (
    <div className='p-6'>
      <h1 className='text-xl font-semibold mb-4'>商品管理</h1>
      <div className='flex items-center justify-between mb-4'>
        <Suspense>
          <SearchProduct />
        </Suspense>
        <CreateProductDialog />
      </div>
      <ProductsTable data={products} />
    </div>
  );
}
