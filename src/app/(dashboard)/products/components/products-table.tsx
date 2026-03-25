'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { DataTable } from '../../../../components/shared/data-table';
import type { Product } from '@/modules/products/types';
import { EditProductDialog } from './edit-product-dialog';
import { ToggleProductField } from './toggle-product-field';

const columns: ColumnDef<Product>[] = [
  {
    id: 'index',
    header: '#',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.index + 1}</span>
    ),
    size: 40,
  },
  {
    id: 'image',
    header: '照片',
    cell: ({ row }) => {
      const url = row.original.image_urls?.[0];
      return url ? (
        <Image
          src={url}
          alt={row.original.name}
          width={48}
          height={48}
          className='rounded object-cover'
        />
      ) : (
        <div className='w-12 h-12 rounded bg-muted' />
      );
    },
    size: 64,
  },
  {
    accessorKey: 'name',
    header: '商品名稱',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <EditProductDialog product={row.original} />
        <span>{row.getValue<string>('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'is_pos_available',
    header: 'POS 上架',
    cell: ({ row }) => (
      <ToggleProductField productId={row.original.id} field='is_pos_available' checked={row.getValue('is_pos_available')} />
    ),
  },
  {
    accessorKey: 'is_menu_available',
    header: '菜單上架',
    cell: ({ row }) => (
      <ToggleProductField productId={row.original.id} field='is_menu_available' checked={row.getValue('is_menu_available')} />
    ),
  },
  {
    accessorKey: 'price',
    header: '價格',
    cell: ({ row }) => row.getValue<number>('price'),
  },
  {
    accessorKey: 'cost',
    header: '成本',
    cell: ({ row }) => row.getValue<number>('cost'),
  },
  {
    accessorKey: 'is_favorite',
    header: '我的最愛',
    cell: ({ row }) => (
      <ToggleProductField productId={row.original.id} field='is_favorite' checked={row.getValue('is_favorite')} />
    ),
  },
];

export function ProductsTable({ data }: { data: Product[] }) {
  return <DataTable columns={columns} data={data} />;
}
