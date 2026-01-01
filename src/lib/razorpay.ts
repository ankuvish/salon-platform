// Razorpay Payment Integration for India

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (
  amount: number,
  bookingDetails: {
    salonName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  },
  onSuccess: (paymentId: string, orderId: string, signature: string) => void,
  onFailure: (error: any) => void
) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    onFailure(new Error('Razorpay SDK failed to load'));
    return;
  }

  try {
    // Create order on backend
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount * 100 }), // Convert to paise
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    const { orderId } = await response.json();

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'SalonHub',
      description: `Booking at ${bookingDetails.salonName}`,
      order_id: orderId,
      handler: function (response: any) {
        onSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      prefill: {
        name: bookingDetails.customerName,
        email: bookingDetails.customerEmail,
        contact: bookingDetails.customerPhone,
      },
      theme: {
        color: '#8B5CF6',
      },
    };

    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', function (response: any) {
      onFailure(response.error);
    });

    razorpay.open();
  } catch (error) {
    onFailure(error);
  }
};
