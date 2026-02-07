'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Please log in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl mb-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-purple-600">
              Your Profile
            </h1>
            <button
              onClick={refreshUser}
              className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-md hover:bg-gray-700 border border-cyan-500/30 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-700">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-600">{user.email}</h2>
                <p className="text-gray-400">Account ID: {user.id}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <p className="text-gray-600">Your account is secured with industry-standard encryption.</p>
        </div>
      </div>
    </div>
  );
}