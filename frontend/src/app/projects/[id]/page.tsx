'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { projectsAPI } from '@/lib/api-services';
import { Heart, Eye, Users, Clock, DollarSign, CheckCircle, Share2 } from 'lucide-react';

export default function ProjectDetailsPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      loadProject(Number(params.id));
    }
  }, [params.id]);

  const loadProject = async (id: number) => {
    try {
      setLoading(true);
      const data = await projectsAPI.getById(id);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await projectsAPI.like(Number(params.id));
      // Refresh project data to update like count
      loadProject(Number(params.id));
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  const images = project.project.images ? JSON.parse(project.project.images) : [];
  const bom = project.project.bom ? JSON.parse(project.project.bom) : [];
  const steps = project.project.steps ? JSON.parse(project.project.steps) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="h-64 md:h-96 bg-gray-200 relative">
            {images[0] && (
              <img
                src={images[0]}
                alt={project.project.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {project.project.title}
              </h1>
              <div className="flex items-center text-white/90 space-x-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 mr-2 flex items-center justify-center font-bold">
                    {project.author?.firstName?.[0]}{project.author?.lastName?.[0]}
                  </div>
                  <span>{project.author?.firstName} {project.author?.lastName}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm backdrop-blur-sm">
                  {project.project.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                  project.project.difficulty === 'beginner' ? 'bg-green-500/20 text-green-100' :
                  project.project.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-100' :
                  'bg-red-500/20 text-red-100'
                }`}>
                  {project.project.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <div className="flex space-x-8 text-gray-600">
              <button 
                onClick={handleLike}
                className="flex items-center hover:text-red-500 transition-colors"
              >
                <Heart className="w-5 h-5 mr-2" />
                {project.project.likeCount} Likes
              </button>
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                {project.project.viewCount} Views
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {project.project.completedCount} Builds
              </div>
            </div>
            <div className="flex space-x-8 text-gray-600">
              {project.project.estimatedTime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {project.project.estimatedTime}
                </div>
              )}
              {project.project.estimatedCost && (
                <div className="flex items-center font-semibold text-blue-600">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {project.project.estimatedCost}
                </div>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <div className="px-8 py-6">
            <div className="flex space-x-6 border-b border-gray-200 mb-6">
              {['overview', 'bom', 'steps', 'discussion'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'bom' ? 'Bill of Materials' : tab}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {project.project.description}
                  </p>
                  {project.project.tags && (
                    <div className="mt-8 flex flex-wrap gap-2">
                      {project.project.tags.split(',').map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bom' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bom.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity} {item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'steps' && (
                <div className="space-y-8">
                  {steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        {step.image && (
                          <img src={step.image} alt={step.title} className="rounded-lg max-w-md" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="text-center py-12 text-gray-500">
                  Discussion feature coming soon...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
