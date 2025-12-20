import { DataSource } from 'typeorm';
import { ServiceCategory } from '../../modules/services/entities/service-category.entity';

export const seedCategories = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(ServiceCategory);

  const categories = [
    // BRAIDS
    { nameDe: 'Box Braids', nameEn: 'Box Braids', slug: 'box-braids', iconUrl: 'https://images.unsplash.com/photo-1605206260840-75d81240360c?auto=format&fit=crop&w=800&q=80' }, // Etty Fidele - Box Braids
    { nameDe: 'Cornrows', nameEn: 'Cornrows', slug: 'cornrows', iconUrl: 'https://images.unsplash.com/photo-1518331908401-49666c0d65a8?auto=format&fit=crop&w=800&q=80' }, // Cornrows/Braids
    { nameDe: 'Knotless Braids', nameEn: 'Knotless Braids', slug: 'knotless-braids', iconUrl: 'https://images.unsplash.com/photo-1623838804048-81d33192087d?auto=format&fit=crop&w=800&q=80' }, // Clean braids
    { nameDe: 'Fulani Braids', nameEn: 'Fulani Braids', slug: 'fulani-braids', iconUrl: 'https://images.unsplash.com/photo-1635866164228-44485700878b?auto=format&fit=crop&w=800&q=80' }, // Tribal/Fulani style
    { nameDe: 'Goddess Braids', nameEn: 'Goddess Braids', slug: 'goddess-braids', iconUrl: 'https://images.unsplash.com/photo-1624564883196-85764d058c44?auto=format&fit=crop&w=800&q=80' }, // Curly ends
    { nameDe: 'Crochet Braids', nameEn: 'Crochet Braids', slug: 'crochet-braids', iconUrl: 'https://images.unsplash.com/photo-1594808542289-53f7d2427a92?auto=format&fit=crop&w=800&q=80' }, // Crochet look
    { nameDe: 'Tribal Braids', nameEn: 'Tribal Braids', slug: 'tribal-braids', iconUrl: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=800&q=80' }, // Tribal
    
    // TWISTS
    { nameDe: 'Twists', nameEn: 'Twists', slug: 'twists', iconUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80' }, // Twists (classic)
    { nameDe: 'Senegalese Twists', nameEn: 'Senegalese Twists', slug: 'senegalese-twists', iconUrl: 'https://images.unsplash.com/photo-1620794341491-76be6eeb69a6?auto=format&fit=crop&w=800&q=80' }, // Twists close up
    { nameDe: 'Passion Twists', nameEn: 'Passion Twists', slug: 'passion-twists', iconUrl: 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?auto=format&fit=crop&w=800&q=80' }, // Passion twists (curly)
    { nameDe: 'Marley Twists', nameEn: 'Marley Twists', slug: 'marley-twists', iconUrl: 'https://images.unsplash.com/photo-1572455044327-7243c3d5268c?auto=format&fit=crop&w=800&q=80' }, // Marley texture

    // LOCS
    { nameDe: 'Dreadlocks', nameEn: 'Locs', slug: 'locs', iconUrl: 'https://images.unsplash.com/photo-1563178406-4f4b4ce69945?auto=format&fit=crop&w=800&q=80' }, // Locs
    { nameDe: 'Faux Locs', nameEn: 'Faux Locs', slug: 'faux-locs', iconUrl: 'https://images.unsplash.com/photo-1621530932822-b91c01e6a479?auto=format&fit=crop&w=800&q=80' }, // Faux Locs

    // NATURAL
    { nameDe: 'Natural Hair Styling', nameEn: 'Natural Hair Styling', slug: 'natural-styling', iconUrl: 'https://images.unsplash.com/photo-1588514151253-15646399082d?auto=format&fit=crop&w=800&q=80' }, // Natural Afro
    { nameDe: 'Silk Press', nameEn: 'Silk Press', slug: 'silk-press', iconUrl: 'https://images.unsplash.com/photo-1582095133179-bfd08d2fc6b8?auto=format&fit=crop&w=800&q=80' }, // Straightened black hair
    { nameDe: 'Bantu Knots', nameEn: 'Bantu Knots', slug: 'bantu-knots', iconUrl: 'https://images.unsplash.com/photo-1583391733958-e026b14377f9?auto=format&fit=crop&w=800&q=80' }, // Bantu knots
    { nameDe: 'Ponytail', nameEn: 'Ponytail', slug: 'ponytail', iconUrl: 'https://images.unsplash.com/photo-1617391765119-21c3562a0b5a?auto=format&fit=crop&w=800&q=80' }, // Sleek ponytail

    // EXTENSIONS / WIGS
    { nameDe: 'Weave / Extensions', nameEn: 'Weave / Extensions', slug: 'weave', iconUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80' }, // Weave
    { nameDe: 'Perücken Installation', nameEn: 'Wig Install', slug: 'wig-install', iconUrl: 'https://images.unsplash.com/photo-1596472537359-217584cd3628?auto=format&fit=crop&w=800&q=80' }, // Wig
    { nameDe: 'Geflochtene Hochsteckfrisur', nameEn: 'Braided Updo', slug: 'braided-updo', iconUrl: 'https://images.unsplash.com/photo-1600757782772-a6fc78f0d487?auto=format&fit=crop&w=800&q=80' }, // Updo
    { nameDe: 'Kinderfrisuren', nameEn: 'Kids Braids', slug: 'kids-braids', iconUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80' }, // Kids
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
