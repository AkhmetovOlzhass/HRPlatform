import { Request, Response } from 'express';
import Job from '../models/job.model';
import { jobSchema } from '../validators/job.validator';

export const createJob = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = jobSchema.parse(req.body); // 🔒 Валидация данных
      const newJob = new Job(parsed);
      const savedJob = await newJob.save();
      return res.status(201).json(savedJob);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Ошибки валидации от zod
        return res.status(400).json({
          error: 'Validation failed',
          details: (error as any).issues
        });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  };

export const getAllJobs = async (_: Request, res: Response): Promise<Response> => {
  const jobs = await Job.find();
  return res.json(jobs);
};

export const getJobById = async (req: Request, res: Response): Promise<Response> => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json(job);
};

export const updateJob = async (req: Request, res: Response): Promise<Response> => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json(job);
};

export const deleteJob = async (req: Request, res: Response): Promise<Response> => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json({ message: 'Job deleted' });
};


// controllers/job.controller.ts
export const addCandidate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { full_name, phone, email, resume_text, status } = req.body;
  
    try {
      const job = await Job.findById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });
  
      const existingIndex = job.candidates.findIndex(c => c.full_name === full_name);
  
      if (existingIndex >= 0) {
        // Обновляем существующего кандидата
        job.candidates[existingIndex].status = status || job.candidates[existingIndex].status;
        job.candidates[existingIndex].resume_text = resume_text || job.candidates[existingIndex].resume_text;
        job.candidates[existingIndex].submittedAt = new Date();
        job.candidates[existingIndex].phone = phone || job.candidates[existingIndex].phone;
        job.candidates[existingIndex].email = email || job.candidates[existingIndex].email;
      } else {
        // Добавляем нового кандидата
        job.candidates.push({
          full_name,
          phone,
          email,
          resume_text,
          status: status || "new",
          submittedAt: new Date()
        });
      }
  
      await job.save();
      res.json({ message: "Candidate saved", job });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
  
// controllers/job.controller.ts

export const getCandidatesByJobId = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
  
    try {
      const job = await Job.findById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });
  
      return res.json({ candidates: job.candidates });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };
  