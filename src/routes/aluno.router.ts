import express, { NextFunction, Request, Response } from 'express';
import AlunoController from '../controllers/aluno.controller';
import Aluno from '../entities/aluno.entity';
import Mensagem from '../utils/mensagem';

const router = express.Router();

router.post('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mensagem: Mensagem = await new AlunoController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.put('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const {email, tipo} = req.uid
    const mensagem: Mensagem = await new AlunoController().alterar(Number(id), req.body, email, tipo);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.patch('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {idCurso} = req.body
    const mensagem: Mensagem = await new AlunoController().matricularCurso(Number(id), idCurso);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.delete('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const {tipo} = req.uid
    const mensagem: Mensagem = await new AlunoController().excluir(Number(id), tipo);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const aluno: Aluno = await new AlunoController().obterPorId(Number(id));
    res.json(aluno);
  } catch (e) {
    next(e);
  }
});

router.get('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alunos: Aluno[] = await new AlunoController().listar();
    res.json(alunos);
  } catch (e) {
    next(e);
  }
});

router.get('/alunosMatriculado/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const alunos: Aluno[] = await new AlunoController().listarMatriculados();
    res.json(alunos);
  } catch (e) {
    next(e);
  }
});




export default router;
