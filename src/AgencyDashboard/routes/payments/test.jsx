import React from 'react';

const TestPaymentService = () => {
  const testPaymentService = async () => {
    try {
      console.log('🧪 Testing PaymentService import...');
      
      // Test dynamic import
      const PaymentService = await import('../../../services/PaymentService');
      console.log('✅ PaymentService imported successfully:', PaymentService);
      
      // Test API call
      const result = await PaymentService.default.getPayments(true);
      console.log('📊 API Result:', result);
      
      if (result.success) {
        console.log('✅ Success! Payments:', result.data?.length);
        console.log('🏢 Agency:', result.agency?.name);
      } else {
        console.log('❌ Failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test PaymentService</h2>
      <button 
        onClick={testPaymentService}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test PaymentService
      </button>
    </div>
  );
};

export default TestPaymentService;
