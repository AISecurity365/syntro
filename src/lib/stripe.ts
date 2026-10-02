import Stripe from 'stripe';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('Stripe secret key not configured. Payment features will not work.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  : null;

// Course pricing configuration
export const COURSE_CONFIG = {
  // Curso Wazuh Intensivo
  wazuh: {
    name: 'Curso Intensivo Wazuh',
    description: 'Aprende a implementar y gestionar Wazuh para cumplimiento ENS',
    priceId: import.meta.env.STRIPE_WAZUH_PRICE_ID || '',
    priceAmount: 50_00, // €50 in cents
    currency: 'eur',
  }
};

// Support plan pricing configuration
export const SOPORTE_CONFIG = {
  '5h': {
    name: 'Bolsa de Soporte Técnico 5 horas',
    description: '5 horas prepagadas de soporte técnico profesional. Sin caducidad.',
    priceAmount: 185_00, // €185 in cents
    currency: 'eur',
  },
  '10h': {
    name: 'Bolsa de Soporte Técnico 10 horas',
    description: '10 horas prepagadas de soporte técnico profesional. Sin caducidad. Atención prioritaria.',
    priceAmount: 350_00, // €350 in cents
    currency: 'eur',
  },
  '20h': {
    name: 'Bolsa de Soporte Técnico 20 horas',
    description: '20 horas prepagadas de soporte técnico profesional. Sin caducidad. Atención VIP.',
    priceAmount: 600_00, // €600 in cents
    currency: 'eur',
  },
} as const;

export type SoportePlanId = keyof typeof SOPORTE_CONFIG;

export async function createSoporteCheckoutSession(
  planId: SoportePlanId,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const plan = SOPORTE_CONFIG[planId];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.priceAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'soporte',
      plan_id: planId,
    },
  });

  return session;
}

export async function createCheckoutSession(
  courseId: keyof typeof COURSE_CONFIG,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const course = COURSE_CONFIG[courseId];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: customerEmail,
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: course.currency,
          product_data: {
            name: course.name,
            description: course.description,
          },
          unit_amount: course.priceAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      course_id: courseId,
      customer_email: customerEmail,
    },
  });

  return session;
}

export async function verifyPayment(sessionId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    paid: session.payment_status === 'paid',
    email: session.customer_email,
    courseId: session.metadata?.course_id,
  };
}
