// Write your tests here
const request = require("supertest")
const server = require('./server')
const db = require('../data/dbConfig')

const Fern = {
  username: "TGIF",
  password: "Pa$$W0rD"
}

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe("Testing endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    it("responds with status code 201 Created", async () => {
      const res = await request(server).post("/api/auth/register").send(Fern)
      expect(res.status).toBe(201)
    })
    it("responds with username and hashed password", async () => {
      const res = await request(server).post("/api/auth/register").send(Fern)
      expect(res.body.username).toBe("TGIF")
      expect(res.body.password).toMatch(/^\$2[ayb]\$.{56}$/)
    })
  })

  describe("[POST] /api/auth/login", () => {
    it("responds with status code 200", async () => {
      await request(server).post("/api/auth/register").send(Fern)
      const res = await request(server).post("/api/auth/login").send(Fern)
      expect(res.status).toBe(200)
    })
    it("responds with a welcome message and a token", async () => {
      await request(server).post("/api/auth/register").send(Fern)
      const res = await request(server).post("/api/auth/login").send(Fern)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('token')
    })
  })

  describe("[GET] /api/jokes", () => {
    it("recieves status code 200 OK", async () => {
      await request(server).post('/api/auth/register').send(Fern)
      const { body: { token } } = await request(server).post('/api/auth/login').send(Fern)
      const res = await request(server).get('/api/jokes').set('Authorization', token)
      expect(res.status).toBe(200)
    })
    it("responds with a joke", async () => {
      await request(server).post('/api/auth/register').send(Fern)
      const { body: { token } } = await request(server).post('/api/auth/login').send(Fern)
      const res = await request(server).get('/api/jokes').set('Authorization', token)
      expect(JSON.stringify(res.body)).toEqual(expect.stringMatching('Did you hear about the guy whose'))
    })
  })
})