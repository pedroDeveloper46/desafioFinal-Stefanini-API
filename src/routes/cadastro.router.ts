import express, { NextFunction, Request, Response } from 'express';
import ProfessorController from '../controllers/professor.controller';
import AlunoController from '../controllers/aluno.controller';
import Mensagem from '../utils/mensagem';

const router = express()


router.post('/professor', async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const mensagem: Mensagem = await new ProfessorController().incluir(req.body);
        res.json(mensagem);
      } catch (e) {
        next(e);
      }
})

router.post('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mensagem: Mensagem = await new AlunoController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

export default router