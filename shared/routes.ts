import { z } from 'zod';
import { 
  insertUserSchema, insertTripSchema, insertPlaceSchema, insertExpenseSchema, 
  type User, type Trip, type Place, type Expense, type Member
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<User>(), // Return user on success
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  trips: {
    list: {
      method: 'GET' as const,
      path: '/api/trips' as const,
      responses: {
        200: z.array(z.custom<Trip>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trips/:id' as const,
      responses: {
        200: z.custom<Trip & { places: Place[], members: (Member & { user: User })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips' as const,
      input: insertTripSchema,
      responses: {
        201: z.custom<Trip>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/trips/:id' as const,
      input: insertTripSchema.partial(),
      responses: {
        200: z.custom<Trip>(),
        404: errorSchemas.notFound,
      },
    },
  },
  places: {
    create: {
      method: 'POST' as const,
      path: '/api/trips/:id/places' as const,
      input: insertPlaceSchema.omit({ tripId: true }),
      responses: {
        201: z.custom<Place>(),
      },
    },
    reorder: {
      method: 'PUT' as const,
      path: '/api/trips/:id/places/reorder' as const,
      input: z.object({
        placeIds: z.array(z.string()),
      }),
      responses: {
        200: z.array(z.custom<Place>()),
      },
    },
  },
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/trips/:id/expenses' as const,
      responses: {
        200: z.array(z.custom<Expense>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips/:id/expenses' as const,
      input: insertExpenseSchema.omit({ tripId: true, userId: true }), // Backend infers userId from session
      responses: {
        201: z.custom<Expense>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
