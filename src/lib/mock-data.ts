// Mock gift data for the storefront before backend is ready
export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export const mockGifts: Gift[] = [
  {
    id: '1',
    name: 'LED Galaxy Projector',
    description: 'Transform any room into a cosmic wonderland with this stunning LED galaxy projector. Perfect for bedrooms, parties, or vibing sessions.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=400&fit=crop',
    category: 'Tech',
    stock: 50,
  },
  {
    id: '2',
    name: 'Custom Name Necklace',
    description: 'A personalized gold-plated name necklace that makes the perfect gift for your bestie or significant other.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6e5?w=400&h=400&fit=crop',
    category: 'Jewelry',
    stock: 30,
  },
  {
    id: '3',
    name: 'Aesthetic Desk Organizer',
    description: 'Keep your desk clean and aesthetic with this minimalist acrylic organizer. Influencer approved!',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    category: 'Home',
    stock: 40,
  },
  {
    id: '4',
    name: 'Wireless Earbuds Case',
    description: 'A trendy silicone case for your wireless earbuds with a cute charm keychain attachment.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop',
    category: 'Tech',
    stock: 100,
  },
  {
    id: '5',
    name: 'Scented Candle Set',
    description: 'A set of 3 luxurious soy candles in aesthetically pleasing glass jars. Scents: Vanilla Dream, Lavender Cloud, Rose Garden.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop',
    category: 'Home',
    stock: 25,
  },
  {
    id: '6',
    name: 'Polaroid Photo Printer',
    description: 'Print your favorite memories instantly with this portable mini photo printer. Connects via Bluetooth.',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
    category: 'Tech',
    stock: 15,
  },
  {
    id: '7',
    name: 'Friendship Bracelet Kit',
    description: 'DIY friendship bracelet making kit with beads, threads, and charms. Make memories with your squad!',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
    category: 'DIY',
    stock: 60,
  },
  {
    id: '8',
    name: 'Sunset Lamp',
    description: 'The viral sunset projection lamp for dreamy golden hour vibes any time of day.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'Home',
    stock: 35,
  },
];

export const categories = ['All', 'Tech', 'Jewelry', 'Home', 'DIY'];
