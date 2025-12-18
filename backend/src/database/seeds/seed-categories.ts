import { DataSource } from 'typeorm';
import { ServiceCategory } from '../../modules/services/entities/service-category.entity';

export const seedCategories = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(ServiceCategory);

  const categories = [
    { nameDe: 'Box Braids', nameEn: 'Box Braids', slug: 'box-braids' },
    { nameDe: 'Cornrows', nameEn: 'Cornrows', slug: 'cornrows' },
    { nameDe: 'Twists', nameEn: 'Twists', slug: 'twists' },
    { nameDe: 'Dreadlocks', nameEn: 'Locs', slug: 'locs' },
    { nameDe: 'Weave / Extensions', nameEn: 'Weave / Extensions', slug: 'weave' },
    { nameDe: 'Perücken Installation', nameEn: 'Wig Install', slug: 'wig-install' },
    { nameDe: 'Silk Press', nameEn: 'Silk Press', slug: 'silk-press' },
    { nameDe: 'Natural Hair Styling', nameEn: 'Natural Hair Styling', slug: 'natural-styling' },
    { nameDe: 'Faux Locs', nameEn: 'Faux Locs', slug: 'faux-locs' },
    { nameDe: 'Crochet Braids', nameEn: 'Crochet Braids', slug: 'crochet-braids' },
    { nameDe: 'Bantu Knots', nameEn: 'Bantu Knots', slug: 'bantu-knots' },
    { nameDe: 'Ponytail', nameEn: 'Ponytail', slug: 'ponytail' },
    { nameDe: 'Geflochtene Hochsteckfrisur', nameEn: 'Braided Updo', slug: 'braided-updo' },
    { nameDe: 'Goddess Braids', nameEn: 'Goddess Braids', slug: 'goddess-braids' },
    { nameDe: 'Senegalese Twists', nameEn: 'Senegalese Twists', slug: 'senegalese-twists' },
    { nameDe: 'Passion Twists', nameEn: 'Passion Twists', slug: 'passion-twists' },
    { nameDe: 'Fulani Braids', nameEn: 'Fulani Braids', slug: 'fulani-braids' },
    { nameDe: 'Kinderfrisuren', nameEn: 'Kids Braids', slug: 'kids-braids' },
  ];

  let order = 1;
  for (const cat of categories) {
    const existing = await repo.findOne({ where: { slug: cat.slug } });
    if (!existing) {
      const newCat = repo.create({
        ...cat,
        displayOrder: order++,
        isActive: true,
      });
      await repo.save(newCat);
      console.log(`Seeded category: ${cat.nameDe}`);
    } else {
      console.log(`Category already exists: ${cat.nameDe}`);
    }
  }
};
