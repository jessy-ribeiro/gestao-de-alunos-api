import request from 'supertest';
import dados from '../data/auth.data.json' with { type: 'json' };

export async function loginAdmin(app) {
  const resposta = await request(app)
    .post('/api/auth/login')
    .send(dados.loginAdmin);

  return resposta.body.token;
}

export async function loginUser(app, aluno) {
  const resposta = await request(app)
    .post('/api/auth/login')
    .send({
      email: aluno.email,
      senha: aluno.senha
    });

  return resposta.body.token;
}