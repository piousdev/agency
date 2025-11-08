/**
 * Invitation Routes Module
 *
 * Handles the complete invitation lifecycle for client onboarding:
 *
 * 1. **Create** (`POST /create`) - Internal team members send invitations
 * 2. **Validate** (`GET /validate/:token`) - Verify invitation token is valid
 * 3. **Accept** (`POST /accept`) - Recipients create accounts and join platform
 *
 * Security:
 * - Create endpoint: Protected by requireAuth() + requireInternal() middleware
 * - Validate/Accept endpoints: Public (token-based security)
 * - Tokens: 32-byte cryptographically secure random tokens (64 hex chars)
 * - Expiration: 7 days from creation
 * - One-time use: Tokens are marked as used after account creation
 *
 * Flow:
 * 1. Internal user creates invitation → generates token, stores in DB
 * 2. Recipient receives email with link containing token
 * 3. Frontend validates token before showing signup form
 * 4. Recipient submits account details → user created, invitation marked used
 *
 * Base Path: `/api/invitations`
 */
import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import createRoutes from './create';
import validateRoutes from './validate';
import acceptRoutes from './accept';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all invitation routes
app.route('/', createRoutes);
app.route('/', validateRoutes);
app.route('/', acceptRoutes);

export default app;
