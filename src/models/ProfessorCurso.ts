import Curso from "../entities/curso.entity"
import Professor from "../entities/professor.entity";

export default class ProfessorCurso{

    professor: Partial<Professor>;
    cursos: Curso[]

    constructor(){

    }

    setProfessor(p:Partial<Professor>){
        this.professor = p
    }

    setCursos(c:Curso[]){
        this.cursos = c
    }

}