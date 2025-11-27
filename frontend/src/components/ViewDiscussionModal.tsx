'use client';

import { X, Send, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { communityAPI } from '@/lib/api-services';

interface ViewDiscussionModalProps {
  post: any;
  onClose: () => void;
}

interface Reply {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
  userName?: string;
  userAvatar?: string;
}

export default function ViewDiscussionModal({ post, onClose }: ViewDiscussionModalProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    loadReplies();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const loadReplies = async () => {
    try {
      const response = await communityAPI.getById(post.id);
      setReplies(response.replies || []);
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await communityAPI.createReply(post.id, newReply);
      setNewReply('');
      loadReplies(); // Reload replies
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit reply. Please login and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const tags = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-start flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold mb-1">{post.title}</h2>
            <p className="text-sm text-gray-500">
              Posted by {post.authorCompany || `${post.authorName || ''} ${post.authorLastName || ''}`.trim() || `User #${post.authorId}`}
              {' • '}
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Post Content */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs ${
                post.status === 'open' ? 'bg-green-100 text-green-800' :
                post.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {post.status === 'in_progress' ? 'In Progress' : (post.status || 'open').charAt(0).toUpperCase() + (post.status || 'open').slice(1)}
              </span>
              {post.category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                  {post.category.replace('_', ' ')}
                </span>
              )}
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>👁 {post.viewCount || 0} views</span>
              <span>💬 {replies.length} replies</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6" />

          {/* Replies Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Discussion ({replies.length})</h3>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading replies...</div>
            ) : replies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No replies yet. Be the first to join the discussion!
              </div>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {reply.userAvatar ? (
                        <img
                          src={reply.userAvatar}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {reply.userName || `User #${reply.userId}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Input - Fixed at bottom */}
        <div className="bg-white border-t px-6 py-4 flex-shrink-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmitReply} className="flex gap-3">
            <input
              type="text"
              placeholder="Write a reply..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting || !newReply.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending...' : 'Reply'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
