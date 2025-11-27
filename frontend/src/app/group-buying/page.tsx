'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Users, Package, Clock, TrendingUp } from 'lucide-react';

export default function GroupBuyingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/group-buying');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Buying</h1>
          <p className="text-gray-600">
            Join forces to import components at better prices. Pool resources for international orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{campaigns.length}</span>
            </div>
            <p className="text-gray-600">Active Campaigns</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.campaign.participantCount, 0)}
              </span>
            </div>
            <p className="text-gray-600">Total Participants</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">
                ${campaigns.reduce((sum, c) => sum + parseFloat(c.campaign.totalFunding), 0).toFixed(0)}
              </span>
            </div>
            <p className="text-gray-600">Total Funding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No active campaigns. Start one!
            </div>
          ) : (
            campaigns.map((item) => {
              const progress = item.campaign.maximumQuantity
                ? (item.campaign.currentQuantity / item.campaign.maximumQuantity) * 100
                : (item.campaign.currentQuantity / item.campaign.minimumQuantity) * 100;
              const isMinimumMet = item.campaign.currentQuantity >= item.campaign.minimumQuantity;
              
              return (
                <Link key={item.campaign.id} href={`/group-buying/${item.campaign.id}`}>
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {item.campaign.title}
                        </h3>
                        <p className="text-sm text-gray-600">{item.campaign.componentName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.campaign.status === 'open' ? 'bg-green-100 text-green-800' :
                        item.campaign.status === 'funding' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.campaign.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {item.campaign.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-semibold">
                          {item.campaign.currency} {item.campaign.unitPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Participants:</span>
                        <span className="font-semibold flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {item.campaign.participantCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-semibold">
                          {item.campaign.currentQuantity} / {item.campaign.minimumQuantity} min
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isMinimumMet ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      {isMinimumMet && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          ✓ Minimum reached!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Deadline: {new Date(item.campaign.deadline).toLocaleDateString()}
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                        Join Campaign
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <Link href="/group-buying/create">
          <button className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors">
            <span className="text-2xl">+</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
