import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

import { verificarCredenciales, registroDeUsuario, obtenerUsuario } from './models/desarrolladores.models.js'
import { jwtSign, jwtDecode } from './utils/auth/jwt.js'
import { authToken } from './middlewares/auth.middleware.js'

const PORT = process.env.PORT ?? 3000
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    await verificarCredenciales(email, password)
    const token = jwtSign({ email })
    res.status(200).json({ token })
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, error })
  }
})

app.post('/usuarios', async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body
    await registroDeUsuario({ email, password, rol, lenguage })
    res.status(200).json({ status: true, message: 'Usuario registrado' })
  } catch (error) {
    res.status(500).json({ status: false, message: `Ha ocurrido un error, código: ${error.code || 'desconocido'}`, error })
  }
})

app.get('/usuarios', authToken, async (req, res) => {
  try {
    const authorization = req.header('Authorization')
    const [, token] = authorization.split(' ')
    const { email } = jwtDecode(token)
    const user = await obtenerUsuario(email)
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ status: false, message: `Ha ocurrido un error, código: ${error.code || 'desconocido'}`, error })
  }
})

app.all('*', (_, res) => res.status(404).json({ status: true, message: 'Endpoint no encontrado' }))

app.listen(PORT, () => console.log(`El servidor está funcionando en puerto: ${PORT}`))

export default app
