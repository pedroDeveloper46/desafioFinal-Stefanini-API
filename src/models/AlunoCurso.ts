import Aluno from "../entities/aluno.entity";
import Curso from "../entities/curso.entity";

export default class AlunoCurso{
    aluno:Partial<Aluno>
    cursos: Curso[]


}