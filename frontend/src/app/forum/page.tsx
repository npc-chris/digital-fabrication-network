'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forumAPI } from '@/lib/api-services';
import { MessageSquare, Users, Clock, Plus } from 'lucide-react';

export default function ForumPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [recentThreads, setRecentThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const [cats, threads] = await Promise.all([
        forumAPI.getCategories(),
        forumAPI.getThreads()
      ]);
      setCategories(cats);
      setRecentThreads(threads);
    } catch (error) {
      console.error('Failed to load forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
            <p className="text-gray-600">Discuss projects, ask for help, and share your knowledge</p>
          </div>
          <Link href="/forum/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              New Discussion
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
            {loading ? (
              <div className="text-center py-12">Loading categories...</div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-6">
                    <span>{category.threadCount || 0} threads</span>
                    <span>{category.postCount || 0} posts</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Discussions */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Discussions</h2>
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : recentThreads.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No recent discussions</div>
              ) : (
                recentThreads.map((thread) => (
                  <Link key={thread.id} href={`/forum/${thread.id}`}>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {thread.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {thread.author?.firstName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(thread.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
