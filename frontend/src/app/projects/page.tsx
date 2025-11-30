'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectsAPI } from '@/lib/api-services';
import { Heart, Eye, Users, Wrench, Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll(filters);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Hub</h1>
            <p className="text-gray-600">Explore builds, share your projects, and find inspiration</p>
          </div>
          <Link href="/projects/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Share Project
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              title="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="robotics">Robotics</option>
              <option value="iot">IoT</option>
              <option value="3d-printing">3D Printing</option>
              <option value="pcb-design">PCB Design</option>
              <option value="automation">Automation</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              title="Filter by difficulty"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No projects found. Be the first to share!
            </div>
          ) : (
            projects.map((item) => (
              <Link key={item.project.id} href={`/projects/${item.project.id}`}>
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer h-full flex flex-col">
                  {/* Project Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {item.project.images && JSON.parse(item.project.images)[0] ? (
                      <img
                        src={JSON.parse(item.project.images)[0]}
                        alt={item.project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Wrench className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {item.project.difficulty && (
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        item.project.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        item.project.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.project.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {item.project.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {item.project.description}
                    </p>

                    {/* Author */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-xs font-bold text-gray-600">
                        {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                      </div>
                      <span className="text-sm text-gray-700">
                        {item.author?.firstName} {item.author?.lastName}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center" title="Likes">
                          <Heart className="w-4 h-4 mr-1" />
                          {item.project.likeCount}
                        </span>
                        <span className="flex items-center" title="Views">
                          <Eye className="w-4 h-4 mr-1" />
                          {item.project.viewCount}
                        </span>
                        <span className="flex items-center" title="Completed">
                          <Users className="w-4 h-4 mr-1" />
                          {item.project.completedCount}
                        </span>
                      </div>
                      {item.project.estimatedCost && (
                        <span className="font-semibold text-blue-600">
                          ${item.project.estimatedCost}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}