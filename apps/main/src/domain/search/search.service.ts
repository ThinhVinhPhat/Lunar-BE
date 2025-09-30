import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from '@app/entity/product.entity';
import { ProductVariant } from '@app/entity/product-variant.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async searchProducts(
    keyword: string,
    { limit = 10, page = 1 }: { limit?: number; page?: number },
  ) {
    const [products, variants] = await Promise.all([
      this.productRepository
        .createQueryBuilder('p')
        .where(
          `to_tsvector('simple', p.name || ' ' || p.description || ' ' || p.slug) @@ plainto_tsquery(:keyword)`,
          { keyword },
        )
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),

      this.productVariantRepository
        .createQueryBuilder('v')
        .leftJoinAndSelect('v.product', 'product')
        .where(
          `to_tsvector('english', v.color || ' ' || v.size || ' ' || coalesce(product.name, '')) @@ plainto_tsquery('english', :keyword)`,
          { keyword },
        )
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
    ]);

    return {
      products,
      variants,
      total: products.length + variants.length,
    };
  }

  // --- Fallback simple LIKE search (nếu không cần full-text) ---
  async searchProductsSimple(
    query: string,
    { limit = 10, page = 1 }: { limit?: number; page?: number },
  ) {
    return this.productRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
      ],
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
