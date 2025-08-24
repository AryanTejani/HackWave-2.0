import SupplyChainMap from '@/components/supply-chain-map/SupplyChainMap';

export default function Map() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Supply Chain Overview</h1>
      <SupplyChainMap />
    </div>
  );
}