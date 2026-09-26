import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import dados from './data/auth.data.json' with { type: 'json' };
import { loginAdmin, loginUser } from './helpers/auth.helper.js';

describe('Fluxo completo - Gestão de Alunos', () => {

  after(async () => {
    await mongoose.connection.close();
  });

  it('deve executar todo o fluxo: login admin, cadastro do aluno, matrícula, login aluno e entrega do trabalho', async () => {

    // 1. Login do administrador
    const tokenAdmin = await loginAdmin(app);

    expect(tokenAdmin).to.be.a('string');

    // Cria dados únicos para cada execução do teste
    const identificador = Date.now();

    const aluno = {
      ...dados.aluno,
      email: `joao.${identificador}@example.com`,
      matricula: `2024${identificador}`
    };

    // 2. Cadastro do aluno
    const cadastroAluno = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(aluno);

    expect(cadastroAluno.status).to.equal(201);
    expect(cadastroAluno.body).to.have.property('id');

    const alunoId = cadastroAluno.body.id;

    // 3. Matrícula do aluno na disciplina
    const matricula = await request(app)
      .post(`/api/admin/disciplinas/${dados.trabalho.disciplinaId}/matriculas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ alunoId });

    expect(matricula.status).to.equal(201);

    // 4. Login do aluno criado neste teste
    const tokenAluno = await loginUser(app, aluno);

    expect(tokenAluno).to.be.a('string');

    // 5. Entrega do trabalho
    const entrega = await request(app)
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send(dados.trabalho);

    expect(entrega.status).to.equal(201);
    expect(entrega.body).to.have.property('id');
  });
});