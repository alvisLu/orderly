"use client";

import { useRef, useState, useTransition } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ImagePlus, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { apiUpdateProduct, apiDeleteProduct } from "@/app/api/products/api";
import { apiUploadFile, apiUploadFromUrl } from "@/app/api/upload/api";
import type { Category } from "@/modules/categories/types";
import type { ProductType } from "@/modules/product-types/types";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/components/ui/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Product } from "@/modules/products/types";
import { Textarea } from "@/components/ui/textarea";

const MAX_IMAGES = 10;

const schema = z.object({
  name: z.string().min(1, "請輸入商品名稱").max(50, "商品名稱不能超過50個字符"),
  price: z.coerce.number().min(0, "價格不能為負數"),
  cost: z.coerce.number().min(0),
  description: z.string().optional(),
  categoryId: z.string().nullable(),
  isPosAvailable: z.boolean(),
  isMenuAvailable: z.boolean(),
  isFavorite: z.boolean(),
  productTypeIds: z.array(z.string()),
  imageUrls: z.array(z.string()).max(MAX_IMAGES),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.infer<typeof schema>;

export function EditProductDialog({
  product,
  categories,
  productTypes,
}: {
  product: Product;
  categories: Category[];
  productTypes: ProductType[];
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, startUploading] = useTransition();
  const [imageUrls, setImageUrls] = useState<string[]>(product.imageUrls ?? []);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await apiDeleteProduct(product.id);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("刪除商品失敗");
    } finally {
      setIsDeleting(false);
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name,
      price: product.price,
      cost: product.cost,
      description: product.description ?? "",
      categoryId: product.categoryId,
      isPosAvailable: product.isPosAvailable,
      isMenuAvailable: product.isMenuAvailable,
      isFavorite: product.isFavorite,
      productTypeIds: product.productTypes.map((pt) => pt.productTypeId),
      imageUrls: product.imageUrls ?? [],
    },
  });

  const [categoryId, booleanValues, productTypeIds] = [
    useWatch({ control, name: "categoryId" }),
    useWatch({
      control,
      name: ["isPosAvailable", "isMenuAvailable", "isFavorite"],
    }),
    useWatch({ control, name: "productTypeIds" }),
  ];

  function addProductType(id: string) {
    if (!productTypeIds.includes(id))
      setValue("productTypeIds", [...productTypeIds, id]);
  }

  function removeProductType(id: string) {
    setValue(
      "productTypeIds",
      productTypeIds.filter((v) => v !== id)
    );
  }

  function updateImages(urls: string[]) {
    setImageUrls(urls);
    setValue("imageUrls", urls, { shouldDirty: true });
    apiUpdateProduct(product.id, { imageUrls: urls }).catch(() =>
      toast.error("圖片更新失敗")
    );
  }

  function removeImage(index: number) {
    updateImages(imageUrls.filter((_, i) => i !== index));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) {
      toast.error(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    startUploading(async () => {
      try {
        const urls = await Promise.all(
          toUpload.map((f) => apiUploadFile(f, "products"))
        );
        updateImages([...imageUrls, ...urls]);
        toast.success(`已上傳 ${urls.length} 張圖片`);
      } catch {
        toast.error("圖片上傳失敗");
      }
    });
    e.target.value = "";
  }

  function handleUrlUpload() {
    if (!urlInput.trim()) return;
    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
      return;
    }
    startUploading(async () => {
      try {
        const url = await apiUploadFromUrl(urlInput.trim(), "products");
        updateImages([...imageUrls, url]);
        setUrlInput("");
        toast.success("圖片上傳成功");
      } catch {
        toast.error("圖片上傳失敗");
      }
    });
  }

  async function onSubmit(values: FormValues) {
    await apiUpdateProduct(product.id, { ...values, imageUrls });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="h-[calc(100%-2rem)] sm:max-w-[calc(100%-2rem)] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">修改商品</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-base">
                商品名稱 *
              </Label>
              <Input
                size="xl"
                id="name"
                className="h-10"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* category */}
            <div className="space-y-1">
              <Label className="text-base">目錄</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start font-normal"
                    disabled={categories.length === 0}
                  >
                    {categoryId
                      ? categories.find((c) => c.id === categoryId)?.name
                      : categories.length === 0
                        ? "沒有資料"
                        : "選擇目錄"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={categoryId ?? ""}
                    onValueChange={(v) => setValue("categoryId", v || null)}
                  >
                    {categories.map((c) => (
                      <DropdownMenuRadioItem key={c.id} value={c.id}>
                        {c.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price" className="text-base">
                售價 *
              </Label>
              <Input
                id="price"
                type="number"
                className="h-10"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cost" className="text-base">
                成本
              </Label>
              <Input
                id="cost"
                type="number"
                className="h-10"
                {...register("cost")}
              />
            </div>
          </div>

          {/* description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-base">
              描述
            </Label>
            <Textarea
              id="description"
              className="h-40"
              {...register("description")}
            />
          </div>

          {/* product option*/}
          <div className="space-y-1">
            <Label className="text-base">加料選項</Label>
            {(() => {
              const available = productTypes.filter(
                (pt) => !productTypeIds.includes(pt.id)
              );
              return (
                <Select
                  value=""
                  onValueChange={addProductType}
                  disabled={available.length === 0}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        available.length === 0 ? "沒有資料" : "新增選項"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {pt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
            {productTypeIds.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {productTypeIds.map((id) => {
                  const pt = productTypes.find((p) => p.id === id);
                  return pt ? (
                    <span
                      key={id}
                      className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {pt.name}
                      <button
                        type="button"
                        onClick={() => removeProductType(id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              商品圖片（{imageUrls.length}/{MAX_IMAGES}）
            </Label>

            {imageUrls.length > 0 && (
              <Sortable
                value={imageUrls}
                onValueChange={updateImages}
                orientation="horizontal"
              >
                <SortableContent className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <SortableItem
                      key={url}
                      value={url}
                      asHandle
                      className="relative group w-28 h-28 rounded-md border overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`商品圖片 ${index + 1}`}
                        width={112}
                        height={112}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </SortableItem>
                  ))}
                </SortableContent>
                <SortableOverlay>
                  {({ value }) => {
                    const url = value as string;
                    return (
                      <div className="w-28 h-28 rounded-md border overflow-hidden">
                        <Image
                          src={url}
                          alt="拖曳中"
                          width={112}
                          height={112}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  }}
                </SortableOverlay>
              </Sortable>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xl"
                disabled={isUploading || imageUrls.length >= MAX_IMAGES}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-1" />
                {isUploading ? "上傳中..." : "選擇檔案"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Input
                size="lg"
                placeholder="或貼上圖片網址"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlUpload();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="xl"
                disabled={
                  isUploading ||
                  !urlInput.trim() ||
                  imageUrls.length >= MAX_IMAGES
                }
                onClick={handleUrlUpload}
              >
                上傳
              </Button>
            </div>
          </div>

          {/* activity*/}
          <div className="space-y-2">
            {(
              [
                { key: "isPosAvailable", label: "POS 上架" },
                { key: "isMenuAvailable", label: "菜單上架" },
                { key: "isFavorite", label: "我的最愛" },
              ] as const
            ).map(({ key, label }, i) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-base">{label}</Label>
                <Switch
                  checked={booleanValues[i]}
                  onCheckedChange={(v) => setValue(key, v)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              size="xl"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? "刪除中..." : "刪除商品"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                size="xl"
                variant="outline"
                className="px-15"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                size="xl"
                className="px-20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "儲存中..." : "儲存"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
