import express, { NextFunction, Request, Response } from 'express';
import ProfessorController from '../controllers/professor.controller';
import Professor from '../entities/professor.entity';
import ProfessorCurso from '../models/ProfessorCurso';
import Mensagem from '../utils/mensagem';

const router = express.Router();

router.post('/professor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mensagem: Mensagem = await new ProfessorController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.put('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    //@ts-ignore
    const { email } = req.uid
    const mensagem: Mensagem = await new ProfessorController().alterar(Number(id), req.body, email);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.delete('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const { tipo, email } = req.uid
    const mensagem: Mensagem = await new ProfessorController().excluir(Number(id), tipo, email);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const professor: ProfessorCurso = await new ProfessorController().obterPorId(Number(id));
    res.json(professor);
  } catch (e) {
    next(e);
  }
});

router.get('/professor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const professores: ProfessorCurso[] = await new ProfessorController().listar();
    res.json(professores)
    
    
    
  } catch (e) {
    next(e);
  }
});

export default router;
