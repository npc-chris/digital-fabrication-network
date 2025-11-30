'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { groupBuyingAPI } from '@/lib/api-services';
import { Users, Clock, Tag, Plus } from 'lucide-react';

export default function GroupBuyingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadCampaigns();
  }, [filter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await groupBuyingAPI.getAllCampaigns({ status: filter });
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Buying</h1>
            <p className="text-gray-600">Join forces to get bulk discounts on components and materials</p>
          </div>
          <Link href="/group-buying/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Start Campaign
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          {['active', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No {filter} campaigns found.
            </div>
          ) : (
            campaigns.map((item) => (
              <Link key={item.campaign.id} href={`/group-buying/${item.campaign.id}`}>
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer h-full flex flex-col">
                  <div className="h-48 bg-gray-200 relative">
                    {item.campaign.imageUrl ? (
                      <img
                        src={item.campaign.imageUrl}
                        alt={item.campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <Tag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-600">
                      {calculateProgress(item.campaign.currentQuantity, item.campaign.minimumQuantity)}% Funded
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {item.campaign.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {item.campaign.description}
                    </p>

                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${calculateProgress(item.campaign.currentQuantity, item.campaign.minimumQuantity)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          <span className="font-semibold text-gray-900">{item.campaign.currentQuantity}</span> pledged
                        </span>
                        <span className="text-gray-600">
                          Goal: <span className="font-semibold text-gray-900">{item.campaign.minimumQuantity}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center text-green-600 font-bold text-lg">
                          ${item.campaign.unitPrice}
                          <span className="text-xs text-gray-500 font-normal ml-1">/ unit</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(item.campaign.deadline).toLocaleDateString()}
                        </div>
                      </div>
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
