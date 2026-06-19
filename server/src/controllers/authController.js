import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' })

const sendAuth = (res, status, user, token) =>
  res.status(status).json({ user: { _id: user._id, name: user.name, email: user.email, settings: user.settings }, token })

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    sendAuth(res, 201, user, signToken(user._id))
  } catch (err) { next(err) }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    sendAuth(res, 200, user, signToken(user._id))
  } catch (err) { next(err) }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user })
}

// PATCH /api/auth/settings
export const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: { ...req.user.settings, ...req.body } },
      { new: true, runValidators: true }
    )
    res.json({ user })
  } catch (err) { next(err) }
}
