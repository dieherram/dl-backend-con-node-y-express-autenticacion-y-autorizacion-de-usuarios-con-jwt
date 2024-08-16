import db from '../../database/db_connect.js'
import bcrypt from 'bcryptjs'

export const registroDeUsuario = async ({ email, password, rol, lenguage }) => {
  const passwordEncriptada = bcrypt.hashSync(password)
  const { rowCount } = await db('INSERT INTO usuarios (id, email, password, rol, lenguage) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *;', [email, passwordEncriptada, rol, lenguage])
  if (!rowCount) {
    const newError = { code: 500, message: 'Error al registrar el usuario' }
    throw newError
  }
}

export const verificarCredenciales = async (email, password) => {
  const { rows: [usuario], rowCount } = await db('SELECT * FROM usuarios WHERE email = $1;', [email])
  if (!rowCount || !usuario) {
    const newError = { code: 401, message: 'Usuario o contraseña no encontrada. Por favor, intenta de nuevo.' }
    throw newError
  }
  const passwordCorrecta = await bcrypt.compare(password, usuario.password)
  if (!passwordCorrecta) {
    const newError = { code: 401, message: 'Usuario o contraseña no encontrada. Por favor, intenta de nuevo.' }
    throw newError
  }
}

export const obtenerUsuario = async (email) => {
  try {
    const { rows } = await db('SELECT email, rol, lenguage FROM usuarios WHERE email = $1;', [email])
    return rows
  } catch (error) {
    const newError = { code: 500, message: error }
    throw newError
  }
}
