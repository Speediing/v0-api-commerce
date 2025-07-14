# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (note: ESLint errors are ignored during builds via next.config.ts)

## Project Architecture

This is a Next.js 15 application that integrates with the v0.dev API to generate PayPal-powered ecommerce stores and React components. The application serves as a store builder with a visual interface.

### Core Components

- **StoreGenerator** (`components/LandingPageGenerator.tsx`) - Main entry point, handles store questionnaire and ecommerce store generation
- **Builder** (`components/Builder.tsx`) - Visual web builder with drag-and-drop functionality using @dnd-kit
- **v0-client** (`lib/v0-client.ts`) - Client library for v0.dev API integration, handles component and store generation with PayPal integration

### API Structure

The app includes API routes under `app/api/v0/` that proxy requests to v0.dev:
- `/api/v0/chat` - Get chat information 
- `/api/v0/chats` - Create new chats
- `/api/v0/message` - Send messages to existing chats
- `/api/v0/iframe` - Handle iframe content

All v0 API calls are currently mocked for development and return placeholder responses.

### Key Dependencies

- **Next.js 15** with App Router
- **React 19** 
- **v0-sdk** for v0.dev integration
- **@dnd-kit** for drag-and-drop functionality
- **Radix UI** components for UI primitives
- **Tailwind CSS** for styling
- **TypeScript** with strict mode enabled

### Important Configuration

- TypeScript and ESLint errors are ignored during builds (see next.config.ts)
- Uses `@/*` path alias for imports
- Turbopack enabled for faster development builds
- Geist fonts loaded via next/font

### Component Data Structure

Components follow the `ComponentData` interface with properties for type, name, props, children, and optional v0-specific data like `generatedCode` and `v0ChatId`.

### Business Data Integration

The application collects business information through `BusinessData` interface and generates targeted landing pages using v0.dev API with comprehensive prompts that include brand colors, target audience, and business goals.

### V0.dev Chat Forking

The `generateLandingPageWithV0` function now forks from an existing ecommerce template chat (`basic-ecommerce-homepage-Dpf8aaD2Wfw`) instead of creating new chats from scratch. This approach:

- Uses the existing ecommerce homepage template as a starting point
- Sends customization prompts to modify the template for specific business needs
- Falls back to creating new chats if forking fails
- Requires V0_API_KEY environment variable for real API integration

### MCP Server Configuration

The project is configured to use v0.dev's MCP server at `https://mcp.v0.dev/sse` with SSE transport. Use `claude mcp list` to verify the connection.