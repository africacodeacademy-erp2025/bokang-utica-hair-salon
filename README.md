# Bokang Utica Hair Salon

A modern React + TypeScript web application for Bokang Utica Hair Salon, featuring appointment booking, customer gallery, admin dashboard, and Firebase integration.

## Features

- 🔐 **Authentication**: Firebase Auth with role-based access (Admin/Customer)
- 📅 **Appointment Booking**: Real-time slot availability checking
- 📧 **Email Confirmations**: Automated booking confirmation emails
- 🖼️ **Hairstyle Gallery**: Customer gallery with image uploads via Cloudinary
- 👨‍💼 **Admin Dashboard**: Manage appointments, view customer data
- 📱 **Responsive Design**: Tailwind CSS for mobile-first design

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Tailwind CSS
- **Email**: Node.js + Nodemailer
- **Image Upload**: Cloudinary
- **Deployment**: Docker-ready

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bokang-utica-hair-salon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Start the React app
   npm run dev

   # Terminal 2: Start the email server
   npm run email-server
   ```

5. **Open your browser**
   - App: http://localhost:5173
   - Email server health: http://localhost:3000/api/health

## Production Deployment

### Environment Configuration

For production, ensure all environment variables in `.env` are properly configured:

```env
# Required for production
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com

# Firebase (get from Firebase Console)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase vars

# Email SMTP (required for real emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@bokangutica.com

# Update for production URL
VITE_BOOKING_EMAIL_API_URL=https://your-api-domain.com/api/send-booking-confirmation
```

### Email Setup

The application includes an email server for sending booking confirmations:

1. **SMTP Configuration**: Set up SMTP credentials in `.env`
2. **Test Mode**: Without SMTP, emails are logged to console
3. **Production**: Configure real SMTP (Gmail, SendGrid, etc.)

### Docker Deployment

```bash
# Build the application
npm run build

# Use Docker Compose for full deployment
docker-compose up -d
```

### Health Checks

- **App Health**: Check if the React app loads
- **Email Health**: `GET /api/health` returns SMTP connection status
- **Firebase**: Verify authentication and database connections

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run email-server # Start email server
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── firebase/        # Firebase configuration
├── layouts/         # Layout components
├── styles/          # CSS styles
└── main.tsx         # App entry point

email-server.js      # Email service
.env.example         # Environment template
```

## API Endpoints

### Email Server (Port 3000)

- `POST /api/send-booking-confirmation` - Send booking confirmation email
- `GET /api/health` - Health check with SMTP status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary to Bokang Utica Hair Salon.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

## Booking confirmation email support

1. Install backend deps:

```bash
npm install express cors nodemailer dotenv
```

2. Create `.env` values:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-pass
EMAIL_FROM="Utica Hair Salon <noreply@utica.com>"
EMAIL_SERVER_PORT=3000
VITE_BOOKING_EMAIL_API_URL=http://localhost:3000/api/send-booking-confirmation
```

3. Run local email server:

```bash
node email-server.js
```

4. Start app:

```bash
npm run dev
```

With that, new bookings will trigger a confirmation email on successful Firestore write.
```
