'use client'

import { useState } from 'react'

export default function TestAPI() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@smartmanager.com',
          password: 'admin123'
        })
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Erreur: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test API SmartManager</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Authentification</h2>
          <button
            onClick={testAuth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Test en cours...' : 'Tester Login SuperAdmin'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Résultat</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">ℹ️ Informations</h2>
          <div className="space-y-2 text-sm">
            <p><strong>SuperAdmin:</strong> admin@smartmanager.com / admin123</p>
            <p><strong>Admin Démo:</strong> demo@smartmanager.com / demo123</p>
            <p><strong>Base de données:</strong> SQLite (dev.db)</p>
            <p><strong>URL SuperAdmin:</strong> <a href="/superadmin" className="text-blue-500 hover:underline">/superadmin</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
