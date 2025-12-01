'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { groupBuyingAPI } from '@/lib/api-services';
import { Users, Clock, Tag, CheckCircle, AlertCircle } from 'lucide-react';

export default function CampaignDetailsPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pledgeQuantity, setPledgeQuantity] = useState(1);
  const [pledging, setPledging] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadCampaign(Number(params.id));
    }
  }, [params.id]);

  const loadCampaign = async (id: number) => {
    try {
      setLoading(true);
      const data = await groupBuyingAPI.getCampaignById(id);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePledge = async () => {
    try {
      setPledging(true);
      await groupBuyingAPI.pledge(Number(params.id), pledgeQuantity);
      loadCampaign(Number(params.id));
      setPledgeQuantity(1);
    } catch (error) {
      console.error('Failed to pledge:', error);
    } finally {
      setPledging(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading campaign...</div>;
  if (!campaign) return <div className="text-center py-12">Campaign not found</div>;

  const progress = Math.min(Math.round((campaign.campaign.currentQuantity / campaign.campaign.minQuantity) * 100), 100);
  const isFunded = campaign.campaign.currentQuantity >= campaign.campaign.minQuantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image and Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-96 bg-gray-200 relative">
                {campaign.campaign.imageUrl ? (
                  <img
                    src={campaign.campaign.imageUrl}
                    alt={campaign.campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Tag className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.campaign.title}</h1>
                <div className="flex items-center space-x-6 text-gray-600 mb-8">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    {campaign.campaign.participantCount} Participants
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Ends {new Date(campaign.campaign.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">About this Campaign</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{campaign.campaign.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pledge Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${campaign.campaign.unitPrice}
                  </span>
                  <span className="text-gray-500">per unit</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Save {Math.round((1 - campaign.campaign.unitPrice / (campaign.campaign.unitPrice * 1.2)) * 100)}% off retail
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{progress}% Funded</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${isFunded ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{campaign.campaign.currentQuantity} pledged</span>
                  <span className="text-gray-500">Goal: {campaign.campaign.minQuantity}</span>
                </div>
              </div>

              {isFunded ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Campaign Funded!</h4>
                    <p className="text-sm text-green-700">This campaign has reached its goal and will be fulfilled.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Funding in Progress</h4>
                    <p className="text-sm text-blue-700">Pledge now to help this campaign reach its goal!</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pledge Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pledgeQuantity}
                    onChange={(e) => setPledgeQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={handlePledge}
                  disabled={pledging}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {pledging ? 'Processing...' : `Pledge $${(pledgeQuantity * campaign.campaign.unitPrice).toFixed(2)}`}
                </button>
                <p className="text-xs text-center text-gray-500">
                  You won&apos;t be charged until the campaign ends successfully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
