import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('Підтверджуємо вашу пошту...')
  const [success, setSuccess] = useState(null)
  const { fetchUserData } = useAuth() // ✅ Дістаємо функцію з контексту

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setMessage('Не вказано токен підтвердження.')
      setSuccess(false)
      return
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(`/auth/confirm-email?token=${token}`)
        if (!response.ok) {
          throw new Error('Невдале підтвердження')
        }
        const data = await response.json()
        setMessage(data.message || 'Пошту підтверджено успішно!')
        setSuccess(true)

        await fetchUserData() //Оновлюємо дані користувача
      } catch (err) {
        setMessage('Підтвердження не вдалося. Можливо, токен недійсний або протермінований.')
        setSuccess(false)
      }
    }

    confirmEmail()
  }, [searchParams, fetchUserData]) // fetchUserData додано до залежностей

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Підтвердження пошти</h2>
      <p className={success === true ? 'text-green-600' : success === false ? 'text-red-600' : ''}>
        {message}
      </p>
    </div>
  )
}

export default ConfirmEmail
