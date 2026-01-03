import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ServiceCategory } from '../src/modules/services/entities/service-category.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    const repo = dataSource.getRepository(ServiceCategory);
    const categories = await repo.find();

    console.log('Categories in DB:', categories.length);
    if (categories.length > 0) {
        console.log('Sample:', categories.slice(0, 3));
    } else {
        console.log('No categories found.');
    }

    await app.close();
}

bootstrap();
