import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, CheckCircle, AlertCircle, ExternalLink, ShieldCheck, Download, Tag, Check } from 'lucide-react';
import { useStore, Discount } from '../../contexts/StoreContext';
import { NotFoundPage } from './NotFoundPage';

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { paypalEmail, recordSale, recordDownload, getProduct, discounts, getActiveFlashSale } = useStore();
  const [error, setError] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const activeFlashSale = getActiveFlashSale();

  const statusParam = searchParams.get('status');
  const productParamId = searchParams.get('productId');
  const productParamType = searchParams.get('productType') as 'Single Beat' | 'Beat Pack' | null;

  // Fallback to state if directly navigated from storefront
  const productInfo = (location.state as { productId: string, productType: 'Single Beat' | 'Beat Pack', licenseId?: string } | null) 
    || (productParamId && productParamType ? { productId: productParamId, productType: productParamType } : null);

  useEffect(() => {
    if (statusParam === 'cancelled') {
      setError("PayPal payment was cancelled.");
    }
    if (statusParam === 'success' && productInfo) {
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      recordSale({
        orderId,
        productId: productInfo.productId,
        productType: productInfo.productType,
        amount: parseFloat(formattedPrice) || 39.99,
        date: new Date().toISOString(),
        status: 'Completed',
        license: productInfo.licenseId || 'Standard Lease',
        customer: 'PayPal Customer'
      });
      recordDownload({
        productId: productInfo.productId,
        productTitle: itemTitle,
        productType: productInfo.productType,
        type: 'Paid'
      });
    }
  }, [statusParam]);

  if (!productInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-20">
        <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm">Select a product from the store to checkout.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">
          Return to Store
        </button>
      </div>
    );
  }

  // Retrieve the real product details
  const product = getProduct(productInfo.productId, productInfo.productType);
  
  if (!product) {
    return <NotFoundPage type={productInfo.productType === 'Beat Pack' ? 'pack' : 'beat'} />;
  }

  // Calculate actual selling price from product record / license
  const actualPrice = productInfo.licenseId && product.licenses 
    ? (product.licenses.find((l: any) => l.name === productInfo.licenseId)?.price || product.price || '39.99')
    : (product.price || '39.99');

  const rawBasePrice = typeof actualPrice === 'number' ? actualPrice : parseFloat(actualPrice) || 39.99;
  
  // Calculate Flash Sale discount if active
  let flashSaleDiscountAmount = 0;
  let flashSaleLabel = '';
  const isBeatPack = productInfo.productType === 'Beat Pack';

  if (activeFlashSale) {
    if (!isBeatPack || activeFlashSale.includeBeatPacks !== false) {
      if (activeFlashSale.discountType === 'Percentage') {
        flashSaleDiscountAmount = (rawBasePrice * (activeFlashSale.discountValue || 0)) / 100;
        flashSaleLabel = `${activeFlashSale.discountValue}% OFF`;
      } else {
        flashSaleDiscountAmount = activeFlashSale.discountValue || 0;
        flashSaleLabel = `$${activeFlashSale.discountValue} OFF`;
      }
    }
  }

  // Calculate Promo Code discount
  let promoDiscountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.discountType === 'Percentage') {
      promoDiscountAmount = (rawBasePrice * appliedDiscount.discountValue) / 100;
    } else {
      promoDiscountAmount = appliedDiscount.discountValue;
    }
  }

  // Pick maximum active discount (no double stacking)
  const discountAmount = Math.max(flashSaleDiscountAmount, promoDiscountAmount);
  const isFlashSaleApplied = flashSaleDiscountAmount > 0 && flashSaleDiscountAmount >= promoDiscountAmount;

  const finalPrice = Math.max(0, rawBasePrice - discountAmount);
  const formattedPrice = rawBasePrice.toFixed(2);
  const finalFormattedPrice = finalPrice.toFixed(2);
  const itemTitle = product.title || product.packName || 'NightRunna Instrumental';

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoInput.trim()) return;

    const matched = discounts.find(d => d.code.toLowerCase() === promoInput.trim().toLowerCase());
    if (!matched) {
      setPromoError('Invalid promo code');
      return;
    }
    if (matched.status !== 'Active') {
      setPromoError('This promo code is no longer active');
      return;
    }
    if (matched.expirationDate && new Date(matched.expirationDate) < new Date()) {
      setPromoError('This promo code has expired');
      return;
    }
    setAppliedDiscount(matched);
    setPromoError(null);
  };

  const handleManualDownload = () => {
    recordDownload({
      productId: product.id || product.packId,
      productTitle: itemTitle,
      productType: productInfo.productType,
      type: 'Paid'
    });

    const downloadableFile = product.freeDownloadFile || product.packFile;
    if (downloadableFile) {
      const url = URL.createObjectURL(downloadableFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadableFile.name || `${itemTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("Preparing high-quality audio file package download...");
    }
  };

  if (statusParam === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Payment Confirmed!</h1>
        <p className="text-zinc-400 mb-8">Your transaction has been processed through PayPal. Your audio files are ready for download below.</p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-bold text-white mb-3">Order Summary & Access</h3>
          <div className="space-y-2 text-sm text-zinc-300">
            <p><strong>Item:</strong> {itemTitle}</p>
            <p><strong>Type:</strong> {productInfo.productType}</p>
            {productInfo.licenseId && <p><strong>License:</strong> {productInfo.licenseId}</p>}
            <p><strong>Price Paid:</strong> ${formattedPrice} USD</p>
            <p><strong>Seller PayPal Account:</strong> {paypalEmail}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <button 
              onClick={handleManualDownload}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Download Purchased Audio Files
            </button>
          </div>
        </div>

        <button 
          onClick={() => navigate('/studio/sales')} 
          className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
        >
          View Sales Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-indigo-500" /> NightRunna Checkout
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 space-y-4">
        <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div>
            <p className="font-bold text-zinc-200">{itemTitle}</p>
            <p className="text-sm text-zinc-500">{productInfo.productType} {productInfo.licenseId ? `• ${productInfo.licenseId}` : ''}</p>
          </div>
          <div className="text-right">
            {discountAmount > 0 ? (
              <>
                <p className="text-xs text-zinc-500 line-through">${formattedPrice}</p>
                <p className="font-bold text-xl text-emerald-400">${finalFormattedPrice}</p>
              </>
            ) : (
              <p className="font-bold text-xl text-white">${formattedPrice}</p>
            )}
          </div>
        </div>

        {/* Applied Flash Sale Discount Banner */}
        {isFlashSaleApplied && activeFlashSale && (
          <div className="flex justify-between items-center py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-bold">
            <span className="flex items-center gap-2">
              🔥 Flash Sale Discount ({flashSaleLabel} - {activeFlashSale.title})
            </span>
            <span>-${flashSaleDiscountAmount.toFixed(2)} USD</span>
          </div>
        )}

        {/* Applied Promo Code Banner */}
        {appliedDiscount && (
          <div className="flex justify-between items-center py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 font-bold">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4" /> Code {appliedDiscount.code} ({appliedDiscount.discountValue}{appliedDiscount.discountType === 'Percentage' ? '%' : '$'} OFF)
            </span>
            <span>-${discountAmount.toFixed(2)} USD</span>
          </div>
        )}

        {/* Promo Code Input Form */}
        {!appliedDiscount ? (
          <form onSubmit={handleApplyPromo} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Enter promo code..."
              value={promoInput}
              onChange={e => setPromoInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-lg transition-colors"
            >
              Apply
            </button>
          </form>
        ) : (
          <button
            onClick={() => { setAppliedDiscount(null); setPromoInput(''); }}
            className="text-xs text-zinc-400 hover:text-red-400 underline"
          >
            Remove Promo Code
          </button>
        )}

        {promoError && (
          <p className="text-xs text-red-400 font-medium">{promoError}</p>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-sm font-bold">
          <span className="text-zinc-400">Total Due</span>
          <span className="text-indigo-400 text-xl font-extrabold">
            ${finalFormattedPrice} USD
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-500">Checkout Notice</h4>
            <p className="text-sm text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Real PayPal Hosted Checkout (Standard Form submit directly to PayPal) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-zinc-300 text-sm font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Receiving Account: <span className="text-white font-bold">{paypalEmail}</span>
        </div>

        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          {/* PayPal Command parameters */}
          <input type="hidden" name="cmd" value="_xclick" />
          <input type="hidden" name="business" value={paypalEmail} />
          <input type="hidden" name="item_name" value={`${productInfo.productType}: ${itemTitle}${appliedDiscount ? ` (Promo ${appliedDiscount.code})` : ''}`} />
          <input type="hidden" name="amount" value={finalFormattedPrice} />
          <input type="hidden" name="currency_code" value="USD" />
          <input type="hidden" name="no_shipping" value="1" />
          <input type="hidden" name="return" value={`${window.location.origin}/checkout?status=success&productId=${productInfo.productId}&productType=${encodeURIComponent(productInfo.productType)}`} />
          <input type="hidden" name="cancel_return" value={`${window.location.origin}/checkout?status=cancelled`} />

          <button 
            type="submit" 
            className="w-full py-4 bg-[#ffc439] hover:bg-[#f2ba32] text-[#003087] font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            <span>Pay with</span>
            <span className="italic font-black text-[#003087]">PayPal</span>
            <ExternalLink className="w-5 h-5 ml-1 opacity-70" />
          </button>
        </form>

        <p className="text-xs text-zinc-500 mt-4">
          You will be redirected securely to PayPal to finalize your payment. No credit card information is stored on this site.
        </p>
      </div>
    </div>
  );
}
