'use client';

import { useState, useEffect } from 'react';
import { mentorshipAPI } from '@/lib/api-services';
import { Search, Star, MapPin, Briefcase } from 'lucide-react';

export default function FindMentorPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const data = await mentorshipAPI.getMentors();
      setMentors(data);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = (
      mentor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.mentorBio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesArea = selectedArea ? mentor.mentorshipAreas?.includes(selectedArea) : true;
    return matchesSearch && matchesArea;
  });

  const areas = Array.from(new Set(mentors.flatMap(m => m.mentorshipAreas || [])));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find a Mentor</h1>
          
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">All Areas</option>
              {areas.map((area: any) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading mentors...</div>
          ) : filteredMentors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No mentors found matching your criteria.
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                      {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {mentor.firstName} {mentor.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {mentor.location || 'Remote'}
                      </div>
                    </div>
                  </div>
                  {mentor.rating && (
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-medium">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {mentor.rating}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {mentor.mentorBio}
                </p>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {mentor.mentorshipAreas?.map((area: string) => (
                      <span key={area} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Request Mentorship
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
