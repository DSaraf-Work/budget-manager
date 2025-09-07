# Budget Manager

A modern personal finance management application built with Next.js, Node.js, and Supabase.

## 🏗️ Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Set up database schema**
   - Go to your Supabase project dashboard
   - Open SQL Editor
   - Run the SQL from `database/schema/00_foundation.sql`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

This project follows a **modular architecture** where features are implemented as separate, self-contained modules with `bm_` prefixed database tables.

## 🎯 Development Standards

This project follows strict development rules to ensure high-quality, well-tested code:

- **📋 [Development Rules](docs/DEVELOPMENT_RULES.md)** - Comprehensive guidelines for all development work
- **⚡ [Quick Reference](docs/QUICK_REFERENCE.md)** - Essential checklist for every feature
- **🧪 [Testing Checklist](docs/TESTING_CHECKLIST.md)** - Template for thorough feature testing

### Key Principles
- **Always test thoroughly** before marking features complete
- **Follow modular architecture** with clean separation of concerns
- **Document everything** with meaningful comments and guides
- **Maintain code quality** with consistent patterns and error handling

## 🎯 Ready for Feature Implementation

The foundation is complete! You can now implement features one by one following the modular approach and development standards.
