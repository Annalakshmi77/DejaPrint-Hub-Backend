import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Product, ProductDocument } from './schemas/product.schema'
import { CreateProductDto } from './dto/create-product.dto'
import { QueryProductDto } from './dto/query-product.dto'

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(dto: CreateProductDto) {
    const product = await this.productModel.create(dto)
    return { data: product, message: 'Product created' }
  }

  async findAll(query: QueryProductDto) {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12, sortBy = 'createdAt', order = 'desc' } = query
    const filter: any = { isActive: true }
    if (category) filter.category = category
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {}
      if (minPrice !== undefined) filter.basePrice.$gte = minPrice
      if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice
    }
    if (search) filter.$text = { $search: search }
    const [products, total] = await Promise.all([
      this.productModel.find(filter).sort({ [sortBy]: order === 'asc' ? 1 : -1 }).skip((page - 1) * limit).limit(limit),
      this.productModel.countDocuments(filter),
    ])
    return { data: { products, total, page, totalPages: Math.ceil(total / limit) }, message: 'Products fetched' }
  }

  async findOne(id: string) {
    const product = await this.productModel.findOne({ _id: id, isActive: true })
    if (!product) throw new NotFoundException('Product not found')
    return { data: product, message: 'Product fetched' }
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    const product = await this.productModel.findByIdAndUpdate(id, dto, { new: true })
    if (!product) throw new NotFoundException('Product not found')
    return { data: product, message: 'Product updated' }
  }

  async remove(id: string) {
    await this.productModel.findByIdAndUpdate(id, { isActive: false })
    return { message: 'Product deactivated' }
  }

  async getCategories() {
    const cats = await this.productModel.distinct('category', { isActive: true })
    return { data: cats, message: 'Categories fetched' }
  }
}
