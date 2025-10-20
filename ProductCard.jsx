import React from 'react';

const ProductCard = ({ product }) => {
  const fallbackImage = 'https://via.placeholder.com/200?text=No+Image';

  // Handle broken image URLs
  const handleError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };

  // If no product data, render nothing
  if (!product) return null;

  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden 
                  transform transition-all duration-500 
                  hover:scale-[1.02] hover:shadow-3xl hover:-translate-y-1 p-4 relative">
      
      <img 
        src={product.imageUrl || fallbackImage}
        alt={product.name || 'Product Image'}
        className="w-full h-48 object-cover rounded-lg mb-4 
                   transition-transform duration-500 group-hover:scale-105"
        onError={handleError}
      />
      
      <div className="space-y-2">
        <h4 className="text-xl font-extrabold 
                   text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          {product.name || 'Unnamed Product'}
        </h4>

        <p className="text-sm text-gray-200 line-clamp-3">
          {product.generatedDescription || 'No description available.'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
