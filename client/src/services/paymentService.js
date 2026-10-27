import api from './api';

export const paymentService = {
  async processDemoPayment(bookingId, action, paymentMethod = 'Demo Card') {
    const res = await api.post('/payments/demo', {
      bookingId,
      action,
      paymentMethod
    });
    return res.data;
  },

  async getPaymentById(id) {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  }
};

