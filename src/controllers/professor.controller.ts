import Professor from '../entities/professor.entity';
import ProfessorRepository from '../repositories/professor.repository';
import { FilterQuery } from '../utils/database/database';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import {TipoUsuario} from '../utils/tipo-usuario.enum'
import  BusinessException  from '../utils/exceptions/business.exception'
import usuarioRepository from '../repositories/usuario.repository';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception'
import UserInvalidException from '../utils/exceptions/invalid.exception'
import CursoRepository from '../repositories/curso.repository'
import ProfessorCurso from '../models/ProfessorCurso';
import Curso from '../entities/curso.entity';
import CursoController  from './curso.controller';



export default class ProfessorController {


  

  async obterPorId(idP: number): Promise<ProfessorCurso> {
    Validador.validarParametros([{ idP }]);

    const prof = await ProfessorRepository.obterPorId(idP);

    if(!prof){
      throw new UserInvalidException('Professor não encontrado')
    }

    if(prof.tipo != TipoUsuario.PROFESSOR){
        throw new BusinessException('Professor não encontrado') 
    }

    const professor:ProfessorCurso = new ProfessorCurso()
    const{nome, email, tipo, id} = prof
    
    const p:Partial<Professor> = {nome, email, tipo, id}
    const idProfessor = id

    const cursos:Curso[] = await new CursoController().listar({idProfessor})
    
    professor.setProfessor(p)
    professor.setCursos(cursos)

    return professor
  }

  async obter(filtro: FilterQuery<Professor> = {}): Promise<Professor> {
    const prof  = await ProfessorRepository.obter(filtro);

    if(!prof){
        throw new UserInvalidException('Professor não encontrado')
    }

    if(prof.tipo != TipoUsuario.PROFESSOR){
        throw new BusinessException('Um Aluno não pode realizar essa operação ') 
    }

    return prof
  }

  // #pegabandeira
  async listar(filtro: FilterQuery<Professor> = {}): Promise<ProfessorCurso[]> {
    const professores = (await ProfessorRepository.listar(filtro)).filter((prof)=>{
        if(prof.tipo == 1){
          return prof
        }
    });

    const professoresCurso: ProfessorCurso[] = []

    for (let index = 0; index < professores.length; index++) {
        const prof: ProfessorCurso = new ProfessorCurso()
        
        const {nome, email, tipo, id} = professores[index]
        
        const p: Partial<Professor> = {nome, email, tipo, id}
        
        prof.setProfessor(p)
        
        const idProfessor = id
        
        const cursos: Curso[] = await new CursoController().listar({idProfessor})
        
        prof.setCursos(cursos)
        professoresCurso.push(prof)
    }

    return professoresCurso

     

    
  }

  // #pegabandeira
  async incluir(professor: Professor) {
    const { nome, email, senha } = professor;

    Validador.validarParametros([{ nome }, { email }, { senha }]);
    
    professor.tipo = TipoUsuario.PROFESSOR;

    const usuario = await usuarioRepository.obter({email: {$eq:email}})

    if(usuario){
       throw new BusinessException('Email Existente')
    }

    const id = await ProfessorRepository.incluir(professor);

    return new Mensagem('Professor incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, professor: Professor, emailUsu:string) {
    const { nome, email, senha } = professor;

    Validador.validarParametros([{ id }, { nome }, { senha }]);


    const usuario = await this.obter({id:{$eq:id}})

    if(email == ""){
        throw new BusinessException('Não é possivel alterar o email')
    }

    if(emailUsu != usuario.email){
         throw new UnauthorizedException('Não é possivel realizar essa operação, esse não é o seu usúario')
    }

    if(email != '' && email != null){
      if(usuario.email != email){
        throw new BusinessException('Não é possivel alterar o email')
      }
    }

    await ProfessorRepository.alterar({ id }, professor);

    return new Mensagem('Professor alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number, tipo:number, email:string) {
    Validador.validarParametros([{ id }]);
    
    const idProfessor = id
    const curso = await CursoRepository.obter({idProfessor})

    if(curso){
       throw new BusinessException('Não é possivel excluir esse professor, pois ele está vinculado a um curso')
    }

    const professor = await this.obter({id})

    if(professor.email == email ){
         throw new BusinessException('O Professor não pode deletar o seu usuario')
    }

    if(tipo != TipoUsuario.PROFESSOR){
        throw new UnauthorizedException('Um Aluno não pode realizar essa operação')
    } 

    await ProfessorRepository.excluir({ id });

    

    return new Mensagem('Professor excluido com sucesso!', {
      id,
    });
  }
 
  
    
  


}
