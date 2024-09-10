import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('activitiesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many activities', () => {
    const queryData = {
      query: `
        query activities {
          activities {
            edges {
              node {
                title
                body
                type
                reminderAt
                dueAt
                completedAt
                id
                createdAt
                updatedAt
                authorId
                assigneeId
              }
            }
          }
        }
      `,
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.activities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const activities = edges[0].node;

        expect(activities).toHaveProperty('title');
        expect(activities).toHaveProperty('body');
        expect(activities).toHaveProperty('type');
        expect(activities).toHaveProperty('reminderAt');
        expect(activities).toHaveProperty('dueAt');
        expect(activities).toHaveProperty('completedAt');
        expect(activities).toHaveProperty('id');
        expect(activities).toHaveProperty('createdAt');
        expect(activities).toHaveProperty('updatedAt');
        expect(activities).toHaveProperty('authorId');
        expect(activities).toHaveProperty('assigneeId');
      });
  });
});