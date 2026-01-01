'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:4000/api/users/promote-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretKey })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Success! You are now an admin. Please logout and login again.');
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to promote user'}`);
      }
    } catch (error) {
      setMessage('❌ Error: Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromote} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Default: SUPER_ADMIN_SECRET_2024</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Promote to Admin'}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Register a normal account first</li>
              <li>Enter that account's email above</li>
              <li>Enter the secret key</li>
              <li>Click "Promote to Admin"</li>
              <li>Logout and login again</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
