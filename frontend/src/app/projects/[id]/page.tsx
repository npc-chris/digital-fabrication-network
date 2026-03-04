'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { projectsAPI, projectAssetsAPI } from '@/lib/api-services';
import { Heart, Eye, Users, Clock, DollarSign, CheckCircle, Share2, Terminal, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EngineeringView from '@/components/engineering/EngineeringView';

export default function ProjectDetailsPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'standard' | 'engineering'>('standard');

  useEffect(() => {
    if (params.id) {
      loadProjectData(Number(params.id));
    }
  }, [params.id]);

  const loadProjectData = async (id: number) => {
    try {
      setLoading(true);
      const [projectData, assetsData] = await Promise.all([
        projectsAPI.getById(id),
        projectAssetsAPI.getByProject(id).catch(() => []) // Fallback for now
      ]);

      setProject(projectData);

      // Simulation for demo if assets empty
      if (!assetsData || assetsData.length === 0) {
        setAssets([
          { id: 1, fileName: 'frame_stabilizer.stl', fileUrl: 'https://example.com/frame.stl', fileType: '.stl', hardwareFormat: '3d_model', version: 12 },
          { id: 2, fileName: 'controller_v2.brd', fileUrl: 'https://example.com/pbe.brd', fileType: '.brd', hardwareFormat: 'pcb_design', version: 4 },
          { id: 3, fileName: 'assembly_guide.glb', fileUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', fileType: '.glb', hardwareFormat: '3d_model', version: 1 }
        ]);
        setViewMode('engineering'); // Default to engineering mode for demo
      } else {
        setAssets(assetsData);
        if (assetsData.length > 0) setViewMode('engineering');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await projectsAPI.like(Number(params.id));
      loadProjectData(Number(params.id));
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-zinc-500 font-mono animate-pulse">BOOTING_CONSOLE...</div>
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

  if (viewMode === 'engineering') {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Navbar />
        <div className="bg-[#141417] border-b border-[#27272a] px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('standard')}
              className="text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              Standard View
            </button>
            <div className="h-3 w-[1px] bg-zinc-800" />
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Engineering Console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-650 font-mono">STATUS: STABLE</span>
          </div>
        </div>
        <EngineeringView project={project.project} assets={assets} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      {/* ... Rest of existing standard view code ... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <span className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${project.project.difficulty === 'beginner' ? 'bg-green-500/20 text-green-100' :
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
                  className={`pb-4 px-2 font-medium capitalize transition-colors ${activeTab === tab
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
      <Footer />
    </div>
  );
}
