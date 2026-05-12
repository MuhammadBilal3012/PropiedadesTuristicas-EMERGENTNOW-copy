import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'propiedades_turisticas_rd';

let client = null;
let db = null;

async function getDatabase() {
  if (db) return db;
  
  if (!client) {
    client = new MongoClient(MONGO_URL);
    await client.connect();
  }
  
  db = client.db(DB_NAME);
  return db;
}

// Helper to generate IDs
export function generateId() {
  return new ObjectId().toString();
}

// Helper to exclude _id or convert it to string
function serializeDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id?.toString() || doc.id, ...rest };
}

function serializeDocs(docs) {
  return docs.map(serializeDoc);
}

// Initialize database with collections and indexes
export async function initializeDatabase() {
  try {
    const database = await getDatabase();
    
    // Create collections if they don't exist
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = [
      'users', 'properties', 'locations', 'agency_settings',
      'contact_messages', 'sell_requests', 'job_applications', 'visits'
    ];
    
    for (const name of requiredCollections) {
      if (!collectionNames.includes(name)) {
        await database.createCollection(name);
      }
    }
    
    // Create indexes
    await database.collection('users').createIndex({ username: 1 }, { unique: true });
    await database.collection('properties').createIndex({ location: 1 });
    await database.collection('properties').createIndex({ is_featured: 1 });
    await database.collection('properties').createIndex({ created_at: -1 });
    
    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error: error.message };
  }
}

// Seed default data
export async function seedDatabase() {
  try {
    const database = await getDatabase();
    
    // Check if already seeded
    const propertiesCount = await database.collection('properties').countDocuments();
    if (propertiesCount > 0) {
      return { message: 'Database already seeded' };
    }

    // Insert default agency settings
    const existingSettings = await database.collection('agency_settings').findOne({ _id: 'main' });
    if (!existingSettings) {
      await database.collection('agency_settings').insertOne({
        _id: 'main',
        name: 'Propiedades Turísticas RD',
        logo_url: '',
        hero_images: [],
        hero_video_url: '',
        whatsapp: '+18098475498',
        phone: '+18098475498',
        email: 'info@propiedadesturisticasrd.com',
        address: 'Santo Domingo, República Dominicana',
        facebook_url: '',
        instagram_url: '',
        tiktok_url: '',
        hero_headline: 'Tenemos las Llaves del Hogar que Buscas',
        hero_subheadline: 'Propiedades exclusivas para una vida extraordinaria',
        about_title: 'Sobre Nosotros',
        about_description: 'Somos expertos en bienes raíces con más de 15 años de experiencia en el mercado inmobiliario de República Dominicana.',
        about_mission: 'Nuestra misión es ayudarte a encontrar la propiedad perfecta.',
        about_vision: 'Ser la inmobiliaria líder en República Dominicana.',
        about_years_experience: 15,
        about_properties_sold: 500,
        about_happy_clients: 1000,
        about_team_members: 25,
        feature1_title: 'Experiencia Comprobada',
        feature1_description: 'Más de 15 años en el mercado inmobiliario.',
        feature2_title: 'Atención Personalizada',
        feature2_description: 'Un equipo dedicado a encontrar tu propiedad ideal.',
        feature3_title: 'Precios Competitivos',
        feature3_description: 'Las mejores opciones al mejor precio.',
        total_views: 0,
      });
    }

    // Insert default locations
    const defaultLocations = [
      { name: 'Punta Cana', description: 'Destino turístico de playas cristalinas', is_active: true },
      { name: 'Santo Domingo', description: 'Capital de República Dominicana', is_active: true },
      { name: 'Samaná', description: 'Península con playas vírgenes', is_active: true },
      { name: 'La Romana', description: 'Hogar de Casa de Campo', is_active: true },
      { name: 'Puerto Plata', description: 'Costa norte con montañas y playas', is_active: true },
      { name: 'Jarabacoa', description: 'Montañas y clima fresco', is_active: true },
      { name: 'Santiago', description: 'Segunda ciudad más grande', is_active: true },
      { name: 'Bávaro', description: 'Zona hotelera premium', is_active: true },
    ];

    const locationsCount = await database.collection('locations').countDocuments();
    if (locationsCount === 0) {
      await database.collection('locations').insertMany(
        defaultLocations.map(loc => ({ ...loc, _id: new ObjectId(), created_at: new Date() }))
      );
    }

    // Insert sample properties
    const sampleProperties = [
      {
        title: 'Villa de Lujo con Piscina',
        description: 'Espectacular villa de lujo con vista al mar, piscina infinita, 4 habitaciones.',
        price: 850000, currency: 'USD', location: 'Punta Cana', address: 'Cap Cana, Punta Cana',
        bedrooms: 4, bathrooms: 4, area: 450, property_type: 'Villa', status: 'Disponible',
        images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', alt: 'Villa' }],
        is_featured: true, amenities: ['Piscina', 'Vista al mar', 'Aire acondicionado', 'Jardín'],
        latitude: 18.4526, longitude: -68.4093, views: 0, created_at: new Date(), updated_at: new Date()
      },
      {
        title: 'Apartamento Moderno en Santo Domingo',
        description: 'Moderno apartamento en torre exclusiva, completamente amueblado.',
        price: 195000, currency: 'USD', location: 'Santo Domingo', address: 'Piantini',
        bedrooms: 2, bathrooms: 2, area: 120, property_type: 'Apartamento', status: 'Disponible',
        images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', alt: 'Apartamento' }],
        is_featured: true, amenities: ['Gimnasio', 'Área social', 'Seguridad 24/7'],
        latitude: 18.4861, longitude: -69.9312, views: 0, created_at: new Date(), updated_at: new Date()
      },
      {
        title: 'Casa Frente al Mar en Samaná',
        description: 'Hermosa casa con acceso directo a la playa.',
        price: 425000, currency: 'USD', location: 'Samaná', address: 'Las Terrenas',
        bedrooms: 3, bathrooms: 3, area: 280, property_type: 'Casa', status: 'Disponible',
        images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', alt: 'Casa' }],
        is_featured: true, amenities: ['Frente al mar', 'Terraza', 'BBQ'],
        latitude: 19.3102, longitude: -69.5427, views: 0, created_at: new Date(), updated_at: new Date()
      },
      {
        title: 'Penthouse de Lujo en La Romana',
        description: 'Impresionante penthouse con terraza privada y jacuzzi.',
        price: 680000, currency: 'USD', location: 'La Romana', address: 'Casa de Campo',
        bedrooms: 4, bathrooms: 5, area: 380, property_type: 'Apartamento', status: 'Disponible',
        images: [{ url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', alt: 'Penthouse' }],
        is_featured: true, amenities: ['Jacuzzi', 'Terraza privada', 'Vista panorámica'],
        latitude: 18.4168, longitude: -68.9120, views: 0, created_at: new Date(), updated_at: new Date()
      },
      {
        title: 'Terreno en Puerto Plata',
        description: 'Excelente terreno con potencial para desarrollo.',
        price: 150000, currency: 'USD', location: 'Puerto Plata', address: 'Sosúa',
        bedrooms: 0, bathrooms: 0, area: 2500, property_type: 'Terreno', status: 'Disponible',
        images: [{ url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', alt: 'Terreno' }],
        is_featured: false, amenities: ['Cerca de la playa', 'Acceso pavimentado'],
        latitude: 19.7545, longitude: -70.5170, views: 0, created_at: new Date(), updated_at: new Date()
      },
      {
        title: 'Villa en Jarabacoa',
        description: 'Villa moderna de montaña con vistas espectaculares.',
        price: 320000, currency: 'USD', location: 'Jarabacoa', address: 'La Vega',
        bedrooms: 3, bathrooms: 3, area: 250, property_type: 'Villa', status: 'Disponible',
        images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', alt: 'Villa' }],
        is_featured: true, amenities: ['Vista a montañas', 'Chimenea', 'Jardín'],
        latitude: 19.1201, longitude: -70.6402, views: 0, created_at: new Date(), updated_at: new Date()
      }
    ];

    await database.collection('properties').insertMany(
      sampleProperties.map(prop => ({ ...prop, _id: new ObjectId() }))
    );

    return { message: 'Database seeded successfully', count: sampleProperties.length };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { error: error.message };
  }
}

// ============ QUERY HELPERS ============

// Agency Settings
export async function getAgencySettings() {
  const database = await getDatabase();
  const settings = await database.collection('agency_settings').findOne({ _id: 'main' });
  return settings ? { ...settings, id: 'main' } : null;
}

export async function updateAgencySettings(data) {
  const database = await getDatabase();
  const { id, ...updateData } = data;
  await database.collection('agency_settings').updateOne(
    { _id: 'main' },
    { $set: updateData },
    { upsert: true }
  );
  return getAgencySettings();
}

// Properties
export async function getProperties(filters = {}) {
  const database = await getDatabase();
  const query = {};
  
  if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
  if (filters.min_price) query.price = { ...query.price, $gte: parseFloat(filters.min_price) };
  if (filters.max_price) query.price = { ...query.price, $lte: parseFloat(filters.max_price) };
  if (filters.bedrooms) query.bedrooms = { $gte: parseInt(filters.bedrooms) };
  if (filters.property_type) query.property_type = filters.property_type;
  if (filters.status) query.status = filters.status;
  if (filters.featured_only) query.is_featured = true;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 9;
  const skip = (page - 1) * limit;
  
  const [properties, total] = await Promise.all([
    database.collection('properties')
      .aggregate([
        { $match: query },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $addFields: {
            created_by_info: {
              $cond: {
                if: { $gt: [{ $size: '$creator' }, 0] },
                then: {
                  username: { $arrayElemAt: ['$creator.username', 0] },
                  nombre_completo: { $arrayElemAt: ['$creator.nombre_completo', 0] },
                  telefono_whatsapp: { $arrayElemAt: ['$creator.telefono_whatsapp', 0] },
                  foto_perfil: { $arrayElemAt: ['$creator.foto_perfil', 0] },
                },
                else: null
              }
            }
          }
        },
        { $project: { creator: 0 } }
      ])
      .toArray(),
    database.collection('properties').countDocuments(query)
  ]);
  
  return {
    properties: serializeDocs(properties),
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit)
  };
}

export async function getFeaturedProperties(limit = 6) {
  const database = await getDatabase();
  const properties = await database.collection('properties')
    .aggregate([
      { $match: { is_featured: true } },
      { $sort: { created_at: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $addFields: {
          created_by_info: {
            $cond: {
              if: { $gt: [{ $size: '$creator' }, 0] },
              then: {
                username: { $arrayElemAt: ['$creator.username', 0] },
                nombre_completo: { $arrayElemAt: ['$creator.nombre_completo', 0] },
                telefono_whatsapp: { $arrayElemAt: ['$creator.telefono_whatsapp', 0] },
                foto_perfil: { $arrayElemAt: ['$creator.foto_perfil', 0] },
              },
              else: null
            }
          }
        }
      },
      { $project: { creator: 0 } }
    ])
    .toArray();
  
  return serializeDocs(properties);
}

export async function getPropertyById(id) {
  const database = await getDatabase();
  const properties = await database.collection('properties')
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $addFields: {
          created_by_info: {
            $cond: {
              if: { $gt: [{ $size: '$creator' }, 0] },
              then: {
                username: { $arrayElemAt: ['$creator.username', 0] },
                nombre_completo: { $arrayElemAt: ['$creator.nombre_completo', 0] },
                telefono_whatsapp: { $arrayElemAt: ['$creator.telefono_whatsapp', 0] },
                foto_perfil: { $arrayElemAt: ['$creator.foto_perfil', 0] },
              },
              else: null
            }
          }
        }
      },
      { $project: { creator: 0 } }
    ])
    .toArray();
  
  return properties.length > 0 ? serializeDoc(properties[0]) : null;
}

export async function createProperty(data) {
  const database = await getDatabase();
  const property = {
    ...data,
    _id: new ObjectId(),
    views: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };
  if (data.created_by) {
    property.created_by = new ObjectId(data.created_by);
  }
  await database.collection('properties').insertOne(property);
  return serializeDoc(property);
}

export async function updateProperty(id, data) {
  const database = await getDatabase();
  const { id: _, ...updateData } = data;
  updateData.updated_at = new Date();
  await database.collection('properties').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return getPropertyById(id);
}

export async function deleteProperty(id) {
  const database = await getDatabase();
  await database.collection('properties').deleteOne({ _id: new ObjectId(id) });
  return { message: 'Property deleted' };
}

// Locations
export async function getLocations(activeOnly = false) {
  const database = await getDatabase();
  const query = activeOnly ? { is_active: true } : {};
  const locations = await database.collection('locations').find(query).sort({ name: 1 }).toArray();
  return serializeDocs(locations);
}

// Users
export async function getUsers() {
  const database = await getDatabase();
  const users = await database.collection('users')
    .find({}, { projection: { password: 0 } })
    .sort({ created_at: -1 })
    .toArray();
  return serializeDocs(users);
}

export async function getUserByUsername(username) {
  const database = await getDatabase();
  const user = await database.collection('users').findOne({ username });
  if (!user) return null;
  // Include password for authentication purposes
  const { _id, ...rest } = user;
  return { id: _id?.toString(), ...rest };
}

export async function getUserById(id) {
  const database = await getDatabase();
  const user = await database.collection('users').findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );
  return user ? serializeDoc(user) : null;
}

export async function createUser(data) {
  const database = await getDatabase();
  const user = {
    ...data,
    _id: new ObjectId(),
    created_at: new Date(),
  };
  await database.collection('users').insertOne(user);
  const { password, ...userWithoutPassword } = user;
  return serializeDoc(userWithoutPassword);
}

export async function updateUser(id, data) {
  const database = await getDatabase();
  const { id: _, ...updateData } = data;
  await database.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return getUserById(id);
}

export async function deleteUser(id) {
  const database = await getDatabase();
  await database.collection('users').deleteOne({ _id: new ObjectId(id) });
  return { message: 'User deleted' };
}

// Views/Stats
export async function getTotalViews() {
  const settings = await getAgencySettings();
  return settings?.total_views || 0;
}

export async function incrementViews(page = 'home', propertyId = null) {
  const database = await getDatabase();
  
  // Track visit
  await database.collection('visits').insertOne({
    _id: new ObjectId(),
    page,
    property_id: propertyId,
    created_at: new Date(),
  });
  
  // Increment total views
  await database.collection('agency_settings').updateOne(
    { _id: 'main' },
    { $inc: { total_views: 1 } },
    { upsert: true }
  );
  
  // Increment property views if tracking a property
  if (propertyId) {
    await database.collection('properties').updateOne(
      { _id: new ObjectId(propertyId) },
      { $inc: { views: 1 } }
    );
  }
  
  return { success: true };
}

// Contact Messages
export async function getContactMessages() {
  const database = await getDatabase();
  const messages = await database.collection('contact_messages').find().sort({ created_at: -1 }).toArray();
  return serializeDocs(messages);
}

export async function createContactMessage(data) {
  const database = await getDatabase();
  const message = {
    ...data,
    _id: new ObjectId(),
    created_at: new Date(),
  };
  await database.collection('contact_messages').insertOne(message);
  return serializeDoc(message);
}

// Sell Requests
export async function getSellRequests() {
  const database = await getDatabase();
  const requests = await database.collection('sell_requests').find().sort({ created_at: -1 }).toArray();
  return serializeDocs(requests);
}

export async function createSellRequest(data) {
  const database = await getDatabase();
  const request = {
    ...data,
    _id: new ObjectId(),
    status: 'pending',
    created_at: new Date(),
  };
  await database.collection('sell_requests').insertOne(request);
  return serializeDoc(request);
}

// Job Applications
export async function getJobApplications() {
  const database = await getDatabase();
  const applications = await database.collection('job_applications').find().sort({ created_at: -1 }).toArray();
  return serializeDocs(applications);
}

export async function createJobApplication(data) {
  const database = await getDatabase();
  const application = {
    ...data,
    _id: new ObjectId(),
    status: 'pending',
    created_at: new Date(),
  };
  await database.collection('job_applications').insertOne(application);
  return serializeDoc(application);
}
