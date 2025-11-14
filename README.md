# Digital Fabrication Network

A full-stack platform connecting workshops, fabrication plants, research centres, component sellers/resellers, and product designers/contractors to accelerate hardware/engineering product development and innovation.

## Features

### 🔧 Components & Parts Marketplace
- Browse and purchase components, raw materials, and custom parts
- Filter by type (electrical, mechanical, materials, consumables)
- View detailed technical specifications and datasheets
- Order management and quotation requests
- Wishlist/favorites functionality

### ⚙️ Services & Fabrication
- Discover design labs, workshops, and fabrication services
- Book services (3D printing, CNC machining, PCB assembly, etc.)
- View equipment specifications and pricing models
- Calendar-based booking system
- Service provider dashboard for managing bookings

### 👥 Community & Innovation Board
- Post fabrication requests and engineering challenges
- Collaborate on projects and form teams
- Direct messaging between users
- Profile portfolios showcasing past work
- Reply and matchmaking system

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis
- **Authentication**: JWT + Google OAuth
- **Validation**: Express Validator

## Project Structure

```
digital-fabrication-network/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and API client
│   │   ├── types/           # TypeScript type definitions
│   │   └── hooks/           # Custom React hooks
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── models/          # Database schema (Drizzle ORM)
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration files
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
└── package.json              # Root workspace configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-fabrication-network
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```
   
   Frontend (.env.local):
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Run the development servers**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Health Check: http://localhost:4000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Components
- `GET /api/components` - List all components (with filters)
- `GET /api/components/:id` - Get component details
- `POST /api/components` - Create component (sellers only)
- `PUT /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component

### Services
- `GET /api/services` - List all services (with filters)
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (service providers only)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status

### Community
- `GET /api/community` - List community posts (with filters)
- `GET /api/community/:id` - Get post with replies
- `POST /api/community` - Create post
- `POST /api/community/:id/replies` - Reply to post
- `PATCH /api/community/:id/status` - Update post status

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

## Database Schema

### Core Entities
- **Users**: User accounts with roles (buyer, seller, service_provider, researcher)
- **Profiles**: Extended user profile information
- **Components**: Marketplace listings for parts and materials
- **Services**: Service offerings from providers
- **Orders**: Purchase orders for components
- **Bookings**: Service bookings and appointments
- **CommunityPosts**: Community board posts
- **PostReplies**: Replies to community posts
- **Messages**: Direct messages between users
- **Reviews**: Ratings and reviews
- **Wishlists**: Saved items for users

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Building for Production
```bash
npm run build
```

## Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main

### Backend (Railway)
1. Connect your repository to Railway
2. Set environment variables
3. Deploy automatically on push to main

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@digitalfabricationnetwork.com or open an issue in the repository.
