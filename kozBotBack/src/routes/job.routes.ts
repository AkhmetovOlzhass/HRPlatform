import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  addCandidate,
  getCandidatesByJobId
} from '../controllers/job.controller';

const router = Router();

router.post('/', createJob);
router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

router.get('/:id/candidates', getCandidatesByJobId);
router.post('/:id/candidates', addCandidate);

export default router; // ✅ обязательно именно default export
