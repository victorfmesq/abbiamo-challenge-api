/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Root', () => {
    it('/ (GET) - should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Authentication', () => {
    it('/auth/login (POST) - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'operador@abbiamo.com',
          password: 'abbiamo2024',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toMatchObject({
            id: '1',
            name: 'Operador Logístico',
            email: 'operador@abbiamo.com',
            role: 'operator',
          });
        });
    });

    it('/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@email.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('/auth/login (POST) - should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('Deliveries - List', () => {
    it('/deliveries (GET) - should return paginated deliveries', () => {
      return request(app.getHttpServer())
        .get('/deliveries')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toMatchObject({
            total: expect.any(Number),
            page: expect.any(Number),
            limit: expect.any(Number),
            totalPages: expect.any(Number),
          });
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/deliveries (GET) - should filter by status', () => {
      return request(app.getHttpServer())
        .get('/deliveries?status=DELIVERED')
        .expect(200)
        .expect((res) => {
          const deliveries = res.body.data;
          deliveries.forEach((delivery) => {
            expect(delivery.status).toBe('DELIVERED');
          });
        });
    });

    it('/deliveries (GET) - should search by tracking code', () => {
      return request(app.getHttpServer())
        .get('/deliveries')
        .expect(200)
        .then((res) => {
          const firstDelivery = res.body.data[0];
          const trackingCode = firstDelivery.tracking_code;

          return request(app.getHttpServer())
            .get(`/deliveries?search=${trackingCode}`)
            .expect(200)
            .expect((searchRes) => {
              expect(searchRes.body.data.length).toBeGreaterThan(0);
              expect(searchRes.body.data[0].tracking_code).toBe(trackingCode);
            });
        });
    });

    it('/deliveries (GET) - should paginate results', () => {
      return request(app.getHttpServer())
        .get('/deliveries?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('/deliveries (GET) - should sort by tracking_code', () => {
      return request(app.getHttpServer())
        .get('/deliveries?sortBy=tracking_code&sortOrder=asc&limit=50')
        .expect(200)
        .expect((res) => {
          const deliveries = res.body.data;
          for (let i = 0; i < deliveries.length - 1; i++) {
            expect(
              deliveries[i].tracking_code <= deliveries[i + 1].tracking_code,
            ).toBe(true);
          }
        });
    });

    it('/deliveries (GET) - should filter by date range', () => {
      const dateFrom = '2024-01-01';
      const dateTo = '2024-12-31';

      return request(app.getHttpServer())
        .get(`/deliveries?dateFrom=${dateFrom}&dateTo=${dateTo}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
        });
    });

    it('/deliveries (GET) - should return delivery with complete structure', () => {
      return request(app.getHttpServer())
        .get('/deliveries')
        .expect(200)
        .expect((res) => {
          const delivery = res.body.data[0];
          expect(delivery).toMatchObject({
            id: expect.any(String),
            tracking_code: expect.any(String),
            status: expect.any(String),
            priority: expect.any(String),
            recipient: {
              name: expect.any(String),
              phone: expect.any(String),
              document: expect.any(String),
              address: {
                street: expect.any(String),
                number: expect.any(String),
                neighborhood: expect.any(String),
                city: expect.any(String),
                state: expect.any(String),
                zip_code: expect.any(String),
                coordinates: {
                  lat: expect.any(Number),
                  lng: expect.any(Number),
                },
              },
            },
            created_at: expect.any(String),
            expected_delivery_at: expect.any(String),
            delivery_attempts: expect.any(Number),
            timeline: expect.any(Array),
          });
        });
    });
  });

  describe('Deliveries - Stats', () => {
    it('/deliveries/stats (GET) - should return KPIs', () => {
      return request(app.getHttpServer())
        .get('/deliveries/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            total: expect.any(Number),
            inRoute: {
              count: expect.any(Number),
              percentage: expect.any(String),
            },
            completed: {
              count: expect.any(Number),
              percentage: expect.any(String),
            },
            delayed: {
              count: expect.any(Number),
              percentage: expect.any(String),
            },
            byStatus: expect.any(Object),
          });
        });
    });

    it('/deliveries/stats (GET) - should have valid percentages', () => {
      return request(app.getHttpServer())
        .get('/deliveries/stats')
        .expect(200)
        .expect((res) => {
          const { inRoute, completed, delayed } = res.body;

          expect(parseFloat(inRoute.percentage)).toBeGreaterThanOrEqual(0);
          expect(parseFloat(inRoute.percentage)).toBeLessThanOrEqual(100);

          expect(parseFloat(completed.percentage)).toBeGreaterThanOrEqual(0);
          expect(parseFloat(completed.percentage)).toBeLessThanOrEqual(100);

          expect(parseFloat(delayed.percentage)).toBeGreaterThanOrEqual(0);
          expect(parseFloat(delayed.percentage)).toBeLessThanOrEqual(100);
        });
    });
  });

  describe('Deliveries - Details', () => {
    it('/deliveries/:id (GET) - should return delivery details', async () => {
      const listRes = await request(app.getHttpServer()).get('/deliveries');
      const deliveryId = listRes.body.data[0].id;

      return request(app.getHttpServer())
        .get(`/deliveries/${deliveryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(deliveryId);
          expect(res.body).toHaveProperty('tracking_code');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('priority');
          expect(res.body).toHaveProperty('recipient');
          expect(res.body).toHaveProperty('timeline');
          expect(Array.isArray(res.body.timeline)).toBe(true);
        });
    });

    it('/deliveries/:id (GET) - should return 404 for non-existent delivery', () => {
      return request(app.getHttpServer()).get('/deliveries/999999').expect(404);
    });

    it('/deliveries/:id (GET) - should return timeline with events', async () => {
      const listRes = await request(app.getHttpServer()).get('/deliveries');
      const deliveryId = listRes.body.data[0].id;

      return request(app.getHttpServer())
        .get(`/deliveries/${deliveryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.timeline.length).toBeGreaterThan(0);
          const event = res.body.timeline[0];
          expect(event).toMatchObject({
            id: expect.any(String),
            status: expect.any(String),
            timestamp: expect.any(String),
            actor: expect.any(String),
          });
        });
    });
  });

  describe('Deliveries - Bulk Actions', () => {
    let deliveryIds: string[];

    beforeEach(async () => {
      const res = await request(app.getHttpServer()).get('/deliveries?limit=5');
      deliveryIds = res.body.data.map((d) => d.id);
    });

    it('/deliveries/bulk/reschedule (PATCH) - should reschedule multiple deliveries', () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);

      return request(app.getHttpServer())
        .patch('/deliveries/bulk/reschedule')
        .send({
          deliveryIds: deliveryIds.slice(0, 3),
          newExpectedDate: newDate.toISOString(),
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            success: true,
            updated: 3,
            notFound: 0,
            notFoundIds: [],
          });
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(3);
        });
    });

    it('/deliveries/bulk/reschedule (PATCH) - should validate required fields', () => {
      return request(app.getHttpServer())
        .patch('/deliveries/bulk/reschedule')
        .send({
          deliveryIds: deliveryIds.slice(0, 2),
          // missing newExpectedDate
        })
        .expect(400);
    });

    it('/deliveries/bulk/reschedule (PATCH) - should handle non-existent IDs', () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);

      return request(app.getHttpServer())
        .patch('/deliveries/bulk/reschedule')
        .send({
          deliveryIds: ['999999', '999998'],
          newExpectedDate: newDate.toISOString(),
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            success: true,
            updated: 0,
            notFound: 2,
            notFoundIds: ['999999', '999998'],
          });
        });
    });

    it('/deliveries/bulk/assign-driver (PATCH) - should assign driver to multiple deliveries', () => {
      return request(app.getHttpServer())
        .patch('/deliveries/bulk/assign-driver')
        .send({
          deliveryIds: deliveryIds.slice(0, 3),
          driverName: 'Test Driver',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            success: true,
            updated: 3,
            notFound: 0,
          });

          res.body.data.forEach((delivery) => {
            expect(delivery.assigned_driver).toBe('Test Driver');
          });
        });
    });

    it('/deliveries/bulk/assign-driver (PATCH) - should validate required fields', () => {
      return request(app.getHttpServer())
        .patch('/deliveries/bulk/assign-driver')
        .send({
          deliveryIds: deliveryIds.slice(0, 2),
          // missing driverName
        })
        .expect(400);
    });

    it('/deliveries/bulk/priority (PATCH) - should update priority for multiple deliveries', () => {
      return request(app.getHttpServer())
        .patch('/deliveries/bulk/priority')
        .send({
          deliveryIds: deliveryIds.slice(0, 3),
          priority: 'URGENT',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            success: true,
            updated: 3,
            notFound: 0,
          });

          res.body.data.forEach((delivery) => {
            expect(delivery.priority).toBe('URGENT');
          });
        });
    });

    it('/deliveries/bulk/priority (PATCH) - should validate priority enum', () => {
      return request(app.getHttpServer())
        .patch('/deliveries/bulk/priority')
        .send({
          deliveryIds: deliveryIds.slice(0, 2),
          priority: 'INVALID_PRIORITY',
        })
        .expect(400);
    });

    it('/deliveries/bulk/priority (PATCH) - should accept all valid priorities', async () => {
      const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

      for (const priority of priorities) {
        await request(app.getHttpServer())
          .patch('/deliveries/bulk/priority')
          .send({
            deliveryIds: [deliveryIds[0]],
            priority,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data[0].priority).toBe(priority);
          });
      }
    });

    it('bulk actions should update timeline with correct notes', async () => {
      const deliveryId = deliveryIds[0];

      // Get original timeline length
      const beforeRes = await request(app.getHttpServer()).get(
        `/deliveries/${deliveryId}`,
      );
      const originalTimelineLength = beforeRes.body.timeline.length;

      // Perform bulk action
      await request(app.getHttpServer())
        .patch('/deliveries/bulk/assign-driver')
        .send({
          deliveryIds: [deliveryId],
          driverName: 'Timeline Test Driver',
        })
        .expect(200);

      // Check timeline was updated
      return request(app.getHttpServer())
        .get(`/deliveries/${deliveryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.timeline.length).toBe(originalTimelineLength + 1);

          const latestEvent = res.body.timeline[0];
          expect(latestEvent.actor).toBe('Operador Logístico');
          expect(latestEvent.notes).toContain('Timeline Test Driver');
        });
    });
  });

  describe('Integration - Full workflow', () => {
    it('should complete a full delivery management workflow', async () => {
      // 1. Login
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'operador@abbiamo.com',
          password: 'abbiamo2024',
        })
        .expect(200);

      expect(loginRes.body.token).toBeDefined();

      // 2. Get dashboard stats
      const statsRes = await request(app.getHttpServer())
        .get('/deliveries/stats')
        .expect(200);

      expect(statsRes.body.total).toBeGreaterThan(0);

      // 3. List deliveries with filters
      const listRes = await request(app.getHttpServer())
        .get('/deliveries?status=PENDING&limit=5')
        .expect(200);

      // 4. Get details of first delivery
      if (listRes.body.data.length > 0) {
        const deliveryId = listRes.body.data[0].id;

        const detailsRes = await request(app.getHttpServer())
          .get(`/deliveries/${deliveryId}`)
          .expect(200);

        expect(detailsRes.body.id).toBe(deliveryId);

        // 5. Perform bulk action
        await request(app.getHttpServer())
          .patch('/deliveries/bulk/priority')
          .send({
            deliveryIds: [deliveryId],
            priority: 'HIGH',
          })
          .expect(200);

        // 6. Verify the change
        const updatedRes = await request(app.getHttpServer())
          .get(`/deliveries/${deliveryId}`)
          .expect(200);

        expect(updatedRes.body.priority).toBe('HIGH');
      }
    });
  });
});
