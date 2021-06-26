import Aula from '../models/aula.model';
import CursoRepository from '../repositories/curso.repository';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import CursoController from '../controllers/curso.controller'
import BusinessException from '../utils/exceptions/business.exception';
import { TipoUsuario } from '../utils/tipo-usuario.enum';

export default class AulaController {
  async obterPorId(id: number, idCurso: number): Promise<Aula> {
    Validador.validarParametros([{ id }, { idCurso }]);
    const curso = await new CursoController().obterPorId(idCurso);
    const aula = curso.aulas.find((a) => a.id === id);

    if(!aula){
        throw new BusinessException('Aula não encontrada')
    }

    return aula
  }

  

  async listar(idCurso: number): Promise<Aula[]> {
    Validador.validarParametros([{ idCurso }]);
    const curso = await new CursoController().obterPorId(idCurso);

    if(curso.aulas.length == 0){
        throw new BusinessException('Esse curso não tem aulas')
    }
    
    return curso.aulas


  }

  async incluir(aula: Aula) {
    const { nome, duracao, topicos, idCurso } = aula;
    Validador.validarParametros([{ nome }, { duracao }, { topicos }, { idCurso }]);

    const curso = await new CursoController().obterPorId(idCurso);

    const aulaNome = curso.aulas.filter((a) => a.nome == nome)

    if(aulaNome.length > 0){
        throw new BusinessException('Essa Aula já existe')
    }

    let idAnterior
    
    if(curso.aulas.length == 0){
       idAnterior = 0
    }else{
      idAnterior = curso.aulas[curso.aulas.length - 1].id;
    }

    aula.id = idAnterior ? idAnterior + 1 : 1;
    curso.aulas.push(aula);

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula incluida com sucesso!', {
      id: aula.id,
      idCurso,
    });
  }

  async alterar(id: number, aula: Aula, tipo:number) {
    const { nome, duracao, topicos, idCurso } = aula;
    Validador.validarParametros([{ id }, { idCurso }, { nome }, { duracao }, { topicos }]);

    const curso = await new CursoController().obterPorId(idCurso);

    const idAula = curso.aulas.filter((a) => a.id == id)

    const aulaNome = curso.aulas.filter((a) => a.nome == nome && a.id != id)

    if(idAula.length == 0){
        throw new BusinessException('Essa Aula não existe')
    }

    if(aulaNome.length > 0){
        throw new BusinessException('Essa Aula já existe')
    }

    if(tipo != TipoUsuario.PROFESSOR){
        throw new BusinessException('Não é possivel realizar essa operação')
    }

    curso.aulas.map((a) => {
      if (a.id === id) {
        Object.keys(aula).forEach((k) => {
          a[k] = aula[k];
        });
      }
    });




    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula alterada com sucesso!', {
      id,
      idCurso,
    });
  }

  async excluir(id: number, idCurso: number, tipo:number) {
    Validador.validarParametros([{ id }, { idCurso }]);

    const curso = await new CursoController().obterPorId(idCurso);

    const idAula = curso.aulas.filter((a) => a.id == id)
    if(idAula.length == 0) {
      throw new BusinessException('Essa Aula não existe')
    }

    if(tipo != TipoUsuario.PROFESSOR){
        throw new BusinessException('Não é possivel realizar essa operação') 
    }

    curso.aulas = curso.aulas.filter((a) => a.id !== id);

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula excluida com sucesso!');
  }
}
