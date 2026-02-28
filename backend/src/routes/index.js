/**
 * API route aggregator - mounts routes under /api
 */

import { Router } from 'express';
import wellRoute from './wellRoute.js';

const router = Router();

router.use('/wells', wellRoute);

export default router;
