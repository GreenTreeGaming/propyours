# PropYours

PropYours is a real-estate discovery and property-listing platform focused on Tamil Nadu.

Users can browse residential, rental and commercial listings, refine searches with structured filters, compare properties, contact property owners and manage their own listings.

## Current status

PropYours is under active development.

Payment processing and production SMS delivery are not yet enabled. Development OTP behaviour must not be used in production.

## Main features

- Residential, rental and commercial property search
- Server-side property filtering and pagination
- Property comparison
- Saved favorites
- Property-owner dashboard
- Listing plans, promotion and lead limits
- Phone OTP account verification
- Bubby conversational property search
- Property analytics
- Admin property management
- UploadThing media uploads

## Technology

- Next.js App Router
- React
- TypeScript
- MongoDB and Mongoose
- Tailwind CSS
- Zod
- Vitest
- UploadThing
- Resend
- Vercel

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB Atlas database
- UploadThing credentials
- Resend credentials when email delivery is enabled

## Local setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd propyours
npm install