import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from '../auth/interfaces/token-payload.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import e from 'express';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() body: CreateProductRequest,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.productsService.createProduct(body, user.userId);
  }

  @Post(':productId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/products',
        filename(
          req: e.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          callback(null, `${req.params.producId}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500_000 }),
          new FileTypeValidator({ fileType: 'image/png' }),
        ],
      }),
    )
    _file: Express.Multer.File,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProduct() {
    return this.productsService.getProducts();
  }
}
