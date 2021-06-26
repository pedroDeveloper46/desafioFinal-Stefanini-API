import Curso from '../entities/curso.entity';
import CursoRepository from '../repositories/curso.repository';
import { FilterQuery } from '../utils/database/database';
import BusinessException from '../utils/exceptions/business.exception';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import ProfessorController from '../controllers/professor.controller';
import UserInvalidException from '../utils/exceptions/invalid.exception'
import ProfessorRepository from '../repositories/professor.repository';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception'
import AlunoController from './aluno.controller';
import Aula from '../models/aula.model'
import Avaliacao from '../models/avaliacao'

export default class CursoController {
  async obterPorId(id: number): Promise<Curso> {
    Validador.validarParametros([{ id }]);
    const curso = await CursoRepository.obterPorId(id);

    if(!curso){
       throw new BusinessException('Curso não encontrado')
    }

    return curso
  }

  async obter(filtro: FilterQuery<Curso> = {}): Promise<Curso> {
    const curso = await CursoRepository.obter(filtro);

    if(curso){
        throw new BusinessException('Esse Curso já existe')
    }

    return curso
  }

  

  async listar(filtro: FilterQuery<Curso> = {}): Promise<Curso[]> {
    return await CursoRepository.listar(filtro);
  }

  async incluir(curso: Curso, tipo:number) {
    const { nome, descricao, aulas, idProfessor } = curso;
    Validador.validarParametros([{ nome }, { descricao }, { aulas }, { idProfessor }]);

    await this.obter({nome})

    

    if(tipo != TipoUsuario.PROFESSOR){
        throw new BusinessException('Não é possivel realizar essa operação')  
    }
    
    curso.avaliacoes = []

    const Id = await CursoRepository.incluir(curso);

    return new Mensagem('Curso incluido com sucesso!', {
      Id,
    });
  }

  async avaliarCurso(id:number, avaliacao:Avaliacao, email:string){
      const {aluno, nota} = avaliacao
      Validador.validarParametros([{aluno}, {nota}])

      const curso = await this.obterPorId(id)

      if(nota < 0 || nota > 5){
          throw new BusinessException('Nota Inválida')
      }

      const a = await new AlunoController().obterPorId(aluno)

      if(a.tipo != TipoUsuario.ALUNO){
           throw new BusinessException('O seu Usúario não pde realizar essa operação') 
      }

      if(a.email != email){
          throw new BusinessException('Não é possivel realizar essa operação, pois esse aluno não está logado')
      }

      if(a.cursos.filter((c)=> c.id == id).length == 0){
           throw new BusinessException('O Aluno não está matriculado nesse curso')
      }

      if(curso.avaliacoes.length > 0){
        const avl = curso.avaliacoes.filter((a) => a.aluno == aluno)

        if(avl.length > 0){
            throw new BusinessException('O Aluno solicitado ja avaliou o curso')
        }
      }
      
      avaliacao.nome = a.nome

      curso.avaliacoes.push(avaliacao)


      await CursoRepository.alterar({ id }, curso);

      return new Mensagem('Avaliação feita com sucesso!!', {
        id,
      });

      
  }

  async alterarAvaliacao(id:number, avaliacao:Avaliacao, email:string){

    const {aluno, nota} = avaliacao
    Validador.validarParametros([{nota}])

      const curso = await this.obterPorId(id)
      

      if(nota < 0 || nota > 5){
          throw new BusinessException('Nota Inválida')
      }

     const a = await new AlunoController().obterPorId(aluno)
     avaliacao.nome = a.nome

      if(a.tipo != TipoUsuario.ALUNO){
        throw new BusinessException('O seu Usúario não pde realizar essa operação') 
      }

      if(a.email != email){
       throw new BusinessException('Não é possivel realizar essa operação, pois esse aluno não está logado')
      }

      const cursos  = a.cursos.filter((c)=> c.id == curso.id)

      
      
      let aux;
      if(curso.avaliacoes.length > 0){
        const avl = curso.avaliacoes.filter((a) => a.aluno == aluno)

        if(avl.length == 0){
            throw new BusinessException('O Aluno solicitado ainda não avaliou esse curso')
        }
        avl[0].nota = nota
        aux = avl[0]
      }
      
      

      avaliacao = aux


      await CursoRepository.alterar({ id }, curso);

      return new Mensagem('Avaliação atualizada com sucesso!!', {
        id,
      });

  }

  async alterar(id: number, curso: Curso, tipo:number) {
    const { nome, descricao, aulas, idProfessor } = curso;
    Validador.validarParametros([{ id }, { nome }, { descricao }, { aulas }, { idProfessor }]);

     
    await new ProfessorController().obterPorId(idProfessor)

    await this.obterPorId(id)

    if(tipo != TipoUsuario.PROFESSOR){
         throw new UnauthorizedException('Não é possivel realizar essa operação') 
    }


    await CursoRepository.alterar({ id }, curso);

    return new Mensagem('Curso alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number) {
    Validador.validarParametros([{ id }]);

    await this.obterPorId(id)

    const alunos = await new AlunoController().listarMatriculados()

    if(alunos.length > 0){
       
       alunos.forEach((a)=> {
           if(a.cursos.length >0){
             a.cursos.forEach((c)=>{
              if(c.id == id){
                throw new BusinessException('Não é possivel excluir esse curso, pois ele tem alunos matriculados')
              }
            }
          )}
       })


       
    }

    await CursoRepository.excluir({ id });

    return new Mensagem('Curso excluido com sucesso!', {
      id,
    });
  }
}
