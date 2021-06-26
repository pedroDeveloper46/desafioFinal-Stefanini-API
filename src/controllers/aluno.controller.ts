import Aluno from '../entities/aluno.entity';
import AlunoRepository from '../repositories/aluno.repository';
import usuarioRepository from '../repositories/usuario.repository';
import { FilterQuery } from '../utils/database/database';
import BusinessException from '../utils/exceptions/business.exception';
import Mensagem from '../utils/mensagem';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { Validador } from '../utils/utils';
import UserInvalidException from '../utils/exceptions/invalid.exception'
import UnauthorizedException from '../utils/exceptions/unauthorized.exception'
import CursoController from '../controllers/curso.controller'


export default class AlunoController {
  async obterPorId(id: number): Promise<Aluno> {
    Validador.validarParametros([{ id }]);
    const aluno = await AlunoRepository.obterPorId(id);

    if(!aluno){
      throw new UserInvalidException('Aluno não encontrado') 
    }

    if(aluno.tipo != TipoUsuario.ALUNO){
         throw new BusinessException('Aluno não encontrado')
    }

    const {nome, email, formacao, cursos, idade, tipo} = aluno

    const retorno:any = {nome, email, formacao, cursos, idade, tipo, id}

    return retorno
  }

  async obter(filtro: FilterQuery<Aluno> = {}): Promise<Aluno> {
    const aluno = await AlunoRepository.obter(filtro);

    if(!aluno){
        throw new UserInvalidException('Aluno não encontrado') 
    }

    if(aluno.tipo != TipoUsuario.ALUNO){
         throw new BusinessException('Aluno não encontrado')
    }

    return aluno
  }

  // #pegabandeira
  async listar(filtro: FilterQuery<Aluno> = {}): Promise<Aluno[]> {
    
    const alunos:Aluno[] = (await AlunoRepository.listar(filtro))
    .filter((a) => a.tipo == TipoUsuario.ALUNO)
    .map((a)=>{
       const {nome, email, idade, formacao, cursos, id, tipo} = a
       const alunos:any = {nome, email, idade, formacao, cursos, id, tipo}
       return alunos
    })

    return alunos
  }

  async listarMatriculados(): Promise<Aluno[]>{
      const alunos:Aluno[] = (await this.listar()).filter((a)=> {
           if(a.cursos.length >0){
              return a
           }
      }) 

      

      return alunos
  }

  // #pegabandeira
  async incluir(aluno: Aluno) {
    const { nome, formacao, idade, email, senha } = aluno;
    Validador.validarParametros([{ nome }, { formacao }, { idade }, { email }, { senha }]);
    
    aluno.tipo = TipoUsuario.ALUNO
    aluno.cursos = []
    
    const usuario = await usuarioRepository.obter({email})

    if(usuario){
        throw new BusinessException('Email Existente')
    }
    
    const id = await AlunoRepository.incluir(aluno);
       return new Mensagem('Aluno incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, aluno: Aluno, emailUsu:string, tipo:Number) {
    const {nome, senha, formacao, idade, email } = aluno
    Validador.validarParametros([{ id }, {nome}, {senha}, {formacao}, {idade}]);

    const usuAluno = await this.obterPorId(id)


    if(tipo == TipoUsuario.ALUNO){
      if(emailUsu != usuAluno.email){
          throw new UnauthorizedException('Não é possivel realizar essa operação')
      }
    }

    if(email == ''){
        throw new BusinessException('Não é possivel alterar o email')
    }

    if(email != '' && email != null){
        if(email != usuAluno.email){
          throw new BusinessException('Não é possivel alterar o email') 
        }
    }
    
    
    await AlunoRepository.alterar({ id }, aluno);
    return new Mensagem('Aluno alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number, tipo:number) {
    Validador.validarParametros([{ id }]);

    const aluno = await this.obter({id})

    if(aluno.cursos.length >0){
        throw new BusinessException('Esse aluno está matriculado em um ou mais cursos')  
    }

    if(tipo != TipoUsuario.PROFESSOR){
        throw new UnauthorizedException('Não é possivel realizar essa operação')
    }

    await AlunoRepository.excluir({ id });


    return new Mensagem('Aluno excluido com sucesso!', {
      id,
    });
  }

  async matricularCurso(id:number, Idcurso:number){
          
    const aluno = await this.obterPorId(id)
    const curso = await new CursoController().obterPorId(Idcurso)

    const cursos = aluno.cursos.filter((a)=>{
       if(a.id === Idcurso){
           return a
       }
    })

    if(cursos.length > 0){
        throw new BusinessException('O Aluno já esta matriculado nesse curso') 
    } 

    aluno.cursos.push(curso)

     

     await AlunoRepository.alterar({ id }, aluno);

     return new Mensagem('Aluno Matriculado com Sucesso')
     
  }
}
