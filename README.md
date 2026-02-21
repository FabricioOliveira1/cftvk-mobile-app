# CFTVK App

> Dedicated mobile management system built exclusively for VK CrossFit
> Box, designed to replace third-party gym management software with a
> fully controlled, low-cost, and extensible solution.

------------------------------------------------------------------------

## 📱 Overview

CFTVK is a custom-built mobile application developed specifically for VK
CrossFit Box.

The app replaces external management platforms that charge recurring
fees per registered student and limit feature customization.

This is **not a SaaS product**.\
It is a **privately owned, dedicated system** developed to serve a
single gym operation with full technical and strategic control.

------------------------------------------------------------------------

## 🎯 Product Strategy

Instead of relying on third-party platforms such as:

-   NextFit\
-   Wellhub\
-   TotalPass

This project aims to:

-   Eliminate per-student SaaS costs
-   Maintain full ownership of operational data
-   Enable unlimited feature customization
-   Integrate with corporate fitness platforms without vendor lock-in
-   Maintain independent control over system evolution

The architecture allows replication for other gyms in the future, but
each deployment would be isolated and independently managed --- not a
centralized SaaS.

------------------------------------------------------------------------

## 🏗 Architecture

### Mobile

-   React Native (Expo)
-   TypeScript

### Backend

-   Firebase Authentication
-   Firestore (NoSQL database)
-   Cloud Functions (serverless backend logic)
-   Secure Webhook endpoints for third-party integrations

------------------------------------------------------------------------

## 🧠 Core Functionalities

### Authentication

-   Firebase-based secure authentication
-   Role-based access control (Admin / Student)

### Class Management

-   Class creation and scheduling
-   Capacity control
-   Real-time booking updates

### Reservation System

-   Internal booking system
-   External reservation sync (Wellhub / TotalPass)
-   Reservation source tracking:
    -   LOCAL
    -   WELLHUB
    -   TOTALPASS

### Attendance

-   Local check-in management
-   External check-in reconciliation (if provided via API/webhook)

------------------------------------------------------------------------

## 🔌 Integration Design

The system uses an adapter-based architecture for third-party
integrations:

    IntegrationService
     ├── WellhubAdapter
     ├── TotalPassAdapter

This ensures:

-   Decoupled integration layer
-   Controlled external dependency management
-   Easier API updates
-   Clear separation between core logic and third-party systems

------------------------------------------------------------------------

## 📦 Data Model (Simplified)

### users

``` json
{
  id,
  role: "ADMIN" | "STUDENT",
  email,
  status,
  externalMapping
}
```

### classes

``` json
{
  id,
  name,
  capacity,
  scheduledAt
}
```

### reservations

``` json
{
  id,
  userId,
  classId,
  source: "LOCAL" | "WELLHUB" | "TOTALPASS",
  externalReservationId,
  checkinStatus,
  createdAt
}
```

------------------------------------------------------------------------

## 🔐 Security & Reliability

-   Environment variables excluded from version control
-   Webhook signature validation
-   Idempotent reservation processing
-   Firestore security rules enforced
-   Logging for integration events
-   Designed to prevent overbooking and data inconsistency

------------------------------------------------------------------------

## 🚀 Development Setup

``` bash
git clone https://github.com/your-username/cftvk-app.git
cd cftvk-app
npm install
npx expo start
```

------------------------------------------------------------------------

## 🔑 Environment Variables

Create a `.env` file based on:

    .env.example

Include:

-   Firebase configuration
-   Integration credentials (if applicable)
-   Webhook secret keys

------------------------------------------------------------------------

## 📊 Versioning

This project follows Semantic Versioning:

    MAJOR.MINOR.PATCH

Example: - v0.1.0 → Initial structured baseline - v1.0.0 → Stable
production-ready version for VK

------------------------------------------------------------------------

## 📈 Future Possibilities

Although this is not a SaaS platform, the architecture allows:

-   Independent deployment for other gyms
-   White-label adaptation
-   Modular feature expansion
-   Advanced analytics implementation
-   Multi-location support (if required)

Each deployment would remain isolated to preserve operational
independence.

------------------------------------------------------------------------

## 👤 Author

Fabricio Oliveira\
Software Developer
