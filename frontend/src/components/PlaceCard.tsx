import type { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  onViewOnMap?: () => void;
}

/**
 * Component to display individual place information
 */
const PlaceCard: React.FC<PlaceCardProps> = ({ place, onViewOnMap }) => {
  const {
    name,
    address,
    rating,
    user_ratings_total,
    price_level,
    open_now,
    directions_url,
    embed_iframe_url,
  } = place;

  /**
   * Get the price level display
   */
  const getPriceLevelDisplay = (level?: number) => {
    if (!level) return null;
    const priceMap: Record<number, string> = {
      0: 'Free',
      1: '$',
      2: '$$',
      3: '$$$',
      4: '$$$$',
    };
    return priceMap[level] || '$'.repeat(level);
  };

  /**
   * Get open status color
   */
  const getOpenStatusColor = (isOpen?: boolean) => {
    if (isOpen === undefined) return 'text-base-content';
    return isOpen ? 'text-success' : 'text-error';
  };

  /**
   * Get open status text
   */
  const getOpenStatusText = (isOpen?: boolean) => {
    if (isOpen === undefined) return 'Hours unknown';
    return isOpen ? 'Open Now' : 'Closed';
  };

  return (
    <div className="place-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-base-content line-clamp-2">
          {name}
        </h3>
        {rating && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-warning">⭐</span>
            <span className="font-medium">{rating}</span>
            {user_ratings_total && (
              <span className="text-base-content/60">({user_ratings_total})</span>
            )}
          </div>
        )}
      </div>

      {/* Address */}
      <p className="text-sm text-base-content/70 mb-2">{address}</p>

      {/* Price Level and Open Status */}
      <div className="flex items-center gap-4 mb-3">
        {price_level && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-base-content/60">Price:</span>
            <span className="text-sm font-medium">
              {getPriceLevelDisplay(price_level)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-base-content/60">Status:</span>
          <span className={`text-sm font-medium ${getOpenStatusColor(open_now)}`}>
            {getOpenStatusText(open_now)}
          </span>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex gap-2">
        {onViewOnMap && (
          <button
            onClick={onViewOnMap}
            className="btn btn-sm btn-primary flex-1"
          >
            📍 View on Map
          </button>
        )}
        {directions_url && (
          <a
            href={directions_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline flex-1"
          >
            🗺️ Get Directions
          </a>
        )}
        {embed_iframe_url && (
          <a
            href={embed_iframe_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost"
          >
            🌐 View Embed
          </a>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
