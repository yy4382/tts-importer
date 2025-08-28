# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `pnpm build` - Build the Next.js application
- **Development**: `pnpm dev` - Run development server with Turbopack
- **Lint**: `pnpm lint` - Run Next.js linting
- **Test all**: `pnpm test` - Run all Vitest tests
- **Test single file**: `pnpm vitest run <file-path>` - Run specific test file
- **Type check**: `pnpm tsc --noEmit` - Check TypeScript types without emitting files

## Project Architecture

This is a Next.js 15 application that generates configuration files for Azure TTS (Text-to-Speech) integration with various Chinese reading applications like Legado, iFreetime, and Read Aloud.

### Core Structure

**State Management**: Uses Jotai for global state management, particularly for Azure TTS configuration state defined in `src/lib/azure/schema.ts`.

**Azure TTS Integration** (`src/lib/azure/`):
- `schema.ts` - Core Zod schemas for Azure TTS configuration including `azureStateSchema`, `voiceConfigSchema`, and `speakerSchema`
- `config-to-url.ts` - Bidirectional conversion between Azure state objects and URL parameters using Zod codecs
- `legado.ts` & `ifreetime.ts` - Generate platform-specific configuration files
- Configuration supports both single and multiple speakers with discriminated unions

**Next.js App Router Structure**:
- `(azure)/` - Main Azure TTS configuration interface
- `(ra)/` - Read Aloud configuration interface  
- `api/` - API routes that serve generated configurations to reading apps

**UI Components**:
- Built with Radix UI primitives and Tailwind CSS
- `components/ui/` - Reusable UI components
- `components/modules/` - App-specific components like sidebar and topbar
- `components/shared/` - Shared components like voice selection and audio preview

### Key Patterns

**Testing with Immer**: When testing discriminated unions in schemas, use the pattern from `profile-generate.test.ts`:
```typescript
const baseSpeaker = {
  type: "single" as const,
  speaker: { /* speaker config */ }
};
const modifiedState = produce(baseState, (draft) => {
  draft.voice.speakerConfig = produce(baseSpeaker, (speakerDraft) => {
    // modifications here
  });
});
```

**Zod Schema Validation**: The app heavily relies on Zod for runtime validation and type safety, particularly for Azure TTS configurations that get serialized to URLs.

**Configuration Generation**: Each reading app has its own generator function that takes the standardized `AzureState` and produces app-specific configuration formats (JSON, XML, etc.).

### Privacy & Deployment

- Client-side focused - API keys and sensitive data are handled in the browser
- Server-side APIs only transform and return configurations without storing data
- Deployed on Vercel with Chinese language support
- Uses PostHog for analytics