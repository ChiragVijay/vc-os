# VC_OS - Venture Capital Operating System

An intelligent operating system for venture capital firms, automating due diligence, portfolio monitoring, and decision-making workflows.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## 📁 Project Structure

```
vc-os/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public pages (landing)
│   ├── (app)/             # Authenticated app (dashboard, tools)
│   └── api/               # Backend API routes
├── src/                   # Source code
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Configuration & constants
│   ├── services/         # Business logic layer
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
└── public/               # Static assets
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Runtime**: Bun
- **UI Icons**: Lucide React

## 🎯 Features

### Phase 1: Pre-Deal Intelligence

- **Diligence Agent** - Automated due diligence reports from URL inputs
- **Talent Radar** - Background checks and technical scoring (Coming Q3 '26)
- **Batch Comparator** - Application cohort analysis (Coming Q4 '26)

### Phase 2: Post-Deal Operations

- **Portfolio Pulse** - Real-time burn rate and runway monitoring (In Development)

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Complete system architecture
- [Component Library](#) - Coming soon
- [API Reference](#) - Coming soon

## 🏗 Development

### File Organization

The project follows a modular architecture with barrel exports:

```typescript
// Clean imports via barrel exports
import { DashboardView, ScoutView } from "@/src/components/vc-os";
import { useNavigation } from "@/src/hooks";
import { ApiClient } from "@/src/utils";
```

### Adding New Features

1. **New Page**: Create in `app/(app)/feature/page.tsx`
2. **New Component**: Create in `src/components/vc-os/FeatureView.tsx`
3. **New API**: Create in `app/api/resource/route.ts`
4. **New Hook**: Create in `src/hooks/useFeature.ts`

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed guidelines.

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Self-Hosted

```bash
bun run build
bun start
```

## 📝 License

Proprietary - All Rights Reserved

## 👥 Team

Built by the VC_OS engineering team.

---

**Status**: Prototype Phase  
**Version**: 1.0  
**Last Updated**: February 2026
