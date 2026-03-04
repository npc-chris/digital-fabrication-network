'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { groupBuyingAPI, cartAPI } from '@/lib/api-services';
import { Users, Clock, Tag, Plus, ShoppingCart, Target, Zap, Shield } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

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

  const handleAddToCart = async (e: React.MouseEvent, campaign: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await cartAPI.addItem({
        campaignId: campaign.id,
        quantity: 1,
        price: campaign.unitPrice,
        productName: campaign.title,
      });
      alert('Network Pledge Initialized: Item added to cart.');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to initialize pledge. Please check network connection.');
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-primary-600 rounded-full"></span>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-500 font-bold">Consolidated Procurement</p>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Group_Buying_Hub</h1>
            <p className="text-zinc-500 mt-2 max-w-xl text-sm italic">
              Leveraging collective volume to access industrial-grade manufacturing rates for the African fabrication network.
            </p>
          </div>
          <Link href="/group-buying/create">
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-600/20 font-bold text-sm uppercase tracking-widest">
              <Plus className="w-5 h-5" />
              Initialize Campaign
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-1 bg-[#141417] border border-zinc-800 rounded-xl w-fit mb-12">
          {['active', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filter === status
                ? 'bg-zinc-800 text-primary-400 shadow-inner'
                : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 font-mono text-zinc-500 tracking-widest animate-pulse">
              SYNCHRONIZING_MARKET_DATA...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#141417] border border-dashed border-zinc-800 rounded-2xl">
              <Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">
                No {filter} campaigns found in current sector.
              </p>
            </div>
          ) : (
            campaigns.map((item) => (
              <Link key={item.campaign.id} href={`/group-buying/${item.campaign.id}`}>
                <div className="group bg-[#141417] border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-500 cursor-pointer h-full flex flex-col relative shadow-2xl shadow-black/50">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                      {item.campaign.status}
                    </span>
                  </div>

                  <div className="h-56 bg-[#0a0a0c] relative overflow-hidden">
                    {item.campaign.imageUrl ? (
                      <img
                        src={item.campaign.imageUrl}
                        alt={item.campaign.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-900 to-black">
                        <Zap className="w-16 h-16 text-zinc-800 opacity-20 group-hover:opacity-40 transition-opacity" />
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-primary-600/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-white tracking-widest uppercase shadow-lg">
                      {calculateProgress(item.campaign.currentQuantity, item.campaign.minimumQuantity)}% FUNDED
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-3 h-3 text-primary-500" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Batch Procurement</span>
                    </div>

                    <h3 className="font-bold text-xl text-white mb-3 tracking-tight group-hover:text-primary-400 transition-colors line-clamp-1">
                      {item.campaign.title}
                    </h3>

                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2 italic leading-relaxed">
                      {item.campaign.description}
                    </p>

                    <div className="mt-auto space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                          <span className="text-zinc-400">Current Pledges: <span className="text-primary-400 font-bold">{item.campaign.currentQuantity}</span></span>
                          <span className="text-zinc-600">Goal: {item.campaign.minimumQuantity}</span>
                        </div>
                        <div className="w-full bg-black/40 border border-zinc-800/50 rounded-full h-2 px-0.5 flex items-center">
                          <div
                            className="bg-primary-600 h-1 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                            style={{ width: `${calculateProgress(item.campaign.currentQuantity, item.campaign.minimumQuantity)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-zinc-800/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-0.5">Unit Price</span>
                          <div className="text-2xl font-black text-white flex items-baseline">
                            ${item.campaign.unitPrice}
                            <span className="text-[10px] text-zinc-600 font-normal ml-1">/ UNIT</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-0.5">Expires</span>
                          <div className="flex items-center text-xs text-zinc-400 font-bold">
                            <Clock className="w-3 h-3 mr-1.5 text-orange-500" />
                            {new Date(item.campaign.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, item.campaign)}
                        className="w-full mt-4 flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white py-4 rounded-xl font-bold transition-all border border-zinc-800 group-hover:border-primary-600/50 uppercase text-xs tracking-widest"
                      >
                        <ShoppingCart className="w-4 h-4 text-primary-500" />
                        Pledge Contribution
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
