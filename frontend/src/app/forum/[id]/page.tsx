'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { forumAPI } from '@/lib/api-services';
import { MessageSquare, User, Clock, ThumbsUp } from 'lucide-react';

export default function ThreadPage() {
  const params = useParams();
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadThread(Number(params.id));
    }
  }, [params.id]);

  const loadThread = async (id: number) => {
    try {
      setLoading(true);
      const data = await forumAPI.getThreadById(id);
      setThread(data);
    } catch (error) {
      console.error('Failed to load thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      await forumAPI.replyToThread(Number(params.id), replyContent);
      setReplyContent('');
      loadThread(Number(params.id)); // Reload to show new reply
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading discussion...</div>;
  if (!thread) return <div className="text-center py-12">Thread not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Thread Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {thread.category?.name}
            </span>
            <span className="text-sm text-gray-500">
              Posted {new Date(thread.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{thread.title}</h1>
          
          <div className="flex items-start gap-4 border-t border-gray-100 pt-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {thread.author?.firstName} {thread.author?.lastName}
                </span>
              </div>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{thread.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900">
            {thread.posts?.length || 0} Replies
          </h3>
          
          {thread.posts?.map((post: any) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {post.author?.firstName} {post.author?.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Reply</h3>
          <form onSubmit={handleReply}>
            <textarea
              rows={4}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Share your thoughts..."
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
